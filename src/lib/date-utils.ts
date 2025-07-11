/**
 * Date utility functions for handling MM-DD-YYYY format
 */

/**
 * Format a date input as MM-DD-YYYY while typing
 * @param value - The input value
 * @returns Formatted date string
 */
export function formatDateInput(value: string): string {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '');
  
  // Apply MM-DD-YYYY formatting
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
  } else {
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 4)}-${numbers.slice(4, 8)}`;
  }
}

/**
 * Validate if a date string in MM-DD-YYYY format is a valid date
 * @param dateString - Date string in MM-DD-YYYY format
 * @returns True if valid date, false otherwise
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString || !/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    return false;
  }
  
  const [month, day, year] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Convert MM-DD-YYYY to YYYY-MM-DD for internal processing
 * @param mmddyyyy - Date string in MM-DD-YYYY format
 * @returns Date string in YYYY-MM-DD format
 */
export function convertToISODate(mmddyyyy: string): string {
  if (!mmddyyyy || !/^\d{2}-\d{2}-\d{4}$/.test(mmddyyyy)) {
    return '';
  }
  
  const [month, day, year] = mmddyyyy.split('-');
  return `${year}-${month}-${day}`;
}

/**
 * Convert YYYY-MM-DD to MM-DD-YYYY for display
 * @param isoDate - Date string in YYYY-MM-DD format
 * @returns Date string in MM-DD-YYYY format
 */
export function convertFromISODate(isoDate: string): string {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return '';
  }
  
  const [year, month, day] = isoDate.split('-');
  return `${month}-${day}-${year}`;
}

/**
 * Get current date in MM-DD-YYYY format
 * @returns Current date string in MM-DD-YYYY format
 */
export function getCurrentDateMMDDYYYY(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const year = String(now.getFullYear());
  
  return `${month}-${day}-${year}`;
}

/**
 * Calculate age from date of birth in MM-DD-YYYY format
 * @param dateOfBirth - Date of birth in MM-DD-YYYY format
 * @returns Age in years
 */
export function calculateAge(dateOfBirth: string): number {
  if (!isValidDate(dateOfBirth)) {
    return 0;
  }
  
  const [month, day, year] = dateOfBirth.split('-').map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}
