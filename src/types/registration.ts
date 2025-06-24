export interface PatientInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  socialSecurityNumber?: string;
  homeAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phoneNumbers: {
    home?: string;
    cell?: string;
  };
  email?: string;
}

export interface ParentGuardianInfo {
  firstName: string;
  lastName: string;
  relationship: string;
  phoneNumbers: {
    home?: string;
    cell?: string;
    work?: string;
  };
  email: string;
  isPrimaryContact: boolean;
}

export interface InsuranceInfo {
  isPrimary: boolean;
  companyName: string;
  policyNumber: string;
  groupNumber?: string;
  subscriberName: string;
  subscriberDateOfBirth: string;
  subscriberRelationship: string;
  cardFrontImage?: File;
  cardBackImage?: File;
}

export interface GuarantorInfo {
  firstName: string;
  lastName: string;
  relationshipToPatient: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phoneNumber: string;
  email: string;
  employer?: {
    name: string;
    address: string;
    phoneNumber: string;
  };
}

export interface EmergencyContact {
  firstName: string;
  lastName: string;
  relationship: string;
  phoneNumbers: {
    home?: string;
    cell?: string;
    work?: string;
  };
}



export interface RegistrationFormData {
  patient: PatientInfo;
  parentGuardian1: ParentGuardianInfo;
  parentGuardian2?: ParentGuardianInfo;
  primaryInsurance: InsuranceInfo;
  secondaryInsurance?: InsuranceInfo;
  guarantor: GuarantorInfo;
  emergencyContact1: EmergencyContact;
  emergencyContact2?: EmergencyContact;
  consentToTreatment: boolean;
  hipaaAcknowledgment: boolean;
  financialPolicyAgreement: boolean;
  submissionTimestamp?: string;
  submissionId?: string;
}

export interface FormSubmissionResponse {
  success: boolean;
  submissionId?: string;
  message: string;
  errors?: string[];
}

export interface FileUploadResponse {
  success: boolean;
  filename?: string;
  url?: string;
  message: string;
}
