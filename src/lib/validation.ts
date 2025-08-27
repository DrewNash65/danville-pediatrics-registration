import { z } from 'zod';

// Phone number validation
const phoneSchema = z.string()
  .optional()
  .refine((val) => {
    if (!val || val === '') return true; // Allow empty
    return /^\(\d{3}\) \d{3}-\d{4}$/.test(val);
  }, 'Phone number must be in format (XXX) XXX-XXXX');

// Required phone number
const requiredPhoneSchema = z.string()
  .min(1, 'Phone number is required')
  .refine((val) => {
    return /^\(\d{3}\) \d{3}-\d{4}$/.test(val);
  }, 'Phone number must be in format (XXX) XXX-XXXX');

// Email validation
const emailSchema = z.string().trim().email('Invalid email address').optional();
const requiredEmailSchema = z.string().trim().email('Invalid email address');

// Date validation - MM-DD-YYYY format
const dateSchema = z.string().regex(/^\d{2}-\d{2}-\d{4}$/, 'Date must be in MM-DD-YYYY format');

// SSN validation (optional)
const ssnSchema = z.string()
  .optional()
  .refine((val) => {
    if (!val || val === '') return true; // Allow empty
    return /^\d{3}-\d{2}-\d{4}$/.test(val);
  }, 'SSN must be in format XXX-XX-XXXX');

// Address schema
const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
});

// Patient info schema
export const patientInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: dateSchema,
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']),
  homeAddress: addressSchema,
  phoneNumbers: z.object({
    home: phoneSchema,
    cell: phoneSchema,
  }).refine(data => {
    const hasHome = data.home && data.home.trim() !== '';
    const hasCell = data.cell && data.cell.trim() !== '';
    return hasHome || hasCell;
  }, {
    message: 'At least one phone number is required',
    path: ['root']
  }),
  email: emailSchema,
});

// Parent/Guardian schema
export const parentGuardianSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  relationship: z.string().optional(),
  phoneNumbers: z.object({
    cell: phoneSchema,
    work: phoneSchema,
  }).refine(data => {
    const hasCell = data.cell && data.cell.trim() !== '';
    const hasWork = data.work && data.work.trim() !== '';
    return hasCell || hasWork;
  }, {
    message: 'At least one phone number is required',
    path: ['root']
  }),
  email: requiredEmailSchema,
  isPrimaryContact: z.boolean(),
});

// Insurance schema
export const insuranceSchema = z.object({
  isPrimary: z.boolean(),
  companyName: z.string().min(1, 'Insurance company name is required'),
  policyNumber: z.string().min(1, 'Policy number is required'),
  groupNumber: z.string().optional(),
  subscriberName: z.string().min(1, 'Subscriber name is required'),
  subscriberDateOfBirth: dateSchema,
  subscriberRelationship: z.string().optional(),
  cardFrontImage: z.instanceof(File).optional(),
  cardBackImage: z.instanceof(File).optional(),
});

// Guarantor schema
export const guarantorSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  relationshipToPatient: z.string().optional(),
  socialSecurityNumber: ssnSchema,
  address: addressSchema,
  phoneNumber: requiredPhoneSchema,
  email: requiredEmailSchema,
  employer: z.object({
    name: z.string(),
    address: z.string(),
    phoneNumber: phoneSchema,
  }).optional(),
});

// Emergency contact schema
export const emergencyContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  relationship: z.string().optional(),
  phoneNumbers: z.object({
    home: phoneSchema,
    cell: phoneSchema,
    work: phoneSchema,
  }).refine(data => {
    const hasHome = data.home && data.home.trim() !== '';
    const hasCell = data.cell && data.cell.trim() !== '';
    const hasWork = data.work && data.work.trim() !== '';
    return hasHome || hasCell || hasWork;
  }, {
    message: 'At least one phone number is required',
    path: ['root']
  }),
});



// Consent signatory schema
export const consentSignatorySchema = z.object({
  signatoryName: z.string().min(1, 'Signatory name is required'),
  signatoryDateOfBirth: dateSchema.refine((date) => {
    if (!date) return false;
    const [month, day, year] = date.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  }, 'Signatory must be at least 18 years old'),
  electronicSignature: z.string().min(1, 'Electronic signature is required'),
  dateSigned: z.string().min(1, 'Date signed is required'),
});

// Main registration form schema
export const registrationFormSchema = z.object({
  patient: patientInfoSchema,
  parentGuardian1: parentGuardianSchema,
  parentGuardian2: parentGuardianSchema.optional(),
  primaryInsurance: insuranceSchema,
  secondaryInsurance: insuranceSchema.optional(),
  guarantor: guarantorSchema,
  emergencyContact1: emergencyContactSchema,
  emergencyContact2: emergencyContactSchema.optional(),
  consentToTreatment: z.boolean().refine(val => val === true, {
    message: 'Consent to treatment is required',
  }),
  hipaaAcknowledgment: z.boolean().refine(val => val === true, {
    message: 'HIPAA acknowledgment is required',
  }),
  financialPolicyAgreement: z.boolean().refine(val => val === true, {
    message: 'Financial policy agreement is required',
  }),
  consentSignatory: consentSignatorySchema,
});

export type RegistrationFormData = z.infer<typeof registrationFormSchema>;
