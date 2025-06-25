'use client';

import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RegistrationFormData } from '@/lib/validation';
import { FormField } from '../FormField';
import { SelectField } from '../SelectField';
import { FileUpload } from '../FileUpload';

interface InsuranceSectionProps {
  form: UseFormReturn<RegistrationFormData>;
}

const RELATIONSHIP_OPTIONS = [
  { value: 'self', label: 'Self' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'other', label: 'Other' },
];

export function InsuranceSection({ form }: InsuranceSectionProps) {
  const { register, formState: { errors }, setValue, watch } = form;
  const [hasSecondaryInsurance, setHasSecondaryInsurance] = useState(false);

  const handleFileUpload = (fieldName: string, file: File | null) => {
    setValue(fieldName as any, file);
  };

  return (
    <div className="space-y-8">
      {/* Primary Insurance */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Insurance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormField
            label="Insurance Company Name"
            required
            error={errors.primaryInsurance?.companyName?.message}
          >
            <input
              type="text"
              {...register('primaryInsurance.companyName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Blue Cross Blue Shield"
            />
          </FormField>

          <FormField
            label="Policy Number"
            required
            error={errors.primaryInsurance?.policyNumber?.message}
          >
            <input
              type="text"
              {...register('primaryInsurance.policyNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter policy number"
            />
          </FormField>
        </div>

        <FormField
          label="Group Number"
          error={errors.primaryInsurance?.groupNumber?.message}
          helpText="Optional - Found on insurance card"
        >
          <input
            type="text"
            {...register('primaryInsurance.groupNumber')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter group number"
          />
        </FormField>

        <div className="border-t pt-4 mt-6">
          <h4 className="text-md font-medium text-gray-800 mb-4">Subscriber Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
              label="Subscriber Name"
              required
              error={errors.primaryInsurance?.subscriberName?.message}
              helpText="Person whose name the insurance is under"
            >
              <input
                type="text"
                {...register('primaryInsurance.subscriberName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter subscriber name"
              />
            </FormField>

            <FormField
              label="Subscriber Date of Birth"
              required
              error={errors.primaryInsurance?.subscriberDateOfBirth?.message}
            >
              <input
                type="date"
                {...register('primaryInsurance.subscriberDateOfBirth')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
          </div>

          <SelectField
            label="Subscriber Relationship to Patient"
            required
            options={RELATIONSHIP_OPTIONS}
            error={errors.primaryInsurance?.subscriberRelationship?.message}
            {...register('primaryInsurance.subscriberRelationship')}
          />
        </div>

        <div className="border-t pt-4 mt-6">
          <h4 className="text-md font-medium text-gray-800 mb-4">Insurance Card Photos</h4>
          <p className="text-sm text-gray-600 mb-4">
            Please upload clear photos of both sides of your insurance card. This helps us verify your coverage and process claims accurately.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileUpload
              label="Front of Insurance Card"
              accept="image/*"
              onFileSelect={(file) => handleFileUpload('primaryInsurance.cardFrontImage', file)}
              helpText="Take a photo with your camera or upload from gallery"
              enableCamera={true}
            />

            <FileUpload
              label="Back of Insurance Card"
              accept="image/*"
              onFileSelect={(file) => handleFileUpload('primaryInsurance.cardBackImage', file)}
              helpText="Take a photo with your camera or upload from gallery"
              enableCamera={true}
            />
          </div>
        </div>
      </div>

      {/* Secondary Insurance (Optional) */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Secondary Insurance</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={hasSecondaryInsurance}
              onChange={(e) => setHasSecondaryInsurance(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">I have secondary insurance</span>
          </label>
        </div>

        {hasSecondaryInsurance && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Insurance Company Name"
                error={errors.secondaryInsurance?.companyName?.message}
              >
                <input
                  type="text"
                  {...register('secondaryInsurance.companyName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Aetna"
                />
              </FormField>

              <FormField
                label="Policy Number"
                error={errors.secondaryInsurance?.policyNumber?.message}
              >
                <input
                  type="text"
                  {...register('secondaryInsurance.policyNumber')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter policy number"
                />
              </FormField>
            </div>

            <FormField
              label="Group Number"
              error={errors.secondaryInsurance?.groupNumber?.message}
            >
              <input
                type="text"
                {...register('secondaryInsurance.groupNumber')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter group number"
              />
            </FormField>

            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-800 mb-4">Subscriber Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField
                  label="Subscriber Name"
                  error={errors.secondaryInsurance?.subscriberName?.message}
                >
                  <input
                    type="text"
                    {...register('secondaryInsurance.subscriberName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter subscriber name"
                  />
                </FormField>

                <FormField
                  label="Subscriber Date of Birth"
                  error={errors.secondaryInsurance?.subscriberDateOfBirth?.message}
                >
                  <input
                    type="date"
                    {...register('secondaryInsurance.subscriberDateOfBirth')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>
              </div>

              <SelectField
                label="Subscriber Relationship to Patient"
                options={RELATIONSHIP_OPTIONS}
                error={errors.secondaryInsurance?.subscriberRelationship?.message}
                {...register('secondaryInsurance.subscriberRelationship')}
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-800 mb-4">Secondary Insurance Card Photos</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUpload
                  label="Front of Secondary Insurance Card"
                  accept="image/*"
                  onFileSelect={(file) => handleFileUpload('secondaryInsurance.cardFrontImage', file)}
                  helpText="Take a photo with your camera or upload from gallery"
                  enableCamera={true}
                />

                <FileUpload
                  label="Back of Secondary Insurance Card"
                  accept="image/*"
                  onFileSelect={(file) => handleFileUpload('secondaryInsurance.cardBackImage', file)}
                  helpText="Take a photo with your camera or upload from gallery"
                  enableCamera={true}
                />
              </div>
            </div>
          </div>
        )}

        {!hasSecondaryInsurance && (
          <p className="text-gray-500 text-sm italic">
            Check the box above if you have secondary insurance coverage.
          </p>
        )}
      </div>
    </div>
  );
}
