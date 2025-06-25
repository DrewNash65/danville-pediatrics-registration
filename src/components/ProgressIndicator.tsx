'use client';

import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function ProgressIndicator({ currentStep, totalSteps, steps }: ProgressIndicatorProps) {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="mb-8 bg-white rounded-lg shadow-md p-6">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-6 shadow-inner">
        <div
          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-in-out shadow-sm"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-md ${
                index <= currentStep
                  ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white transform scale-110'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {index < currentStep ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span
              className={`text-xs mt-2 text-center max-w-20 transition-colors ${
                index <= currentStep ? 'text-blue-600 font-semibold' : 'text-gray-500'
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>

      {/* Current Step Info */}
      <div className="text-center mt-6">
        <div className="bg-blue-50 rounded-lg p-3 inline-block">
          <p className="text-sm text-blue-800 font-medium">
            Step {currentStep + 1} of {totalSteps}: <span className="font-semibold">{steps[currentStep]}</span>
          </p>
          <div className="text-xs text-blue-600 mt-1">
            {Math.round(progressPercentage)}% Complete
          </div>
        </div>
      </div>
    </div>
  );
}
