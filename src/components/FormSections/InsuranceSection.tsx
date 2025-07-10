'use client';

import React, { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RegistrationFormData } from '@/lib/validation';
import { FormField } from '../FormField';
import { SelectField } from '../SelectField';
import { FileUpload } from '../FileUpload';

interface InsuranceSectionProps {
  form: UseFormReturn<RegistrationFormData>;
}

interface ExtractedInsuranceData {
  provider?: string;
  companyName?: string;
  policyNumber?: string;
  groupNumber?: string;
  memberID?: string;
  subscriberName?: string;
  effectiveDate?: string;
  expirationDate?: string;
  subscriberDateOfBirth?: string;
  [key: string]: any;
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
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState<string | null>(null);

  const handleFileUpload = (fieldName: string, file: File | null) => {
    setValue(fieldName as any, file);
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Extract insurance data using OpenRouter API
  const extractInsuranceData = async (imageBase64: string): Promise<ExtractedInsuranceData> => {
    const apiKey = process.env.NEXT_PUBLIC_DANVILLE_PEDS_INSURANCE_FORM_KEY;

    if (!apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const systemPrompt = `You are an expert at analyzing insurance card images and extracting key information.

    Analyze the provided insurance card image and extract the following information with high accuracy:
    - Insurance provider/company name
    - Policy number (also called member number, ID number, or subscriber number)
    - Group number (if present)
    - Member ID (if different from policy number)
    - Policyholder/subscriber full name
    - Effective date (if present)
    - Expiration date (if present)
    - Subscriber date of birth (if present)

    Handle common insurance card layouts from major providers like Blue Cross Blue Shield, Aetna, Cigna, UnitedHealthcare, etc.

    Return the extracted data in this exact JSON format:
    {
      "companyName": "extracted company name",
      "policyNumber": "extracted policy/member number",
      "groupNumber": "extracted group number or null if not found",
      "memberID": "extracted member ID or null if same as policy number",
      "subscriberName": "extracted full name of subscriber",
      "effectiveDate": "YYYY-MM-DD format or null if not found",
      "expirationDate": "YYYY-MM-DD format or null if not found",
      "subscriberDateOfBirth": "YYYY-MM-DD format or null if not found"
    }

    If you cannot clearly read any field, set it to null. Prioritize accuracy over completeness.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'HIPAA Insurance Form Auto-Fill'
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this insurance card image and extract the information in the specified JSON format.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      // Try fallback to GPT-4o if Gemini fails
      const fallbackResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'HIPAA Insurance Form Auto-Fill'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Please analyze this insurance card image and extract the information in the specified JSON format.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.1
        })
      });

      if (!fallbackResponse.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const fallbackData = await fallbackResponse.json();
      const content = fallbackData.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response content from AI model');
      }

      // Extract JSON from markdown code blocks if present
      let cleanContent = content.replace(/```json\s*|\s*```/g, '').trim();

      // Try to find JSON object if it's embedded in other text
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      }

      try {
        return JSON.parse(cleanContent);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Content that failed to parse:', cleanContent);
        throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from AI model');
    }

    // Extract JSON from markdown code blocks if present
    let cleanContent = content.replace(/```json\s*|\s*```/g, '').trim();

    // Try to find JSON object if it's embedded in other text
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanContent = jsonMatch[0];
    }

    try {
      return JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', cleanContent);
      throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  };

  // Handle auto-fill from uploaded insurance card
  const handleAutoFillFromCard = useCallback(async (file: File, isPrimary: boolean = true) => {
    setIsProcessingAI(true);
    setAiError(null);
    setAiSuccess(null);

    try {
      // Convert image to base64
      const base64Image = await fileToBase64(file);

      // Extract data using AI
      const extractedData = await extractInsuranceData(base64Image);

      // Auto-fill form fields
      const prefix = isPrimary ? 'primaryInsurance' : 'secondaryInsurance';

      if (extractedData.companyName) {
        setValue(`${prefix}.companyName` as any, extractedData.companyName);
      }

      if (extractedData.policyNumber) {
        setValue(`${prefix}.policyNumber` as any, extractedData.policyNumber);
      }

      if (extractedData.groupNumber) {
        setValue(`${prefix}.groupNumber` as any, extractedData.groupNumber);
      }

      if (extractedData.subscriberName) {
        setValue(`${prefix}.subscriberName` as any, extractedData.subscriberName);
      }

      if (extractedData.subscriberDateOfBirth) {
        setValue(`${prefix}.subscriberDateOfBirth` as any, extractedData.subscriberDateOfBirth);
      }

      setAiSuccess(`Successfully extracted insurance information from card! Please review and verify all fields.`);

    } catch (error) {
      console.error('Error processing insurance card:', error);
      setAiError(`Unable to extract information from card: ${error instanceof Error ? error.message : 'Unknown error'}. Please enter information manually.`);
    } finally {
      setIsProcessingAI(false);
    }
  }, [setValue]);

  // Handle file upload with auto-fill option
  const handleFileUploadWithAI = useCallback((fieldName: string, file: File | null, isPrimary: boolean = true) => {
    // Always upload the file first
    handleFileUpload(fieldName, file);

    // If it's a front card image and we have a file, offer auto-fill
    if (file && fieldName.includes('cardFrontImage')) {
      // Auto-trigger AI processing for front card images
      handleAutoFillFromCard(file, isPrimary);
    }
  }, [handleAutoFillFromCard]);

  return (
    <div className="space-y-8">
      {/* AI Processing Status */}
      {(isProcessingAI || aiError || aiSuccess) && (
        <div className="border border-gray-200 rounded-lg p-4">
          {isProcessingAI && (
            <div className="flex items-center space-x-3 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium">Analyzing insurance card with AI...</span>
            </div>
          )}

          {aiError && (
            <div className="flex items-start space-x-3 text-red-600">
              <svg className="h-5 w-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium">AI Processing Error</p>
                <p className="text-sm">{aiError}</p>
              </div>
            </div>
          )}

          {aiSuccess && (
            <div className="flex items-start space-x-3 text-green-600">
              <svg className="h-5 w-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium">AI Processing Complete</p>
                <p className="text-sm">{aiSuccess}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Primary Insurance */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Primary Insurance</h3>
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
            <span>Upload card front to auto-fill</span>
          </div>
        </div>
        
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800">AI Auto-Fill Available!</p>
                <p className="text-sm text-blue-700">
                  Upload the front of your insurance card and we'll automatically extract and fill in your insurance information using AI.
                  You can review and edit any fields afterward.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileUpload
              label="Front of Insurance Card"
              accept="image/*"
              onFileSelect={(file) => handleFileUploadWithAI('primaryInsurance.cardFrontImage', file, true)}
              helpText="📸 Auto-fill enabled! Upload to extract info with AI"
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-700">
                  💡 <strong>AI Auto-Fill:</strong> Upload the front card to automatically extract secondary insurance information.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUpload
                  label="Front of Secondary Insurance Card"
                  accept="image/*"
                  onFileSelect={(file) => handleFileUploadWithAI('secondaryInsurance.cardFrontImage', file, false)}
                  helpText="📸 Auto-fill enabled! Upload to extract info with AI"
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
