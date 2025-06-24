import nodemailer from 'nodemailer';
import { RegistrationFormData } from '@/lib/validation';

interface EmailOptions {
  to: string;
  subject: string;
  submissionId: string;
  formData: RegistrationFormData;
  pdfAttachment: Buffer;
}

export async function sendSecureEmail(options: EmailOptions): Promise<void> {
  const { to, subject, submissionId, formData, pdfAttachment } = options;

  // Create transporter based on environment
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // For development only
    },
  });

  // Verify transporter configuration
  try {
    await transporter.verify();
  } catch (error) {
    console.error('SMTP configuration error:', error);
    throw new Error('Email service configuration error');
  }

  // Create email content
  const htmlContent = generateEmailHTML(formData, submissionId);
  const textContent = generateEmailText(formData, submissionId);

  // Email options
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: to,
    subject: subject,
    text: textContent,
    html: htmlContent,
    attachments: [
      {
        filename: `patient-registration-${submissionId}.pdf`,
        content: pdfAttachment,
        contentType: 'application/pdf',
      },
    ],
    // Security headers
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high',
    },
  };

  // Send email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      submissionId,
      to: to,
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
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
        <p><strong>Submitted:</strong> ${new Date(formData.submissionTimestamp!).toLocaleString()}</p>
      </div>

      <div class="section">
        <h2>Patient Information</h2>
        <p><span class="label">Name:</span> ${formData.patient.firstName} ${formData.patient.lastName}</p>
        <p><span class="label">Date of Birth:</span> ${formData.patient.dateOfBirth}</p>
        <p><span class="label">Gender:</span> ${formData.patient.gender}</p>
        ${formData.patient.socialSecurityNumber ? `<p><span class="label">SSN:</span> ${formData.patient.socialSecurityNumber}</p>` : ''}
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
        Primary Contact: ${formData.parentGuardian1.email}<br>
        Phone: ${formData.parentGuardian1.phoneNumbers.cell || formData.parentGuardian1.phoneNumbers.home || 'Not provided'}</p>
      </div>
    </body>
    </html>
  `;
}

function generateEmailText(formData: RegistrationFormData, submissionId: string): string {
  return `
NEW PATIENT REGISTRATION - DANVILLE PEDIATRICS

Submission ID: ${submissionId}
Submitted: ${new Date(formData.submissionTimestamp!).toLocaleString()}

PATIENT INFORMATION
Name: ${formData.patient.firstName} ${formData.patient.lastName}
Date of Birth: ${formData.patient.dateOfBirth}
Gender: ${formData.patient.gender}
${formData.patient.socialSecurityNumber ? `SSN: ${formData.patient.socialSecurityNumber}` : ''}

PRIMARY PARENT/GUARDIAN
Name: ${formData.parentGuardian1.firstName} ${formData.parentGuardian1.lastName}
Email: ${formData.parentGuardian1.email}
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
Primary Contact: ${formData.parentGuardian1.email}
Phone: ${formData.parentGuardian1.phoneNumbers.cell || formData.parentGuardian1.phoneNumbers.home || 'Not provided'}

This registration was submitted securely through the Danville Pediatrics HIPAA-compliant online form.
  `;
}
