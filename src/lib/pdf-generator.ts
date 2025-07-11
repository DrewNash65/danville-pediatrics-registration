import jsPDF from 'jspdf';
import { RegistrationFormData } from '@/lib/validation';

// Helper function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  console.log('fileToBase64 called with file:', {
    name: file.name,
    size: file.size,
    type: file.type
  });

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      console.log('FileReader onload - result type:', typeof result, 'length:', result?.length);
      resolve(result);
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

// Helper function to add image to PDF
async function addImageToPDF(doc: jsPDF, file: File, title: string, yPos: number): Promise<number> {
  const margin = 20;

  try {
    console.log(`Converting ${title} to base64...`);
    const base64Data = await fileToBase64(file);
    console.log(`Base64 conversion successful for ${title}, length:`, base64Data.length);

    const pageWidth = doc.internal.pageSize.width;
    const maxWidth = pageWidth - (margin * 2);
    const maxHeight = 100; // Maximum height for insurance card images

    // Add title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, yPos);
    yPos += 10;

    // Add image - try different formats
    try {
      // Determine image format from file type
      let format = 'JPEG';
      if (file.type.includes('png')) {
        format = 'PNG';
      } else if (file.type.includes('gif')) {
        format = 'GIF';
      } else if (file.type.includes('webp')) {
        format = 'WEBP';
      }

      // Try to add the image with proper dimensions
      console.log(`Attempting to add image with format: ${format}, base64 length: ${base64Data.length}`);
      try {
        doc.addImage(base64Data, format, margin, yPos, maxWidth, maxHeight);
        console.log(`Successfully added image as ${format}`);
        yPos += maxHeight + 10;
      } catch (formatError) {
        // If the specific format fails, try JPEG as fallback
        console.warn(`Failed to add image as ${format}, trying JPEG:`, formatError);
        try {
          doc.addImage(base64Data, 'JPEG', margin, yPos, maxWidth, maxHeight);
          console.log('Successfully added image as JPEG fallback');
          yPos += maxHeight + 10;
        } catch (jpegError) {
          console.error('Failed to add image as JPEG:', jpegError);
          console.error('Base64 data sample:', base64Data.substring(0, 100));
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text('(Image could not be displayed in PDF)', margin, yPos);
          yPos += 10;
        }
      }

    } catch (imageError) {
      console.warn('Failed to process image for PDF:', imageError);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('(Image could not be displayed in PDF)', margin, yPos);
      yPos += 10;
    }

    return yPos;
  } catch (error) {
    console.warn('Failed to process image for PDF:', error);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('(Image could not be processed)', margin, yPos);
    return yPos + 10;
  }
}

export async function generatePDF(formData: RegistrationFormData & { submissionId?: string; submissionTimestamp?: string }): Promise<Buffer> {
  console.log('🔧 PDF Generation Started');
  console.log('📄 Form data received:', {
    hasPatient: !!formData.patient,
    hasPrimaryInsurance: !!formData.primaryInsurance,
    hasSecondaryInsurance: !!formData.secondaryInsurance,
    primaryFrontImage: !!formData.primaryInsurance?.cardFrontImage,
    primaryBackImage: !!formData.primaryInsurance?.cardBackImage
  });

  const doc = new jsPDF();
  console.log('📄 jsPDF instance created successfully');
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
    addText(`Email: ${formData.patient.email.trim()}`);
  }

  // Parent/Guardian Information
  addSection('PRIMARY PARENT/GUARDIAN');
  addText(`Name: ${formData.parentGuardian1.firstName} ${formData.parentGuardian1.lastName}`);
  addText(`Relationship: ${formData.parentGuardian1.relationship}`);
  addText(`Email: ${formData.parentGuardian1.email.trim()}`);
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
    addText(`Email: ${formData.parentGuardian2.email.trim()}`);
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

  // Add insurance card images if available
  console.log('Checking for primary insurance images:', {
    frontImage: !!formData.primaryInsurance.cardFrontImage,
    backImage: !!formData.primaryInsurance.cardBackImage
  });

  console.log('🖼️ Reached image processing section');
  console.log('📊 Checking for primary insurance images:', {
    frontImage: !!formData.primaryInsurance.cardFrontImage,
    backImage: !!formData.primaryInsurance.cardBackImage
  });

  // Debug: Check the actual type and properties of the image objects
  if (formData.primaryInsurance.cardFrontImage) {
    console.log('Primary front image type:', typeof formData.primaryInsurance.cardFrontImage);
    console.log('Primary front image instanceof File:', formData.primaryInsurance.cardFrontImage instanceof File);
    console.log('Primary front image properties:', {
      name: formData.primaryInsurance.cardFrontImage.name || 'no name',
      size: formData.primaryInsurance.cardFrontImage.size || 'no size',
      type: formData.primaryInsurance.cardFrontImage.type || 'no type'
    });
  }

  if (formData.primaryInsurance.cardFrontImage) {
    console.log('Adding primary front image to PDF');
    try {
      yPosition = await addImageToPDF(doc, formData.primaryInsurance.cardFrontImage, 'Primary Insurance Card - Front', yPosition + 5);
      console.log('Successfully added primary front image to PDF');
    } catch (error) {
      console.error('Failed to add primary front image:', error);
    }
  }
  if (formData.primaryInsurance.cardBackImage) {
    console.log('Adding primary back image to PDF');
    try {
      yPosition = await addImageToPDF(doc, formData.primaryInsurance.cardBackImage, 'Primary Insurance Card - Back', yPosition + 5);
      console.log('Successfully added primary back image to PDF');
    } catch (error) {
      console.error('Failed to add primary back image:', error);
    }
  }

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

    // Add secondary insurance card images if available
    console.log('Checking for secondary insurance images:', {
      frontImage: !!formData.secondaryInsurance.cardFrontImage,
      backImage: !!formData.secondaryInsurance.cardBackImage
    });

    if (formData.secondaryInsurance.cardFrontImage) {
      console.log('Adding secondary front image to PDF');
      try {
        yPosition = await addImageToPDF(doc, formData.secondaryInsurance.cardFrontImage, 'Secondary Insurance Card - Front', yPosition + 5);
        console.log('Successfully added secondary front image to PDF');
      } catch (error) {
        console.error('Failed to add secondary front image:', error);
      }
    }
    if (formData.secondaryInsurance.cardBackImage) {
      console.log('Adding secondary back image to PDF');
      try {
        yPosition = await addImageToPDF(doc, formData.secondaryInsurance.cardBackImage, 'Secondary Insurance Card - Back', yPosition + 5);
        console.log('Successfully added secondary back image to PDF');
      } catch (error) {
        console.error('Failed to add secondary back image:', error);
      }
    }
  }

  // Guarantor Information
  addSection('GUARANTOR INFORMATION');
  addText(`Name: ${formData.guarantor.firstName} ${formData.guarantor.lastName}`);
  addText(`Relationship to Patient: ${formData.guarantor.relationshipToPatient}`);
  if (formData.guarantor.socialSecurityNumber) {
    addText(`SSN: ${formData.guarantor.socialSecurityNumber}`);
  }
  addText(`Phone: ${formData.guarantor.phoneNumber}`);
  addText(`Email: ${formData.guarantor.email.trim()}`);
  
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
  console.log('📄 Converting PDF to buffer...');
  const pdfOutput = doc.output('arraybuffer');
  console.log('✅ PDF generation completed successfully');
  return Buffer.from(pdfOutput);
}
