/**
 * Input validation utilities
 */

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns boolean - True if email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // RFC 5322 compliant email regex (simplified version)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate phone number format
 * Supports various formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
 * @param phone - Phone number to validate
 * @returns boolean - True if phone is valid
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');

  // Check if it contains only digits and has reasonable length (7-15 digits)
  const phoneRegex = /^\d{7,15}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Validate license plate format
 * Supports alphanumeric combinations (format may vary by region)
 * @param licensePlate - License plate to validate
 * @returns boolean - True if license plate is valid
 */
export function isValidLicensePlate(licensePlate: string): boolean {
  if (!licensePlate || typeof licensePlate !== 'string') {
    return false;
  }

  // Alphanumeric, 2-10 characters, may include spaces or hyphens
  const licensePlateRegex = /^[A-Z0-9\s\-]{2,10}$/i;
  return licensePlateRegex.test(licensePlate.trim());
}

/**
 * Signup payload interface
 */
interface SignupPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  licensePlate?: string;
  password?: string;
}

/**
 * Validate signup payload
 * @param payload - Signup data to validate
 * @returns { valid: boolean, errors: string[] } - Validation result
 */
export function validateSignupPayload(payload: SignupPayload): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate fullName (required)
  if (!payload.fullName || typeof payload.fullName !== 'string') {
    errors.push('fullName is required and must be a string');
  } else if (payload.fullName.trim().length < 2) {
    errors.push('fullName must be at least 2 characters long');
  } else if (payload.fullName.trim().length > 100) {
    errors.push('fullName must be less than 100 characters');
  }

  // Validate email (required)
  if (!payload.email || typeof payload.email !== 'string') {
    errors.push('email is required and must be a string');
  } else if (!isValidEmail(payload.email)) {
    errors.push('email format is invalid');
  }

  // Validate password (required)
  if (!payload.password || typeof payload.password !== 'string') {
    errors.push('password is required and must be a string');
  } else if (payload.password.length < 6) {
    errors.push('password must be at least 6 characters long');
  } else if (payload.password.length > 128) {
    errors.push('password must be less than 128 characters');
  }

  // Validate phone (optional)
  if (payload.phone !== undefined && payload.phone !== null) {
    if (typeof payload.phone !== 'string') {
      errors.push('phone must be a string');
    } else if (payload.phone.trim() !== '' && !isValidPhone(payload.phone)) {
      errors.push('phone format is invalid');
    }
  }

  // Validate licensePlate (optional)
  if (payload.licensePlate !== undefined && payload.licensePlate !== null) {
    if (typeof payload.licensePlate !== 'string') {
      errors.push('licensePlate must be a string');
    } else if (
      payload.licensePlate.trim() !== '' &&
      !isValidLicensePlate(payload.licensePlate)
    ) {
      errors.push('licensePlate format is invalid');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
