import { Resend } from 'resend';
import { RegistrationFormData } from '@/lib/validation';

interface EmailOptions {
  to: string;
  subject: string;
  submissionId: string;
  formData: RegistrationFormData & { submissionTimestamp?: string };
  pdfAttachment: Buffer;
}

export async function sendSecureEmail(options: EmailOptions): Promise<void> {
  const { to, subject, submissionId, formData, pdfAttachment } = options;

  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is required');
  }

  // Initialize Resend
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Create email content
  const htmlContent = generateEmailHTML(formData, submissionId);

  // Send email with Resend
  try {
    console.log('Sending email via Resend:', {
      from: (process.env.RESEND_FROM_EMAIL || 'noreply@1to1pediatrics.com').trim(),
      to: to.trim(),
      subject: subject,
      hasAttachment: !!pdfAttachment
    });

    const { data, error } = await resend.emails.send({
      from: (process.env.RESEND_FROM_EMAIL || 'noreply@1to1pediatrics.com').trim(), // Use Resend's verified domain
      to: [to.trim()],
      subject: subject,
      html: htmlContent,
      attachments: [
        {
          filename: `patient-registration-${submissionId}.pdf`,
          content: pdfAttachment,
        },
      ],
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
      },
    });

    if (error) {
      console.error('Resend email error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully via Resend:', {
      messageId: data?.id,
      submissionId,
      to: to.trim(),
    });
  } catch (error) {
    console.error('Email sending error:', error);
    console.error('Resend configuration:', {
      from: (process.env.RESEND_FROM_EMAIL || 'noreply@1to1pediatrics.com').trim(), // Using Resend's verified domain
      to: to.trim(),
      apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 7) + '...',
      apiKeyLength: process.env.RESEND_API_KEY?.length,
      nodeEnv: process.env.NODE_ENV,
      testMode: process.env.RESEND_TEST_MODE
    });
    
    if (error instanceof Error) {
      throw new Error(`Resend API error: ${error.message}`);
    }
    throw new Error('Failed to send email via Resend');
  }
}

function generateEmailHTML(formData: RegistrationFormData, submissionId: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Patient Registration</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .section { margin-bottom: 20px; }
        .label { font-weight: bold; color: #555; }
        .value { margin-left: 10px; }
        .footer { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin-top: 30px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>New Patient Registration - Danville Pediatrics</h1>
        <p><strong>Submission ID:</strong> ${submissionId}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <div class="section">
        <h2>Patient Information</h2>
        <p><span class="label">Name:</span> ${formData.patient.firstName} ${formData.patient.lastName}</p>
        <p><span class="label">Date of Birth:</span> ${formData.patient.dateOfBirth}</p>
        <p><span class="label">Gender:</span> ${formData.patient.gender}</p>
      </div>

      <div class="section">
        <h2>Primary Parent/Guardian</h2>
        <p><span class="label">Name:</span> ${formData.parentGuardian1.firstName} ${formData.parentGuardian1.lastName}</p>
        <p><span class="label">Email:</span> ${formData.parentGuardian1.email}</p>
        <p><span class="label">Relationship:</span> ${formData.parentGuardian1.relationship}</p>
        <p><span class="label">Primary Contact:</span> ${formData.parentGuardian1.isPrimaryContact ? 'Yes' : 'No'}</p>
      </div>

      <div class="section">
        <h2>Insurance Information</h2>
        <p><span class="label">Primary Insurance:</span> ${formData.primaryInsurance.companyName}</p>
        <p><span class="label">Policy Number:</span> ${formData.primaryInsurance.policyNumber}</p>
        <p><span class="label">Subscriber:</span> ${formData.primaryInsurance.subscriberName}</p>
        ${formData.secondaryInsurance ? `<p><span class="label">Secondary Insurance:</span> ${formData.secondaryInsurance.companyName}</p>` : ''}
      </div>

      <div class="section">
        <h2>Emergency Contact</h2>
        <p><span class="label">Name:</span> ${formData.emergencyContact1.firstName} ${formData.emergencyContact1.lastName}</p>
        <p><span class="label">Relationship:</span> ${formData.emergencyContact1.relationship}</p>
      </div>

      <div class="section">
        <h2>Consents</h2>
        <p><span class="label">Consent to Treatment:</span> ${formData.consentToTreatment ? '✓ Agreed' : '✗ Not Agreed'}</p>
        <p><span class="label">HIPAA Acknowledgment:</span> ${formData.hipaaAcknowledgment ? '✓ Acknowledged' : '✗ Not Acknowledged'}</p>
        <p><span class="label">Financial Policy:</span> ${formData.financialPolicyAgreement ? '✓ Agreed' : '✗ Not Agreed'}</p>
      </div>

      <div class="footer">
        <p><strong>Next Steps:</strong></p>
        <ul>
          <li>Review the attached PDF with complete registration details</li>
          <li>Contact the parent/guardian to schedule the first appointment</li>
          <li>Verify insurance information if needed</li>
          <li>Add patient to practice management system</li>
        </ul>
        <p><strong>Contact Information:</strong><br>
        Primary Contact: ${formData.parentGuardian1.email.trim()}<br>
        Phone: ${formData.parentGuardian1.phoneNumbers.cell || formData.parentGuardian1.phoneNumbers.work || 'Not provided'}</p>
      </div>
    </body>
    </html>
  `;
}

function generateEmailText(formData: RegistrationFormData, submissionId: string): string {
  return `
NEW PATIENT REGISTRATION - DANVILLE PEDIATRICS

Submission ID: ${submissionId}
Submitted: ${new Date().toLocaleString()}

PATIENT INFORMATION
Name: ${formData.patient.firstName} ${formData.patient.lastName}
Date of Birth: ${formData.patient.dateOfBirth}
Gender: ${formData.patient.gender}

PRIMARY PARENT/GUARDIAN
Name: ${formData.parentGuardian1.firstName} ${formData.parentGuardian1.lastName}
Email: ${formData.parentGuardian1.email.trim()}
Relationship: ${formData.parentGuardian1.relationship}
Primary Contact: ${formData.parentGuardian1.isPrimaryContact ? 'Yes' : 'No'}

INSURANCE INFORMATION
Primary Insurance: ${formData.primaryInsurance.companyName}
Policy Number: ${formData.primaryInsurance.policyNumber}
Subscriber: ${formData.primaryInsurance.subscriberName}
${formData.secondaryInsurance ? `Secondary Insurance: ${formData.secondaryInsurance.companyName}` : ''}

EMERGENCY CONTACT
Name: ${formData.emergencyContact1.firstName} ${formData.emergencyContact1.lastName}
Relationship: ${formData.emergencyContact1.relationship}

CONSENTS
Consent to Treatment: ${formData.consentToTreatment ? 'AGREED' : 'NOT AGREED'}
HIPAA Acknowledgment: ${formData.hipaaAcknowledgment ? 'ACKNOWLEDGED' : 'NOT ACKNOWLEDGED'}
Financial Policy: ${formData.financialPolicyAgreement ? 'AGREED' : 'NOT AGREED'}

NEXT STEPS:
- Review the attached PDF with complete registration details
- Contact the parent/guardian to schedule the first appointment
- Verify insurance information if needed
- Add patient to practice management system

Contact Information:
Primary Contact: ${formData.parentGuardian1.email.trim()}
Phone: ${formData.parentGuardian1.phoneNumbers.cell || formData.parentGuardian1.phoneNumbers.work || 'Not provided'}

This registration was submitted securely through the Danville Pediatrics HIPAA-compliant online form.
  `;
}
