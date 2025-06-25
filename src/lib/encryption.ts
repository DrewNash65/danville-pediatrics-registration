import CryptoJS from 'crypto-js';

// Environment variables for encryption
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

/**
 * Encrypts sensitive data using AES encryption
 * @param text - The text to encrypt
 * @returns Encrypted string
 */
export function encryptData(text: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts data that was encrypted with encryptData
 * @param encryptedText - The encrypted text to decrypt
 * @returns Decrypted string
 */
export function decryptData(encryptedText: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hashes sensitive data for storage (one-way)
 * @param text - The text to hash
 * @returns Hashed string
 */
export function hashData(text: string): string {
  return CryptoJS.SHA256(text).toString();
}

/**
 * Generates a secure random ID for submissions
 * @returns Random ID string
 */
export function generateSubmissionId(): string {
  const timestamp = Date.now().toString();
  const random = CryptoJS.lib.WordArray.random(16).toString();
  return `SUB_${timestamp}_${random}`;
}

/**
 * Sanitizes input to prevent XSS attacks
 * @param input - The input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validates file upload for security
 * @param file - The file to validate
 * @returns Validation result
 */
export function validateFileUpload(file: File): { isValid: boolean; error?: string } {
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }

  // Check file type (only images)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, PNG, and GIF images are allowed' };
  }

  // Check file name for security
  const fileName = file.name.toLowerCase();
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.js', '.vbs'];
  if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
    return { isValid: false, error: 'File type not allowed' };
  }

  return { isValid: true };
}

/**
 * Creates an audit log entry
 * @param action - The action performed
 * @param userId - The user ID (if applicable)
 * @param details - Additional details
 * @returns Audit log entry
 */
export function createAuditLog(action: string, userId?: string, details?: any) {
  return {
    timestamp: new Date().toISOString(),
    action,
    userId: userId || 'anonymous',
    details: details || {},
    ip: 'server-side', // Will be populated by API route
    userAgent: 'server-side', // Will be populated by API route
  };
}

/**
 * Masks sensitive data for logging
 * @param data - The data to mask
 * @returns Masked data
 */
export function maskSensitiveData(data: any): any {
  const masked = { ...data };
  
  // Mask SSN
  if (masked.socialSecurityNumber) {
    masked.socialSecurityNumber = 'XXX-XX-' + masked.socialSecurityNumber.slice(-4);
  }
  
  // Mask credit card or policy numbers
  if (masked.policyNumber && masked.policyNumber.length > 4) {
    masked.policyNumber = 'XXXX-' + masked.policyNumber.slice(-4);
  }
  
  // Mask email
  if (masked.email) {
    const [username, domain] = masked.email.split('@');
    masked.email = username.slice(0, 2) + 'XXX@' + domain;
  }
  
  return masked;
}
