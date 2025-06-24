'use client';

import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RegistrationFormData } from '@/lib/validation';
import { FormField } from '../FormField';

interface MedicalHistorySectionProps {
  form: UseFormReturn<RegistrationFormData>;
}

export function MedicalHistorySection({ form }: MedicalHistorySectionProps) {
  const { register, formState: { errors } } = form;
  const [hasCurrentPhysician, setHasCurrentPhysician] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Medical History Information</h4>
        <p className="text-sm text-blue-700">
          Please provide as much detail as possible about your child's medical history. 
          This information helps us provide the best possible care and avoid potential complications.
          If you're unsure about any information, please write "Unknown" rather than leaving it blank.
        </p>
      </div>

      <FormField
        label="Current Medications"
        error={errors.medicalHistory?.currentMedications?.message}
        helpText="List all medications your child is currently taking, including dosages. Write 'None' if not taking any medications."
      >
        <textarea
          {...register('medicalHistory.currentMedications')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Example: Tylenol 160mg as needed for fever, Albuterol inhaler 2 puffs as needed for asthma, etc. Or write 'None' if no current medications."
        />
      </FormField>

      <FormField
        label="Known Allergies"
        error={errors.medicalHistory?.allergies?.message}
        helpText="List all known allergies including medications, foods, environmental allergens, etc. Include the type of reaction if known. Write 'None known' if no allergies."
      >
        <textarea
          {...register('medicalHistory.allergies')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Example: Penicillin (rash), Peanuts (anaphylaxis), Pollen (sneezing, runny nose), etc. Or write 'None known' if no allergies."
        />
      </FormField>

      <FormField
        label="Previous Medical Conditions & Surgeries"
        error={errors.medicalHistory?.previousConditions?.message}
        helpText="List any previous illnesses, surgeries, hospitalizations, or ongoing medical conditions. Include approximate dates if known. Write 'None' if no previous conditions."
      >
        <textarea
          {...register('medicalHistory.previousConditions')}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Example: Asthma (diagnosed 2020), Broken arm (2019), Appendectomy (2018), Frequent ear infections, etc. Or write 'None' if no previous conditions."
        />
      </FormField>

      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Current/Previous Physician</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={hasCurrentPhysician}
              onChange={(e) => setHasCurrentPhysician(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Patient has a current physician</span>
          </label>
        </div>

        {hasCurrentPhysician && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> If your child is transferring care from another physician, 
                we will need to request medical records. Please contact your previous physician's 
                office to authorize the release of records to Danville Pediatrics.
              </p>
            </div>

            <FormField
              label="Physician Name"
              error={errors.medicalHistory?.currentPhysician?.name?.message}
            >
              <input
                type="text"
                {...register('medicalHistory.currentPhysician.name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dr. John Smith"
              />
            </FormField>

            <FormField
              label="Practice/Clinic Name"
              error={errors.medicalHistory?.currentPhysician?.practice?.message}
            >
              <input
                type="text"
                {...register('medicalHistory.currentPhysician.practice')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ABC Pediatrics"
              />
            </FormField>

            <FormField
              label="Phone Number"
              error={errors.medicalHistory?.currentPhysician?.phoneNumber?.message}
            >
              <input
                type="tel"
                {...register('medicalHistory.currentPhysician.phoneNumber')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(XXX) XXX-XXXX"
                maxLength={14}
                onChange={(e) => {
                  e.target.value = formatPhoneNumber(e.target.value);
                }}
              />
            </FormField>
          </div>
        )}

        {!hasCurrentPhysician && (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm italic">
              Check the box above if your child currently has or recently had another physician.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">New Patient Welcome!</h4>
              <p className="text-sm text-green-700">
                We're excited to welcome your child to Danville Pediatrics! As a new patient, 
                we'll establish a complete medical history during your first visit and ensure 
                your child receives comprehensive, personalized care.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-2">Additional Information</h4>
        <p className="text-sm text-gray-600 mb-2">
          During your first visit, we will also discuss:
        </p>
        <ul className="text-sm text-gray-600 ml-4 list-disc space-y-1">
          <li>Vaccination history and schedule</li>
          <li>Growth and development milestones</li>
          <li>Family medical history</li>
          <li>Behavioral and social development</li>
          <li>Nutrition and feeding habits</li>
          <li>Sleep patterns and concerns</li>
          <li>Any specific concerns or questions you may have</li>
        </ul>
      </div>
    </div>
  );
}
