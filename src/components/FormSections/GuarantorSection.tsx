'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RegistrationFormData } from '@/lib/validation';
import { FormField } from '../FormField';
import { SelectField } from '../SelectField';

interface GuarantorSectionProps {
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

const RELATIONSHIP_OPTIONS = [
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'stepmother', label: 'Stepmother' },
  { value: 'stepfather', label: 'Stepfather' },
  { value: 'grandmother', label: 'Grandmother' },
  { value: 'grandfather', label: 'Grandfather' },
  { value: 'aunt', label: 'Aunt' },
  { value: 'uncle', label: 'Uncle' },
  { value: 'legal-guardian', label: 'Legal Guardian' },
  { value: 'self', label: 'Self (if 18+)' },
  { value: 'other', label: 'Other' },
];

export function GuarantorSection({ form }: GuarantorSectionProps) {
  const { register, formState: { errors }, watch, setValue } = form;
  const [hasEmployer, setHasEmployer] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
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

  const formatSSN = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 9)}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">What is a Guarantor?</h4>
        <p className="text-sm text-blue-700">
          The guarantor is the person financially responsible for the patient's medical bills. 
          This is typically a parent or guardian for pediatric patients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="First Name"
          required
          error={errors.guarantor?.firstName?.message}
        >
          <input
            type="text"
            {...register('guarantor.firstName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter first name"
          />
        </FormField>

        <FormField
          label="Last Name"
          required
          error={errors.guarantor?.lastName?.message}
        >
          <input
            type="text"
            {...register('guarantor.lastName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter last name"
          />
        </FormField>
      </div>

      <SelectField
        label="Relationship to Patient"
        required
        options={RELATIONSHIP_OPTIONS}
        error={errors.guarantor?.relationshipToPatient?.message}
        {...register('guarantor.relationshipToPatient')}
      />

      <FormField
        label="Social Security Number"
        error={errors.guarantor?.socialSecurityNumber?.message}
        helpText="Optional - Used for billing and insurance purposes"
      >
        <input
          type="text"
          {...register('guarantor.socialSecurityNumber')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="XXX-XX-XXXX"
          maxLength={11}
          onChange={(e) => {
            e.target.value = formatSSN(e.target.value);
          }}
        />
      </FormField>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Guarantor Address</h3>
        
        <FormField
          label="Street Address"
          required
          error={errors.guarantor?.address?.street?.message}
        >
          <input
            type="text"
            {...register('guarantor.address.street')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter street address"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <FormField
            label="City"
            required
            error={errors.guarantor?.address?.city?.message}
          >
            <input
              type="text"
              {...register('guarantor.address.city')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter city"
            />
          </FormField>

          <SelectField
            label="State"
            required
            options={US_STATES}
            error={errors.guarantor?.address?.state?.message}
            {...register('guarantor.address.state')}
          />

          <FormField
            label="ZIP Code"
            required
            error={errors.guarantor?.address?.zipCode?.message}
          >
            <input
              type="text"
              {...register('guarantor.address.zipCode')}
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
            label="Phone Number"
            required
            error={errors.guarantor?.phoneNumber?.message}
          >
            <input
              type="tel"
              {...register('guarantor.phoneNumber')}
              ref={usePhoneInput('guarantor.phoneNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(XXX) XXX-XXXX"
              maxLength={14}
              autoComplete="tel"
            />
          </FormField>

          <FormField
            label="Email Address"
            required
            error={errors.guarantor?.email?.message}
          >
            <input
              type="email"
              {...register('guarantor.email', {
                setValueAs: (value) => value?.trim() || ''
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="guarantor@example.com"
            />
          </FormField>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Employer Information</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={hasEmployer}
              onChange={(e) => setHasEmployer(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Add employer information</span>
          </label>
        </div>

        {hasEmployer && (
          <div className="space-y-4">
            <FormField
              label="Employer Name"
              error={errors.guarantor?.employer?.name?.message}
            >
              <input
                type="text"
                {...register('guarantor.employer.name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter employer name"
              />
            </FormField>

            <FormField
              label="Employer Address"
              error={errors.guarantor?.employer?.address?.message}
            >
              <input
                type="text"
                {...register('guarantor.employer.address')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter employer address"
              />
            </FormField>

            <FormField
              label="Employer Phone Number"
              error={errors.guarantor?.employer?.phoneNumber?.message}
            >
              <input
                type="tel"
                {...register('guarantor.employer.phoneNumber')}
                ref={usePhoneInput('guarantor.employer.phoneNumber')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(XXX) XXX-XXXX"
                maxLength={14}
                autoComplete="tel-national"
              />
            </FormField>
          </div>
        )}

        {!hasEmployer && (
          <p className="text-gray-500 text-sm italic">
            Check the box above to add employer information (optional).
          </p>
        )}
      </div>
    </div>
  );
}
