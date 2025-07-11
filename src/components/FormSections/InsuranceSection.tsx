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
      throw new Error('AI auto-fill feature is not configured. Please enter insurance information manually.');
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

    let response;
    try {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
    } catch (networkError) {
      console.error('Network error connecting to OpenRouter API:', networkError);
      throw new Error('Unable to connect to AI service. Please check your internet connection and try again, or enter insurance information manually.');
    }

    if (!response.ok) {
      // Try fallback to GPT-4o if Gemini fails
      let fallbackResponse;
      try {
        fallbackResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
      } catch (fallbackNetworkError) {
        console.error('Network error on fallback API call:', fallbackNetworkError);
        throw new Error('AI service is currently unavailable. Please enter insurance information manually.');
      }

      if (!fallbackResponse.ok) {
        const errorMessage = fallbackResponse.status === 401
          ? 'AI service authentication failed. Please contact support.'
          : fallbackResponse.status === 429
          ? 'AI service is busy. Please try again in a moment or enter information manually.'
          : `AI service error (${fallbackResponse.status}). Please enter insurance information manually.`;
        throw new Error(errorMessage);
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

  // Simple connectivity test
  const testConnectivity = async (): Promise<boolean> => {
    try {
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      return response.ok;
    } catch {
      return false;
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

      // Test connectivity to provide better error messages
      const hasConnectivity = await testConnectivity();

      let errorMessage = '';
      if (!hasConnectivity) {
        errorMessage = 'No internet connection detected. Please check your network connection and try again.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Unknown error occurred while processing the insurance card.';
      }

      setAiError(errorMessage);
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
      {/* Photo Upload Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              📸 Start Here: Upload Insurance Card Photos
            </h3>
            <p className="text-gray-700 mb-4">
              For the fastest and most accurate completion, photograph both sides of your insurance cards below.
              Our AI will automatically extract the information and fill in the form fields for you.
            </p>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="flex items-center space-x-2 text-sm text-blue-800">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">💡 Pro Tip:</span>
                <span>Take clear, well-lit photos with all text visible. You can always edit the information manually after upload.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Insurance Card Photo Upload Section */}
      <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">1</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Primary Insurance Card Photos</h3>
        </div>
        <p className="text-gray-600 mb-4 text-sm">
          📱 Use your phone camera to photograph both sides of your primary insurance card.
          The information will be automatically extracted and filled in the form below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <FileUpload
              label="📸 Front of Primary Insurance Card"
              accept="image/*"
              onFileSelect={(file) => handleFileUploadWithAI('primaryInsurance.cardFrontImage', file, true)}
              helpText="🤖 AI auto-fill enabled - Upload to extract member info"
              enableCamera={true}
            />
          </div>

          <div className="space-y-2">
            <FileUpload
              label="📸 Back of Primary Insurance Card"
              accept="image/*"
              onFileSelect={(file) => handleFileUpload('primaryInsurance.cardBackImage', file)}
              helpText="📄 Will be included in PDF submission"
              enableCamera={true}
            />
          </div>
        </div>
      </div>

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
            <div className="flex items-start space-x-3 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <svg className="h-5 w-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium">AI Auto-Fill Unavailable</p>
                <p className="text-sm">{aiError}</p>
                <p className="text-xs mt-1 text-amber-700">💡 You can still complete the form by entering insurance information manually below.</p>
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
