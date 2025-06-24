'use client';

import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RegistrationFormData } from '@/lib/validation';
import { FormField } from '../FormField';
import { SelectField } from '../SelectField';

interface EmergencyContactSectionProps {
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
  { value: 'sibling', label: 'Sibling' },
  { value: 'friend', label: 'Friend' },
  { value: 'neighbor', label: 'Neighbor' },
  { value: 'babysitter', label: 'Babysitter/Caregiver' },
  { value: 'other', label: 'Other' },
];

export function EmergencyContactSection({ form }: EmergencyContactSectionProps) {
  const { register, formState: { errors } } = form;
  const [hasSecondContact, setHasSecondContact] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  return (
    <div className="space-y-8">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">Emergency Contact Information</h4>
        <p className="text-sm text-yellow-700">
          Please provide contact information for people we can reach in case of an emergency 
          when the parent/guardian is not available. These should be people who are authorized 
          to make decisions about your child's care if needed.
        </p>
      </div>

      {/* Primary Emergency Contact */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Emergency Contact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormField
            label="First Name"
            required
            error={errors.emergencyContact1?.firstName?.message}
          >
            <input
              type="text"
              {...register('emergencyContact1.firstName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter first name"
            />
          </FormField>

          <FormField
            label="Last Name"
            required
            error={errors.emergencyContact1?.lastName?.message}
          >
            <input
              type="text"
              {...register('emergencyContact1.lastName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter last name"
            />
          </FormField>
        </div>

        <SelectField
          label="Relationship to Patient"
          required
          options={RELATIONSHIP_OPTIONS}
          error={errors.emergencyContact1?.relationship?.message}
          {...register('emergencyContact1.relationship')}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <FormField
            label="Home Phone"
            error={errors.emergencyContact1?.phoneNumbers?.home?.message}
          >
            <input
              type="tel"
              {...register('emergencyContact1.phoneNumbers.home')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(XXX) XXX-XXXX"
              maxLength={14}
              onChange={(e) => {
                e.target.value = formatPhoneNumber(e.target.value);
              }}
            />
          </FormField>

          <FormField
            label="Cell Phone"
            error={errors.emergencyContact1?.phoneNumbers?.cell?.message}
          >
            <input
              type="tel"
              {...register('emergencyContact1.phoneNumbers.cell')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(XXX) XXX-XXXX"
              maxLength={14}
              onChange={(e) => {
                e.target.value = formatPhoneNumber(e.target.value);
              }}
            />
          </FormField>

          <FormField
            label="Work Phone"
            error={errors.emergencyContact1?.phoneNumbers?.work?.message}
          >
            <input
              type="tel"
              {...register('emergencyContact1.phoneNumbers.work')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(XXX) XXX-XXXX"
              maxLength={14}
              onChange={(e) => {
                e.target.value = formatPhoneNumber(e.target.value);
              }}
            />
          </FormField>
        </div>

        {(errors.emergencyContact1?.phoneNumbers as any)?.root && (
          <p className="text-red-600 text-sm mt-2">
            {(errors.emergencyContact1?.phoneNumbers as any)?.root?.message}
          </p>
        )}
      </div>

      {/* Secondary Emergency Contact (Optional) */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Secondary Emergency Contact</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={hasSecondContact}
              onChange={(e) => setHasSecondContact(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Add second emergency contact</span>
          </label>
        </div>

        {hasSecondContact && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="First Name"
                error={errors.emergencyContact2?.firstName?.message}
              >
                <input
                  type="text"
                  {...register('emergencyContact2.firstName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter first name"
                />
              </FormField>

              <FormField
                label="Last Name"
                error={errors.emergencyContact2?.lastName?.message}
              >
                <input
                  type="text"
                  {...register('emergencyContact2.lastName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter last name"
                />
              </FormField>
            </div>

            <SelectField
              label="Relationship to Patient"
              options={RELATIONSHIP_OPTIONS}
              error={errors.emergencyContact2?.relationship?.message}
              {...register('emergencyContact2.relationship')}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Home Phone"
                error={errors.emergencyContact2?.phoneNumbers?.home?.message}
              >
                <input
                  type="tel"
                  {...register('emergencyContact2.phoneNumbers.home')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(XXX) XXX-XXXX"
                  maxLength={14}
                  onChange={(e) => {
                    e.target.value = formatPhoneNumber(e.target.value);
                  }}
                />
              </FormField>

              <FormField
                label="Cell Phone"
                error={errors.emergencyContact2?.phoneNumbers?.cell?.message}
              >
                <input
                  type="tel"
                  {...register('emergencyContact2.phoneNumbers.cell')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(XXX) XXX-XXXX"
                  maxLength={14}
                  onChange={(e) => {
                    e.target.value = formatPhoneNumber(e.target.value);
                  }}
                />
              </FormField>

              <FormField
                label="Work Phone"
                error={errors.emergencyContact2?.phoneNumbers?.work?.message}
              >
                <input
                  type="tel"
                  {...register('emergencyContact2.phoneNumbers.work')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(XXX) XXX-XXXX"
                  maxLength={14}
                  onChange={(e) => {
                    e.target.value = formatPhoneNumber(e.target.value);
                  }}
                />
              </FormField>
            </div>

            {(errors.emergencyContact2?.phoneNumbers as any)?.root && (
              <p className="text-red-600 text-sm mt-2">
                {(errors.emergencyContact2?.phoneNumbers as any)?.root?.message}
              </p>
            )}
          </div>
        )}

        {!hasSecondContact && (
          <p className="text-gray-500 text-sm italic">
            Check the box above to add a second emergency contact (recommended).
          </p>
        )}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-2">Important Note</h4>
        <p className="text-sm text-gray-600">
          Emergency contacts should be people who:
        </p>
        <ul className="text-sm text-gray-600 mt-2 ml-4 list-disc">
          <li>Are readily available during the day</li>
          <li>Are authorized to make decisions about your child's care</li>
          <li>Know your child's medical history and current medications</li>
          <li>Can be reached quickly in case of an emergency</li>
        </ul>
      </div>
    </div>
  );
}
