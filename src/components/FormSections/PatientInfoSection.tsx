'use client';

import React, { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RegistrationFormData } from '@/lib/validation';
import { FormField } from '../FormField';
import { SelectField } from '../SelectField';
import { DateInput } from '../DateInput';
import { isValidDate } from '@/lib/date-utils';

interface PatientInfoSectionProps {
  form: UseFormReturn<RegistrationFormData>;
}

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

export function PatientInfoSection({ form }: PatientInfoSectionProps) {
  const { register, formState: { errors }, setValue, setError, clearErrors, watch } = form;

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  // Custom hook for handling autofill and phone formatting
  const usePhoneInput = (fieldName: string) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      const input = inputRef.current;
      if (!input) return;

      const handleAutofill = () => {
        // Check for autofilled value after a short delay
        setTimeout(() => {
          if (input.value && input.value !== '') {
            const formatted = formatPhoneNumber(input.value);
            input.value = formatted;
            setValue(fieldName as any, formatted);
          }
        }, 100);
      };

      const handleInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const formatted = formatPhoneNumber(target.value);
        target.value = formatted;
        setValue(fieldName as any, formatted);
      };

      // Listen for various autofill events
      input.addEventListener('input', handleInput);
      input.addEventListener('change', handleAutofill);
      input.addEventListener('blur', handleAutofill);

      // Check for autofill on mount and periodically
      handleAutofill();
      const interval = setInterval(handleAutofill, 500);

      return () => {
        input.removeEventListener('input', handleInput);
        input.removeEventListener('change', handleAutofill);
        input.removeEventListener('blur', handleAutofill);
        clearInterval(interval);
      };
    }, [fieldName]);

    return inputRef;
  };

  // Create all refs at the top level to avoid conditional hook calls
  const homePhoneRef = usePhoneInput('patient.phoneNumbers.home');
  const cellPhoneRef = usePhoneInput('patient.phoneNumbers.cell');



  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="First Name"
          required
          error={errors.patient?.firstName?.message}
        >
          <input
            type="text"
            {...register('patient.firstName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter first name"
          />
        </FormField>

        <FormField
          label="Last Name"
          required
          error={errors.patient?.lastName?.message}
        >
          <input
            type="text"
            {...register('patient.lastName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter last name"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Date of Birth"
          required
          error={errors.patient?.dateOfBirth?.message}
          helpText="Type MM-DD-YYYY or click calendar icon"
        >
          <DateInput
            value={form.watch('patient.dateOfBirth') || ''}
            onChange={(value) => {
              setValue('patient.dateOfBirth', value);
              // Trigger validation
              if (value.length === 10) {
                if (!isValidDate(value)) {
                  setError('patient.dateOfBirth', {
                    type: 'manual',
                    message: 'Please enter a valid date'
                  });
                } else {
                  clearErrors('patient.dateOfBirth');
                }
              }
            }}
            placeholder="MM-DD-YYYY"
            required
          />
        </FormField>

        <SelectField
          label="Gender"
          required
          options={GENDER_OPTIONS}
          error={errors.patient?.gender?.message}
          {...register('patient.gender')}
        />
      </div>



      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Home Address</h3>
        
        <FormField
          label="Street Address"
          required
          error={errors.patient?.homeAddress?.street?.message}
        >
          <input
            type="text"
            {...register('patient.homeAddress.street')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter street address"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <FormField
            label="City"
            required
            error={errors.patient?.homeAddress?.city?.message}
          >
            <input
              type="text"
              {...register('patient.homeAddress.city')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter city"
            />
          </FormField>

          <SelectField
            label="State"
            required
            options={US_STATES}
            error={errors.patient?.homeAddress?.state?.message}
            {...register('patient.homeAddress.state')}
          />

          <FormField
            label="ZIP Code"
            required
            error={errors.patient?.homeAddress?.zipCode?.message}
          >
            <input
              type="text"
              {...register('patient.homeAddress.zipCode')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="12345"
              maxLength={10}
            />
          </FormField>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Home Phone"
            error={errors.patient?.phoneNumbers?.home?.message}
          >
            <input
              type="tel"
              {...register('patient.phoneNumbers.home')}
              ref={homePhoneRef}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(XXX) XXX-XXXX"
              maxLength={14}
              autoComplete="tel-national"
            />
          </FormField>

          <FormField
            label="Cell Phone"
            error={errors.patient?.phoneNumbers?.cell?.message}
          >
            <input
              type="tel"
              {...register('patient.phoneNumbers.cell')}
              ref={cellPhoneRef}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(XXX) XXX-XXXX"
              maxLength={14}
              autoComplete="tel"
            />
          </FormField>
        </div>

        <FormField
          label="Email Address"
          error={errors.patient?.email?.message}
          helpText="Optional - For appointment reminders and communications"
        >
          <input
            type="email"
            {...register('patient.email', {
              setValueAs: (value) => value?.trim() || ''
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="patient@example.com"
          />
        </FormField>

        {(errors.patient?.phoneNumbers as any)?.root && (
          <p className="text-red-600 text-sm mt-2">
            {(errors.patient?.phoneNumbers as any)?.root?.message}
          </p>
        )}
      </div>
    </div>
  );
}
