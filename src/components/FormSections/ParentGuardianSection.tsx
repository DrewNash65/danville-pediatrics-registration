'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RegistrationFormData } from '@/lib/validation';
import { FormField } from '../FormField';
import { SelectField } from '../SelectField';

interface ParentGuardianSectionProps {
  form: UseFormReturn<RegistrationFormData>;
}

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
  { value: 'other', label: 'Other' },
];

export function ParentGuardianSection({ form }: ParentGuardianSectionProps) {
  const { register, formState: { errors }, watch, setValue } = form;
  const [hasSecondParent, setHasSecondParent] = useState(false);

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

  return (
    <div className="space-y-8">
      {/* Primary Parent/Guardian */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Parent/Guardian</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormField
            label="First Name"
            required
            error={errors.parentGuardian1?.firstName?.message}
          >
            <input
              type="text"
              {...register('parentGuardian1.firstName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter first name"
            />
          </FormField>

          <FormField
            label="Last Name"
            required
            error={errors.parentGuardian1?.lastName?.message}
          >
            <input
              type="text"
              {...register('parentGuardian1.lastName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter last name"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <SelectField
            label="Relationship to Patient"
            required
            options={RELATIONSHIP_OPTIONS}
            error={errors.parentGuardian1?.relationship?.message}
            {...register('parentGuardian1.relationship')}
          />

          <FormField
            label="Email Address"
            required
            error={errors.parentGuardian1?.email?.message}
          >
            <input
              type="email"
              {...register('parentGuardian1.email', {
                setValueAs: (value) => value?.trim() || ''
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="parent@example.com"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Cell Phone"
            error={errors.parentGuardian1?.phoneNumbers?.cell?.message}
          >
            <input
              type="tel"
              {...register('parentGuardian1.phoneNumbers.cell')}
              ref={usePhoneInput('parentGuardian1.phoneNumbers.cell')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(XXX) XXX-XXXX"
              maxLength={14}
              autoComplete="tel"
            />
          </FormField>

          <FormField
            label="Work Phone"
            error={errors.parentGuardian1?.phoneNumbers?.work?.message}
          >
            <input
              type="tel"
              {...register('parentGuardian1.phoneNumbers.work')}
              ref={usePhoneInput('parentGuardian1.phoneNumbers.work')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(XXX) XXX-XXXX"
              maxLength={14}
              autoComplete="tel-national"
            />
          </FormField>
        </div>

        <p className="text-sm text-gray-600 mt-2">
          <span className="text-red-600">*</span> At least one phone number is required
        </p>

        {(errors.parentGuardian1?.phoneNumbers as any)?.root && (
          <p className="text-red-600 text-sm mt-2">
            {(errors.parentGuardian1?.phoneNumbers as any)?.root?.message}
          </p>
        )}

        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('parentGuardian1.isPrimaryContact')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              This is the primary contact for the patient
            </span>
          </label>
        </div>
      </div>

      {/* Second Parent/Guardian (Optional) */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Second Parent/Guardian</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={hasSecondParent}
              onChange={(e) => setHasSecondParent(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Add second parent/guardian</span>
          </label>
        </div>

        {hasSecondParent && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="First Name"
                error={errors.parentGuardian2?.firstName?.message}
              >
                <input
                  type="text"
                  {...register('parentGuardian2.firstName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter first name"
                />
              </FormField>

              <FormField
                label="Last Name"
                error={errors.parentGuardian2?.lastName?.message}
              >
                <input
                  type="text"
                  {...register('parentGuardian2.lastName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter last name"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Relationship to Patient"
                options={RELATIONSHIP_OPTIONS}
                error={errors.parentGuardian2?.relationship?.message}
                {...register('parentGuardian2.relationship')}
              />

              <FormField
                label="Email Address"
                error={errors.parentGuardian2?.email?.message}
              >
                <input
                  type="email"
                  {...register('parentGuardian2.email', {
                    setValueAs: (value) => value?.trim() || ''
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="parent@example.com"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Cell Phone"
                error={errors.parentGuardian2?.phoneNumbers?.cell?.message}
              >
                <input
                  type="tel"
                  {...register('parentGuardian2.phoneNumbers.cell')}
                  ref={usePhoneInput('parentGuardian2.phoneNumbers.cell')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(XXX) XXX-XXXX"
                  maxLength={14}
                  autoComplete="tel"
                />
              </FormField>

              <FormField
                label="Work Phone"
                error={errors.parentGuardian2?.phoneNumbers?.work?.message}
              >
                <input
                  type="tel"
                  {...register('parentGuardian2.phoneNumbers.work')}
                  ref={usePhoneInput('parentGuardian2.phoneNumbers.work')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(XXX) XXX-XXXX"
                  maxLength={14}
                  autoComplete="tel-national"
                />
              </FormField>
            </div>

            <p className="text-sm text-gray-600 mt-2">
              <span className="text-red-600">*</span> At least one phone number is required
            </p>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('parentGuardian2.isPrimaryContact')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  This is the primary contact for the patient
                </span>
              </label>
            </div>
          </div>
        )}

        {!hasSecondParent && (
          <p className="text-gray-500 text-sm italic">
            Check the box above to add information for a second parent or guardian.
          </p>
        )}
      </div>
    </div>
  );
}
