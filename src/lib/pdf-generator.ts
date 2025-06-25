import jsPDF from 'jspdf';
import { RegistrationFormData } from '@/lib/validation';

export async function generatePDF(formData: RegistrationFormData & { submissionId?: string; submissionTimestamp?: string }): Promise<Buffer> {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const lineHeight = 6;

  // Helper function to add text with automatic page breaks
  const addText = (text: string, x: number = margin, fontSize: number = 10, isBold: boolean = false) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    
    doc.text(text, x, yPosition);
    yPosition += lineHeight;
  };

  const addSection = (title: string) => {
    yPosition += 5;
    addText(title, margin, 12, true);
    yPosition += 2;
  };

  // Header
  addText('DANVILLE PEDIATRICS', margin, 16, true);
  addText('1-to-1 Pediatrics', margin, 12);
  addText('"Hometown Care for Your Child"', margin, 10);
  addText('Phone: (925) 362-1861', margin, 10);
  yPosition += 10;

  addText('PATIENT REGISTRATION FORM', margin, 14, true);
  addText(`Submission ID: ${formData.submissionId || 'N/A'}`, margin, 10);
  addText(`Submitted: ${new Date().toLocaleString()}`, margin, 10);
  yPosition += 10;

  // Patient Information
  addSection('PATIENT INFORMATION');
  addText(`Name: ${formData.patient.firstName} ${formData.patient.lastName}`);
  addText(`Date of Birth: ${formData.patient.dateOfBirth}`);
  addText(`Gender: ${formData.patient.gender}`);
  
  addText('Address:');
  addText(`  ${formData.patient.homeAddress.street}`);
  addText(`  ${formData.patient.homeAddress.city}, ${formData.patient.homeAddress.state} ${formData.patient.homeAddress.zipCode}`);
  
  if (formData.patient.phoneNumbers.home) {
    addText(`Home Phone: ${formData.patient.phoneNumbers.home}`);
  }
  if (formData.patient.phoneNumbers.cell) {
    addText(`Cell Phone: ${formData.patient.phoneNumbers.cell}`);
  }
  if (formData.patient.email) {
    addText(`Email: ${formData.patient.email}`);
  }

  // Parent/Guardian Information
  addSection('PRIMARY PARENT/GUARDIAN');
  addText(`Name: ${formData.parentGuardian1.firstName} ${formData.parentGuardian1.lastName}`);
  addText(`Relationship: ${formData.parentGuardian1.relationship}`);
  addText(`Email: ${formData.parentGuardian1.email}`);
  addText(`Primary Contact: ${formData.parentGuardian1.isPrimaryContact ? 'Yes' : 'No'}`);

  if (formData.parentGuardian1.phoneNumbers.cell) {
    addText(`Cell Phone: ${formData.parentGuardian1.phoneNumbers.cell}`);
  }
  if (formData.parentGuardian1.phoneNumbers.work) {
    addText(`Work Phone: ${formData.parentGuardian1.phoneNumbers.work}`);
  }

  // Second Parent/Guardian (if provided)
  if (formData.parentGuardian2) {
    addSection('SECONDARY PARENT/GUARDIAN');
    addText(`Name: ${formData.parentGuardian2.firstName} ${formData.parentGuardian2.lastName}`);
    addText(`Relationship: ${formData.parentGuardian2.relationship}`);
    addText(`Email: ${formData.parentGuardian2.email}`);
    addText(`Primary Contact: ${formData.parentGuardian2.isPrimaryContact ? 'Yes' : 'No'}`);

    if (formData.parentGuardian2.phoneNumbers.cell) {
      addText(`Cell Phone: ${formData.parentGuardian2.phoneNumbers.cell}`);
    }
    if (formData.parentGuardian2.phoneNumbers.work) {
      addText(`Work Phone: ${formData.parentGuardian2.phoneNumbers.work}`);
    }
  }

  // Primary Insurance
  addSection('PRIMARY INSURANCE');
  addText(`Company: ${formData.primaryInsurance.companyName}`);
  addText(`Policy Number: ${formData.primaryInsurance.policyNumber}`);
  if (formData.primaryInsurance.groupNumber) {
    addText(`Group Number: ${formData.primaryInsurance.groupNumber}`);
  }
  addText(`Subscriber: ${formData.primaryInsurance.subscriberName}`);
  addText(`Subscriber DOB: ${formData.primaryInsurance.subscriberDateOfBirth}`);
  addText(`Subscriber Relationship: ${formData.primaryInsurance.subscriberRelationship}`);

  // Secondary Insurance (if provided)
  if (formData.secondaryInsurance) {
    addSection('SECONDARY INSURANCE');
    addText(`Company: ${formData.secondaryInsurance.companyName}`);
    addText(`Policy Number: ${formData.secondaryInsurance.policyNumber}`);
    if (formData.secondaryInsurance.groupNumber) {
      addText(`Group Number: ${formData.secondaryInsurance.groupNumber}`);
    }
    addText(`Subscriber: ${formData.secondaryInsurance.subscriberName}`);
    addText(`Subscriber DOB: ${formData.secondaryInsurance.subscriberDateOfBirth}`);
    addText(`Subscriber Relationship: ${formData.secondaryInsurance.subscriberRelationship}`);
  }

  // Guarantor Information
  addSection('GUARANTOR INFORMATION');
  addText(`Name: ${formData.guarantor.firstName} ${formData.guarantor.lastName}`);
  addText(`Relationship to Patient: ${formData.guarantor.relationshipToPatient}`);
  if (formData.guarantor.socialSecurityNumber) {
    addText(`SSN: ${formData.guarantor.socialSecurityNumber}`);
  }
  addText(`Phone: ${formData.guarantor.phoneNumber}`);
  addText(`Email: ${formData.guarantor.email}`);
  
  addText('Address:');
  addText(`  ${formData.guarantor.address.street}`);
  addText(`  ${formData.guarantor.address.city}, ${formData.guarantor.address.state} ${formData.guarantor.address.zipCode}`);
  
  if (formData.guarantor.employer) {
    addText('Employer Information:');
    addText(`  Name: ${formData.guarantor.employer.name}`);
    addText(`  Address: ${formData.guarantor.employer.address}`);
    if (formData.guarantor.employer.phoneNumber) {
      addText(`  Phone: ${formData.guarantor.employer.phoneNumber}`);
    }
  }

  // Emergency Contacts
  addSection('PRIMARY EMERGENCY CONTACT');
  addText(`Name: ${formData.emergencyContact1.firstName} ${formData.emergencyContact1.lastName}`);
  addText(`Relationship: ${formData.emergencyContact1.relationship}`);
  
  if (formData.emergencyContact1.phoneNumbers.home) {
    addText(`Home Phone: ${formData.emergencyContact1.phoneNumbers.home}`);
  }
  if (formData.emergencyContact1.phoneNumbers.cell) {
    addText(`Cell Phone: ${formData.emergencyContact1.phoneNumbers.cell}`);
  }
  if (formData.emergencyContact1.phoneNumbers.work) {
    addText(`Work Phone: ${formData.emergencyContact1.phoneNumbers.work}`);
  }

  // Second Emergency Contact (if provided)
  if (formData.emergencyContact2) {
    addSection('SECONDARY EMERGENCY CONTACT');
    addText(`Name: ${formData.emergencyContact2.firstName} ${formData.emergencyContact2.lastName}`);
    addText(`Relationship: ${formData.emergencyContact2.relationship}`);
    
    if (formData.emergencyContact2.phoneNumbers.home) {
      addText(`Home Phone: ${formData.emergencyContact2.phoneNumbers.home}`);
    }
    if (formData.emergencyContact2.phoneNumbers.cell) {
      addText(`Cell Phone: ${formData.emergencyContact2.phoneNumbers.cell}`);
    }
    if (formData.emergencyContact2.phoneNumbers.work) {
      addText(`Work Phone: ${formData.emergencyContact2.phoneNumbers.work}`);
    }
  }

  // Consents and Agreements
  addSection('CONSENTS AND AGREEMENTS');
  addText(`Consent to Treatment: ${formData.consentToTreatment ? 'AGREED' : 'NOT AGREED'}`);
  addText(`HIPAA Acknowledgment: ${formData.hipaaAcknowledgment ? 'ACKNOWLEDGED' : 'NOT ACKNOWLEDGED'}`);
  addText(`Financial Policy Agreement: ${formData.financialPolicyAgreement ? 'AGREED' : 'NOT AGREED'}`);

  // Footer
  yPosition += 10;
  addText('This form was submitted electronically and is HIPAA compliant.', margin, 8);
  addText('For questions, please contact Danville Pediatrics at (925) 362-1861.', margin, 8);

  // Convert to buffer
  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
}
