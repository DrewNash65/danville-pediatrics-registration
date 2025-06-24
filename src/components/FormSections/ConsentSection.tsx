'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RegistrationFormData } from '@/lib/validation';

interface ConsentSectionProps {
  form: UseFormReturn<RegistrationFormData>;
}

export function ConsentSection({ form }: ConsentSectionProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Required Agreements</h4>
        <p className="text-sm text-blue-700">
          Please read and agree to the following policies and consents. These are required 
          to complete your registration with Danville Pediatrics.
        </p>
      </div>

      {/* Consent to Treatment */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Consent to Treatment</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm text-gray-700 max-h-64 overflow-y-auto">
          <p className="mb-3">
            <strong>CONSENT TO TREATMENT</strong>
          </p>
          <p className="mb-3">
            I hereby give my consent for the healthcare providers at Danville Pediatrics (1-to-1 Pediatrics) 
            to examine, diagnose, and treat my child. I understand that:
          </p>
          <ul className="list-disc ml-6 space-y-2 mb-3">
            <li>No guarantee has been made to me as to the result of examination or treatment.</li>
            <li>I have the right to be informed of the proposed treatment, the risks involved, and alternative treatments.</li>
            <li>I have the right to refuse any proposed treatment.</li>
            <li>The practice of medicine is not an exact science and that reputable practitioners may differ in their approaches to treatment.</li>
            <li>In case of emergency, when I cannot be reached, the healthcare providers are authorized to provide necessary emergency care for my child.</li>
          </ul>
          <p className="mb-3">
            I acknowledge that I have read and understand this consent form and that all my questions 
            have been answered to my satisfaction.
          </p>
        </div>

        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            {...register('consentToTreatment')}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            <strong>I agree</strong> to the Consent to Treatment as outlined above. 
            <span className="text-red-600">*</span>
          </span>
        </label>
        
        {errors.consentToTreatment && (
          <p className="text-red-600 text-sm mt-2">{errors.consentToTreatment.message}</p>
        )}
      </div>

      {/* HIPAA Acknowledgment */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">HIPAA Privacy Acknowledgment</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm text-gray-700 max-h-64 overflow-y-auto">
          <p className="mb-3">
            <strong>NOTICE OF PRIVACY PRACTICES ACKNOWLEDGMENT</strong>
          </p>
          <p className="mb-3">
            The Health Insurance Portability and Accountability Act (HIPAA) provides safeguards to protect 
            your privacy. Implementation of HIPAA requirements officially began on April 14, 2003.
          </p>
          <p className="mb-3">
            Many of the policies have been our practice for years. This form is a "friendly" version. 
            Our complete HIPAA Privacy Policy is available at our office.
          </p>
          <p className="mb-3">
            <strong>What this is all about:</strong> Specifically, there are rules and restrictions on who may 
            see or be notified of your Protected Health Information (PHI). These restrictions do not include 
            the normal interchange of information necessary to provide you with office services.
          </p>
          <p className="mb-3">
            <strong>What we need from you:</strong> We must formally request your permission to use and 
            disclose your health information for the purposes of treatment, payment, and healthcare operations.
          </p>
          <ul className="list-disc ml-6 space-y-2 mb-3">
            <li><strong>Treatment:</strong> We will use your health information to provide you with medical treatment and services.</li>
            <li><strong>Payment:</strong> We will use your health information to bill and collect payment for services.</li>
            <li><strong>Healthcare Operations:</strong> We will use your health information to operate our practice efficiently and ensure quality care.</li>
          </ul>
        </div>

        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            {...register('hipaaAcknowledgment')}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            <strong>I acknowledge</strong> that I have received and understand the HIPAA Privacy Notice 
            and consent to the use and disclosure of my child's health information for treatment, payment, 
            and healthcare operations. <span className="text-red-600">*</span>
          </span>
        </label>
        
        {errors.hipaaAcknowledgment && (
          <p className="text-red-600 text-sm mt-2">{errors.hipaaAcknowledgment.message}</p>
        )}
      </div>

      {/* Financial Policy Agreement */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Policy Agreement</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm text-gray-700 max-h-64 overflow-y-auto">
          <p className="mb-3">
            <strong>FINANCIAL POLICY</strong>
          </p>
          <p className="mb-3">
            Thank you for choosing Danville Pediatrics for your child's healthcare needs. 
            We are committed to providing excellent care and want you to understand our financial policies.
          </p>
          <p className="mb-3">
            <strong>Insurance:</strong> We participate with most major insurance plans. As a courtesy, 
            we will bill your insurance company for services provided. However, you are ultimately 
            responsible for all charges incurred.
          </p>
          <p className="mb-3">
            <strong>Co-payments and Deductibles:</strong> Co-payments and deductibles are due at the 
            time of service. We accept cash, check, and credit cards.
          </p>
          <p className="mb-3">
            <strong>Non-covered Services:</strong> Some services may not be covered by your insurance. 
            You will be responsible for payment of these services.
          </p>
          <p className="mb-3">
            <strong>Missed Appointments:</strong> We require 24-hour notice for appointment cancellations. 
            A fee may be charged for missed appointments without proper notice.
          </p>
          <p className="mb-3">
            <strong>Past Due Accounts:</strong> Accounts not paid within 90 days may be turned over 
            to a collection agency. You will be responsible for all collection costs.
          </p>
        </div>

        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            {...register('financialPolicyAgreement')}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            <strong>I agree</strong> to the Financial Policy as outlined above and understand my 
            financial responsibilities. <span className="text-red-600">*</span>
          </span>
        </label>
        
        {errors.financialPolicyAgreement && (
          <p className="text-red-600 text-sm mt-2">{errors.financialPolicyAgreement.message}</p>
        )}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-800 mb-2">Ready to Submit</h4>
        <p className="text-sm text-green-700">
          Once you agree to all the required policies above, you can submit your registration. 
          Our office will review your information and contact you within 1-2 business days to 
          schedule your first appointment.
        </p>
      </div>
    </div>
  );
}
