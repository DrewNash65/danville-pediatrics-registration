'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registrationFormSchema, type RegistrationFormData } from '@/lib/validation';
import { PatientInfoSection } from './FormSections/PatientInfoSection';
import { ParentGuardianSection } from './FormSections/ParentGuardianSection';
import { InsuranceSection } from './FormSections/InsuranceSection';
import { GuarantorSection } from './FormSections/GuarantorSection';
import { EmergencyContactSection } from './FormSections/EmergencyContactSection';
import { ConsentSection } from './FormSections/ConsentSection';
import { ProgressIndicator } from './ProgressIndicator';
import { LoadingSpinner } from './LoadingSpinner';

const FORM_STEPS = [
  { id: 'patient', title: 'Patient Information', component: PatientInfoSection },
  { id: 'parents', title: 'Parent/Guardian Information', component: ParentGuardianSection },
  { id: 'insurance', title: 'Insurance Information', component: InsuranceSection },
  { id: 'guarantor', title: 'Guarantor Information', component: GuarantorSection },
  { id: 'emergency', title: 'Emergency Contacts', component: EmergencyContactSection },
  { id: 'consent', title: 'Consent & Agreements', component: ConsentSection },
];

export function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationFormSchema),
    mode: 'onChange',
    defaultValues: {
      patient: {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'prefer-not-to-say',
        homeAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
        },
        phoneNumbers: {},
      },
      parentGuardian1: {
        firstName: '',
        lastName: '',
        relationship: '',
        phoneNumbers: {
          cell: '',
          work: '',
        },
        email: '',
        isPrimaryContact: true,
      },
      primaryInsurance: {
        isPrimary: true,
        companyName: '',
        policyNumber: '',
        subscriberName: '',
        subscriberDateOfBirth: '',
        subscriberRelationship: '',
      },
      guarantor: {
        firstName: '',
        lastName: '',
        relationshipToPatient: '',
        socialSecurityNumber: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
        },
        phoneNumber: '',
        email: '',
      },
      emergencyContact1: {
        firstName: '',
        lastName: '',
        relationship: '',
        phoneNumbers: {},
      },
      consentToTreatment: false,
      hipaaAcknowledgment: false,
      financialPolicyAgreement: false,
    },
  });

  const { handleSubmit, trigger, formState: { errors, isValid } } = form;

  const nextStep = async () => {
    const currentStepId = FORM_STEPS[currentStep].id;
    let fieldsToValidate: (keyof RegistrationFormData)[] = [];

    // Define which fields to validate for each step
    switch (currentStepId) {
      case 'patient':
        fieldsToValidate = ['patient'];
        break;
      case 'parents':
        fieldsToValidate = ['parentGuardian1'];
        break;
      case 'insurance':
        fieldsToValidate = ['primaryInsurance'];
        break;
      case 'guarantor':
        fieldsToValidate = ['guarantor'];
        break;
      case 'emergency':
        fieldsToValidate = ['emergencyContact1'];
        break;
      case 'consent':
        fieldsToValidate = ['consentToTreatment', 'hipaaAcknowledgment', 'financialPolicyAgreement'];
        break;
    }

    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid && currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/submit-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitSuccess(true);
      } else {
        setSubmitError(result.message || 'An error occurred while submitting the form');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Registration Submitted Successfully!</h2>
          <p className="text-green-700 mb-4">
            Thank you for completing your registration with Danville Pediatrics. 
            Your information has been securely submitted to our office.
          </p>
          <p className="text-sm text-green-600">
            Our staff will review your information and contact you within 1-2 business days 
            to schedule your appointment or if any additional information is needed.
          </p>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = FORM_STEPS[currentStep].component;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Patient Registration - Danville Pediatrics
        </h1>
        <p className="text-gray-600">
          "Hometown Care for Your Child" - Please complete all sections of this form
        </p>
      </div>

      <ProgressIndicator 
        currentStep={currentStep} 
        totalSteps={FORM_STEPS.length}
        steps={FORM_STEPS.map(step => step.title)}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {FORM_STEPS[currentStep].title}
          </h2>
          
          <CurrentStepComponent form={form} />
        </div>

        {submitError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{submitError}</p>
          </div>
        )}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
          >
            Previous
          </button>

          {currentStep === FORM_STEPS.length - 1 ? (
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="px-8 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Registration'
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
