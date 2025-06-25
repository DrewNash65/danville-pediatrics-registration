import { z } from 'zod';

// Phone number validation
const phoneSchema = z.string()
  .regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Phone number must be in format (XXX) XXX-XXXX')
  .optional();

// Required phone number
const requiredPhoneSchema = z.string()
  .regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Phone number must be in format (XXX) XXX-XXXX');

// Email validation
const emailSchema = z.string().email('Invalid email address').optional();
const requiredEmailSchema = z.string().email('Invalid email address');

// Date validation
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

// SSN validation (optional)
const ssnSchema = z.string()
  .regex(/^\d{3}-\d{2}-\d{4}$/, 'SSN must be in format XXX-XX-XXXX')
  .optional();

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
  }).refine(data => data.home || data.cell, {
    message: 'At least one phone number is required',
  }),
  email: emailSchema,
});

// Parent/Guardian schema
export const parentGuardianSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phoneNumbers: z.object({
    cell: phoneSchema,
    work: phoneSchema,
  }).refine(data => data.cell || data.work, {
    message: 'At least one phone number is required',
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
  subscriberRelationship: z.string().min(1, 'Subscriber relationship is required'),
});

// Guarantor schema
export const guarantorSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  relationshipToPatient: z.string().min(1, 'Relationship to patient is required'),
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
  relationship: z.string().min(1, 'Relationship is required'),
  phoneNumbers: z.object({
    home: phoneSchema,
    cell: phoneSchema,
    work: phoneSchema,
  }).refine(data => data.home || data.cell || data.work, {
    message: 'At least one phone number is required',
  }),
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
});

export type RegistrationFormData = z.infer<typeof registrationFormSchema>;
