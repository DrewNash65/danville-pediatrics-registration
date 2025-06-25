'use client';

import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
}

export function FormField({ label, required, error, helpText, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-blue-800">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className={`${error ? 'ring-2 ring-red-300 rounded-md' : ''}`}>
        {children}
      </div>

      {helpText && !error && (
        <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">{helpText}</p>
      )}

      {error && (
        <div className="flex items-center text-sm text-red-600 bg-red-50 p-2 rounded">
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
