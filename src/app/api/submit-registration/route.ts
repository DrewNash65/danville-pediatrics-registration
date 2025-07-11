import { NextRequest, NextResponse } from 'next/server';
import { registrationFormSchema } from '@/lib/validation';
import { encryptData, generateSubmissionId, createAuditLog, maskSensitiveData } from '@/lib/encryption';
import { generatePDF } from '@/lib/pdf-generator';
import { sendSecureEmail } from '@/lib/email-sender';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body (FormData)
    const requestFormData = await request.formData();
    const formDataJson = requestFormData.get('formData') as string;

    if (!formDataJson) {
      return NextResponse.json(
        { success: false, message: 'No form data provided' },
        { status: 400 }
      );
    }

    const body = JSON.parse(formDataJson);
    console.log('Received form submission:', JSON.stringify(body, null, 2));

    // Add file attachments back to the form data
    const primaryCardFront = requestFormData.get('primaryInsuranceCardFront') as File | null;
    const primaryCardBack = requestFormData.get('primaryInsuranceCardBack') as File | null;
    const secondaryCardFront = requestFormData.get('secondaryInsuranceCardFront') as File | null;
    const secondaryCardBack = requestFormData.get('secondaryInsuranceCardBack') as File | null;

    console.log('API route - received files:', {
      primaryFront: !!primaryCardFront,
      primaryBack: !!primaryCardBack,
      secondaryFront: !!secondaryCardFront,
      secondaryBack: !!secondaryCardBack
    });

    // Log file details if they exist
    if (primaryCardFront) {
      console.log('Primary front file details:', {
        name: primaryCardFront.name,
        size: primaryCardFront.size,
        type: primaryCardFront.type
      });
    }
    if (primaryCardBack) {
      console.log('Primary back file details:', {
        name: primaryCardBack.name,
        size: primaryCardBack.size,
        type: primaryCardBack.type
      });
    }

    // Validate the form data WITHOUT files first (Zod might strip File objects)
    const validationResult = registrationFormSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('Validation errors:', validationResult.error.errors);
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid form data',
          errors: validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        },
        { status: 400 }
      );
    }

    const validatedFormData = validationResult.data;

    // Add files AFTER validation to preserve File objects (convert null to undefined for type compatibility)
    const bodyWithFiles = {
      ...validatedFormData,
      primaryInsurance: {
        ...validatedFormData.primaryInsurance,
        cardFrontImage: primaryCardFront || undefined,
        cardBackImage: primaryCardBack || undefined,
      },
      secondaryInsurance: validatedFormData.secondaryInsurance ? {
        ...validatedFormData.secondaryInsurance,
        cardFrontImage: secondaryCardFront || undefined,
        cardBackImage: secondaryCardBack || undefined,
      } : undefined,
    };

    console.log('Files added to validated data:', {
      primaryFront: !!bodyWithFiles.primaryInsurance.cardFrontImage,
      primaryBack: !!bodyWithFiles.primaryInsurance.cardBackImage,
      secondaryFront: !!bodyWithFiles.secondaryInsurance?.cardFrontImage,
      secondaryBack: !!bodyWithFiles.secondaryInsurance?.cardBackImage
    });

    // Generate submission ID and timestamp
    const submissionId = generateSubmissionId();
    const submissionTimestamp = new Date().toISOString();

    // Add metadata to form data (with files preserved)
    const completeFormData = {
      ...bodyWithFiles,
      submissionId,
      submissionTimestamp,
    };

    // Create audit log entry
    const auditLog = createAuditLog(
      'FORM_SUBMISSION',
      'patient_registration',
      {
        submissionId,
        patientName: `${validatedFormData.patient.firstName} ${validatedFormData.patient.lastName}`,
        parentEmail: validatedFormData.parentGuardian1.email,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    );

    console.log('Registration submission audit log:', {
      ...auditLog,
      details: maskSensitiveData(auditLog.details)
    });

    // Generate PDF from form data
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generatePDF(completeFormData);
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to generate PDF document' 
        },
        { status: 500 }
      );
    }

    // Send secure email with PDF attachment (if configured)
    console.log('Email configuration check:', {
      hasApiKey: !!process.env.RESEND_API_KEY,
      apiKeyNotPlaceholder: process.env.RESEND_API_KEY !== 'your-resend-api-key-here',
      fromEmail: (process.env.RESEND_FROM_EMAIL || 'admin@1to1pediatrics.com').trim(),
      toEmail: (process.env.PRACTICE_EMAIL || 'Admin@DanvillePediatrics.com').trim()
    });
    
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your-resend-api-key-here') {
      try {
        // Clean the email address (remove mailto: prefix if present)
        let recipientEmail = (process.env.PRACTICE_EMAIL || 'Admin@DanvillePediatrics.com')
          .replace(/^mailto:/i, '')
          .trim();
        
        // Handle test mode - can be controlled via environment variable
        if (process.env.RESEND_TEST_MODE === 'true') {
          console.log('⚠️  Test mode enabled - redirecting to test email');
          recipientEmail = 'drew@1to1pediatrics.com'.trim(); // Your verified test email
        }
        
        console.log('Sending email to (cleaned):', recipientEmail);
        
        await sendSecureEmail({
          to: recipientEmail.trim(),
          subject: `New Patient Registration - ${validatedFormData.patient.firstName} ${validatedFormData.patient.lastName}`,
          submissionId,
          formData: completeFormData,
          pdfAttachment: pdfBuffer,
        });
        console.log('Email sent successfully to:', recipientEmail);
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        return NextResponse.json(
          {
            success: false,
            message: 'Failed to send registration to practice. Please try again or contact the office directly.'
          },
          { status: 500 }
        );
      }
    } else {
      console.log('⚠️  EMAIL NOT CONFIGURED - Resend API key needed');
      console.log('📧 Would send registration to:', (process.env.PRACTICE_EMAIL || 'Admin@DanvillePediatrics.com').trim());
      console.log('📄 PDF generated successfully for submission:', submissionId);
      console.log('🔧 To enable email: Set RESEND_API_KEY in .env.local');
    }

    // Store encrypted form data (optional - for backup/audit purposes)
    try {
      encryptData(JSON.stringify(completeFormData));
      // Here you would typically save to a secure database
      // For now, we'll just log that the data was encrypted successfully
      console.log(`Form data encrypted and ready for storage. Submission ID: ${submissionId}`);
    } catch (encryptionError) {
      console.error('Data encryption warning:', encryptionError);
      // Don't fail the request for encryption issues, but log the warning
    }

    // Return success response
    const hasValidApiKey = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your-resend-api-key-here';
    const message = hasValidApiKey
      ? 'Registration submitted successfully. The practice has been notified via email.'
      : 'Registration submitted successfully. Email delivery requires Resend API configuration. Please contact the practice directly at (925) 362-1861.';

    return NextResponse.json({
      success: true,
      submissionId,
      message,
      emailConfigured: hasValidApiKey,
    });

  } catch (error) {
    console.error('Registration submission error:', error);
    console.error('Error details:', error instanceof Error ? error.stack : 'Unknown error');
    
    // Create error audit log
    const errorAuditLog = createAuditLog(
      'FORM_SUBMISSION_ERROR',
      'system',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    );
    
    console.log('Registration submission error audit log:', errorAuditLog);

    return NextResponse.json(
      { 
        success: false, 
        message: 'An unexpected error occurred. Please try again or contact our office at (925) 362-1861.' 
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}
