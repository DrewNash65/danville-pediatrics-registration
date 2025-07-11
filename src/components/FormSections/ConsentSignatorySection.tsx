'use client';

import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RegistrationFormData } from '@/lib/validation';
import { FormField } from '../FormField';
import { DateInput } from '../DateInput';
import { isValidDate, calculateAge, getCurrentDateMMDDYYYY } from '@/lib/date-utils';

interface ConsentSignatorySectionProps {
  form: UseFormReturn<RegistrationFormData>;
}

export function ConsentSignatorySection({ form }: ConsentSignatorySectionProps) {
  const { register, formState: { errors }, setValue, watch, setError, clearErrors } = form;

  // Auto-populate the date signed with current date when component mounts
  useEffect(() => {
    const currentDate = getCurrentDateMMDDYYYY();
    setValue('consentSignatory.dateSigned', currentDate);
  }, [setValue]);

  const signatoryDOB = watch('consentSignatory.signatoryDateOfBirth');

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Consent Signatory Information
        </h3>
        <p className="text-sm text-blue-700">
          Please provide information about the individual who is completing this form and agreeing to the consents above. 
          The signatory must be at least 18 years old.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Full Name of Person Completing Form"
          required
          error={errors.consentSignatory?.signatoryName?.message}
          helpText="Enter the full legal name of the person signing"
        >
          <input
            type="text"
            {...register('consentSignatory.signatoryName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
            placeholder="Enter full name"
          />
        </FormField>

        <FormField
          label="Date of Birth"
          required
          error={errors.consentSignatory?.signatoryDateOfBirth?.message}
          helpText="Must be at least 18 years old to complete form"
        >
          <DateInput
            value={watch('consentSignatory.signatoryDateOfBirth') || ''}
            onChange={(value) => {
              setValue('consentSignatory.signatoryDateOfBirth', value);
              // Trigger validation for age
              if (value.length === 10) {
                if (!isValidDate(value)) {
                  setError('consentSignatory.signatoryDateOfBirth', {
                    type: 'manual',
                    message: 'Please enter a valid date'
                  });
                } else {
                  const age = calculateAge(value);
                  if (age < 18) {
                    setError('consentSignatory.signatoryDateOfBirth', {
                      type: 'manual',
                      message: 'Signatory must be at least 18 years old'
                    });
                  } else {
                    clearErrors('consentSignatory.signatoryDateOfBirth');
                  }
                }
              }
            }}
            placeholder="MM-DD-YYYY"
            required
          />
        </FormField>
      </div>

      {/* Show age if valid DOB is entered */}
      {signatoryDOB && isValidDate(signatoryDOB) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-sm text-gray-700">
            <strong>Age:</strong> {calculateAge(signatoryDOB)} years old
            {calculateAge(signatoryDOB) < 18 && (
              <span className="text-red-600 ml-2">
                ⚠️ Must be at least 18 years old to complete this form
              </span>
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Electronic Signature"
          required
          error={errors.consentSignatory?.electronicSignature?.message}
          helpText="Type your full name as your electronic signature"
        >
          <input
            type="text"
            {...register('consentSignatory.electronicSignature')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input font-serif italic"
            placeholder="Type your full name here"
            style={{ fontFamily: 'cursive' }}
          />
        </FormField>

        <FormField
          label="Date Signed"
          required
          error={errors.consentSignatory?.dateSigned?.message}
          helpText="Automatically filled with today's date"
        >
          <input
            type="text"
            {...register('consentSignatory.dateSigned')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input bg-gray-50"
            placeholder="MM-DD-YYYY"
            readOnly
          />
        </FormField>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-yellow-800 mb-1">
              Electronic Signature Agreement
            </h4>
            <p className="text-xs text-yellow-700">
              By typing your name in the electronic signature field above, you acknowledge that:
            </p>
            <ul className="text-xs text-yellow-700 mt-1 ml-4 list-disc">
              <li>You are at least 18 years old</li>
              <li>You have read and agree to all consents and policies above</li>
              <li>Your electronic signature has the same legal effect as a handwritten signature</li>
              <li>You are authorized to complete this form on behalf of the patient (if applicable)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
