'use client';

import React, { useState, useRef, useEffect } from 'react';
import { formatDateInput, isValidDate, convertToISODate, convertFromISODate } from '@/lib/date-utils';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
}

export function DateInput({
  value,
  onChange,
  onBlur,
  placeholder = "MM-DD-YYYY",
  className = "",
  required = false,
  disabled = false,
  name,
  id
}: DateInputProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'date'>('text');
  const textInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close calendar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    onChange(formatted);
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoDate = e.target.value;
    if (isoDate) {
      const mmddyyyy = convertFromISODate(isoDate);
      onChange(mmddyyyy);
    } else {
      onChange('');
    }
    setShowCalendar(false);
  };

  const handleCalendarClick = () => {
    setShowCalendar(true);
    setInputMode('date');
    
    // Convert current value to ISO format for date input
    if (value && isValidDate(value)) {
      const isoDate = convertToISODate(value);
      setTimeout(() => {
        if (dateInputRef.current) {
          dateInputRef.current.value = isoDate;
          dateInputRef.current.focus();
        }
      }, 0);
    } else {
      setTimeout(() => {
        if (dateInputRef.current) {
          dateInputRef.current.focus();
        }
      }, 0);
    }
  };

  const handleTextInputFocus = () => {
    setInputMode('text');
    setShowCalendar(false);
  };

  const baseInputClasses = `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input ${className}`;

  return (
    <div ref={containerRef} className="relative">
      <div className="flex">
        {/* Text input for manual typing */}
        <input
          ref={textInputRef}
          type="text"
          value={value}
          onChange={handleTextInputChange}
          onFocus={handleTextInputFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`${baseInputClasses} rounded-r-none border-r-0`}
          maxLength={10}
          required={required}
          disabled={disabled}
          name={name}
          id={id}
        />
        
        {/* Calendar button */}
        <button
          type="button"
          onClick={handleCalendarClick}
          disabled={disabled}
          className="px-3 py-2 border border-gray-300 border-l-0 rounded-r-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Open calendar"
        >
          <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Hidden date input for calendar popup */}
      {showCalendar && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <input
            ref={dateInputRef}
            type="date"
            onChange={handleDateInputChange}
            className="w-full px-3 py-2 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ minWidth: '200px' }}
          />
        </div>
      )}
    </div>
  );
}
