import { NextRequest, NextResponse } from 'next/server';
import { registrationFormSchema } from '@/lib/validation';
import { encryptData, generateSubmissionId, createAuditLog, maskSensitiveData } from '@/lib/encryption';
import { generatePDF } from '@/lib/pdf-generator';
import { sendSecureEmail } from '@/lib/email-sender';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    console.log('Received form submission:', JSON.stringify(body, null, 2));
    
    // Validate the form data
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

    const formData = validationResult.data;
    
    // Generate submission ID and timestamp
    const submissionId = generateSubmissionId();
    const submissionTimestamp = new Date().toISOString();
    
    // Add metadata to form data
    const completeFormData = {
      ...formData,
      submissionId,
      submissionTimestamp,
    };

    // Create audit log entry
    const auditLog = createAuditLog(
      'FORM_SUBMISSION',
      'patient_registration',
      {
        submissionId,
        patientName: `${formData.patient.firstName} ${formData.patient.lastName}`,
        parentEmail: formData.parentGuardian1.email,
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
      fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      toEmail: process.env.PRACTICE_EMAIL || 'Admin@DanvillePediatrics.com'
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
          recipientEmail = 'drew@1to1pediatrics.com'; // Your verified test email
        }
        
        console.log('Sending email to (cleaned):', recipientEmail);
        
        await sendSecureEmail({
          to: recipientEmail,
          subject: `New Patient Registration - ${formData.patient.firstName} ${formData.patient.lastName}`,
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
      console.log('📧 Would send registration to:', process.env.PRACTICE_EMAIL || 'Admin@DanvillePediatrics.com');
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
