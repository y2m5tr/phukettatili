/**
 * Input validation utilities
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (international format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
}

/**
 * Sanitize text input (remove HTML tags and special characters)
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .trim();
}

/**
 * Validate date range
 */
export function isValidDateRange(start: Date, end: Date): boolean {
  return start < end && start >= new Date();
}

/**
 * Validate number of guests
 */
export function isValidGuestCount(count: number, min: number = 1, max: number = 50): boolean {
  return Number.isInteger(count) && count >= min && count <= max;
}
