import { FieldErrors } from 'react-hook-form';

/**
 * Finds the first invalid field and scrolls it into view with a highlighted animation
 * @param errors - React Hook Form errors object
 * @param formContainer - The container element of the form
 * @returns boolean - Whether an invalid field was found
 */
export function findAndScrollToFirstInvalidField(
  errors: FieldErrors,
  formContainer?: HTMLElement | null
): boolean {
  // Get all error field names recursively
  const errorFieldNames = extractErrorFieldNames(errors);

  if (errorFieldNames.length === 0) {
    return false;
  }

  // Try to find the first invalid field element
  for (const fieldName of errorFieldNames) {
    const fieldElement = findFieldElement(fieldName);
    if (fieldElement) {
      // Add error highlight animation
      addErrorHighlight(fieldElement);

      // Scroll the field into view
      scrollToField(fieldElement);

      // Focus on the input if possible
      focusFieldInput(fieldElement);

      return true;
    }
  }

  return false;
}

/**
 * Recursively extracts field names from a nested error object
 */
function extractErrorFieldNames(errors: FieldErrors, parentPath = ''): string[] {
  const fieldNames: string[] = [];

  for (const [key, value] of Object.entries(errors)) {
    const currentPath = parentPath ? `${parentPath}.${key}` : key;

    if (value && typeof value === 'object') {
      if ('message' in value) {
        // This is a field error
        fieldNames.push(currentPath);
      } else {
        // This is a nested object, recurse
        fieldNames.push(...extractErrorFieldNames(value as FieldErrors, currentPath));
      }
    }
  }

  return fieldNames;
}

/**
 * Finds a field element by its name
 */
function findFieldElement(fieldName: string): HTMLElement | null {
  // Convert field name to match common HTML input name patterns
  const possibleNames = [
    fieldName,
    fieldName.replace(/\./g, '[') + (fieldName.includes('.') ? ']' : ''),
    fieldName.split('.').pop(), // Last part of nested field name
    ...fieldName.split('.') // All parts of nested field name
  ];

  for (const name of possibleNames) {
    // Try different selectors to find the field
    const selectors = [
      `[name="${name}"]`,
      `[data-testid="${name}"]`,
      `[id="${name}"]`,
      `[aria-label*="${name}"]`,
      `[placeholder*="${name}"]`
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element && isFormField(element)) {
        return element;
      }
    }
  }

  return null;
}

/**
 * Checks if an element is a form field
 */
function isFormField(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase();
  return ['input', 'select', 'textarea'].includes(tagName);
}

/**
 * Adds error highlight animation to a field and its container
 */
function addErrorHighlight(fieldElement: HTMLElement): void {
  // Find the containing form field div
  let container = fieldElement.closest('.space-y-2') as HTMLElement;

  if (!container) {
    // Try other common container patterns
    container = fieldElement.closest('[class*="field"]') as HTMLElement ||
                fieldElement.closest('[class*="form"]') as HTMLElement ||
                fieldElement.parentElement as HTMLElement;
  }

  if (container) {
    // Remove any existing error highlights
    document.querySelectorAll('.field-error-highlight').forEach(el => {
      el.classList.remove('field-error-highlight');
    });

    // Add error highlight to the container
    container.classList.add('field-error-highlight', 'field-error-container');

    // Remove the highlight after animation completes
    setTimeout(() => {
      container.classList.remove('field-error-highlight');
    }, 4500); // Animation duration + small buffer
  }
}

/**
 * Scrolls a field into view smoothly
 */
function scrollToField(fieldElement: HTMLElement): void {
  // Use scrollIntoView with smooth behavior
  fieldElement.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest'
  });
}

/**
 * Attempts to focus on the input element
 */
function focusFieldInput(fieldElement: HTMLElement): void {
  if (isFormField(fieldElement)) {
    // Focus on the field itself
    (fieldElement as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).focus();
  } else {
    // Try to find an input within the container
    const input = fieldElement.querySelector('input, select, textarea') as
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (input) {
      input.focus();
    }
  }
}

/**
 * Removes all error highlights from the form
 */
export function removeAllErrorHighlights(): void {
  document.querySelectorAll('.field-error-highlight').forEach(el => {
    el.classList.remove('field-error-highlight');
  });
}