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
import Image from 'next/image';

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
      // Create FormData to handle file uploads
      const formData = new FormData();

      // Add all form fields as JSON, excluding files
      const formDataWithoutFiles = {
        ...data,
        primaryInsurance: {
          ...data.primaryInsurance,
          cardFrontImage: undefined,
          cardBackImage: undefined,
        },
        secondaryInsurance: data.secondaryInsurance ? {
          ...data.secondaryInsurance,
          cardFrontImage: undefined,
          cardBackImage: undefined,
        } : undefined,
      };

      formData.append('formData', JSON.stringify(formDataWithoutFiles));

      // Add insurance card images if they exist
      console.log('Form submission - checking for images:', {
        primaryFront: !!data.primaryInsurance.cardFrontImage,
        primaryBack: !!data.primaryInsurance.cardBackImage,
        secondaryFront: !!data.secondaryInsurance?.cardFrontImage,
        secondaryBack: !!data.secondaryInsurance?.cardBackImage
      });

      if (data.primaryInsurance.cardFrontImage) {
        console.log('Adding primary front image to FormData');
        formData.append('primaryInsuranceCardFront', data.primaryInsurance.cardFrontImage);
      }
      if (data.primaryInsurance.cardBackImage) {
        console.log('Adding primary back image to FormData');
        formData.append('primaryInsuranceCardBack', data.primaryInsurance.cardBackImage);
      }
      if (data.secondaryInsurance?.cardFrontImage) {
        console.log('Adding secondary front image to FormData');
        formData.append('secondaryInsuranceCardFront', data.secondaryInsurance.cardFrontImage);
      }
      if (data.secondaryInsurance?.cardBackImage) {
        console.log('Adding secondary back image to FormData');
        formData.append('secondaryInsuranceCardBack', data.secondaryInsurance.cardBackImage);
      }

      // Debug: Check what's actually in the FormData
      console.log('FormData contents:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${typeof value}`);
        }
      }

      console.log('About to submit FormData to API...');

      const response = await fetch('/api/submit-registration', {
        method: 'POST',
        body: formData, // Use FormData instead of JSON
      });

      console.log('API response status:', response.status);

      // Get response body to check for server-side debugging info
      const responseText = await response.text();
      console.log('API response body:', responseText);

      // Try to parse as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('Parsed response data:', responseData);

        // Check if server processed files
        if (responseData.filesProcessed) {
          console.log('Server files processed:', responseData.filesProcessed);
        }

        // Check PDF generation status
        if (responseData.pdfGenerationStatus) {
          console.log('🔧 PDF Generation Status:', responseData.pdfGenerationStatus);
        }

        // Check for PDF errors
        if (responseData.pdfError) {
          console.error('🚨 PDF Generation Error:', responseData.pdfError);
        }
      } catch (e) {
        console.log('Response is not JSON:', responseText);
      }

      // Use the already parsed response data
      const result = responseData || { success: false, message: 'Invalid response' };

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <Image
                src="/Danville Pediatrics Logo.png"
                alt="Danville Pediatrics Logo"
                width={200}
                height={100}
                className="mx-auto mb-4"
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
              <h1 className="text-2xl font-bold text-gray-800">
                Danville Pediatrics
              </h1>
              <p className="text-gray-600 italic">
                "Hometown Care for Your Child"
              </p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto p-6 bg-green-50 border border-green-200 rounded-lg shadow-lg">
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
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Contact Information:</strong><br />
                  Phone: (925) 362-1861<br />
                  Email: Admin@DanvillePediatrics.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = FORM_STEPS[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <Image
              src="/Danville Pediatrics Logo.png"
              alt="Danville Pediatrics Logo"
              width={200}
              height={100}
              className="mx-auto mb-4"
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
            <h1 className="text-2xl font-bold text-gray-800">
              Patient Registration - Danville Pediatrics
            </h1>
            <p className="text-gray-600 italic">
              "Hometown Care for Your Child"
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Please complete all sections of this secure, HIPAA-compliant form
            </p>
          </div>
        </div>

      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={FORM_STEPS.length}
        steps={FORM_STEPS.map(step => step.title)}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6 border-t-4 border-blue-500">
            <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                Step {currentStep + 1}
              </span>
              {FORM_STEPS[currentStep].title}
            </h2>

            <CurrentStepComponent form={form} />
          </div>

          {submitError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700">{submitError}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors font-medium flex items-center"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            {currentStep === FORM_STEPS.length - 1 ? (
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium flex items-center shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Submitting Securely...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Submit Registration
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium flex items-center shadow-lg"
              >
                Next
                <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
