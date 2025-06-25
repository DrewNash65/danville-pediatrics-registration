'use client';

import React, { forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  options: SelectOption[];
  placeholder?: string;
  name?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, required, error, helpText, options, placeholder, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-blue-800">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <select
          ref={ref}
          {...props}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
            error
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500 hover:border-blue-400'
          }`}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

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
);

SelectField.displayName = 'SelectField';
