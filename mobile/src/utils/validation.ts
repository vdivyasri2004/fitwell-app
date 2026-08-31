export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateAge(age: unknown): ValidationResult {
  const n = Number(age);
  if (Number.isNaN(n) || n <= 0) return { valid: false, message: 'Please enter your age.' };
  if (n < 13) return { valid: false, message: 'Age must be at least 13.' };
  if (n > 120) return { valid: false, message: 'Please enter a valid age.' };
  return { valid: true };
}

export function validateHeight(cm: unknown): ValidationResult {
  const n = Number(cm);
  if (Number.isNaN(n) || n <= 0) return { valid: false, message: 'Please enter your height.' };
  if (n < 100) return { valid: false, message: 'Height seems too low. Please check and try again.' };
  if (n > 250) return { valid: false, message: 'Height seems too high. Please check and try again.' };
  return { valid: true };
}

export function validateWeight(kg: unknown): ValidationResult {
  const n = Number(kg);
  if (Number.isNaN(n) || n <= 0) return { valid: false, message: 'Please enter a valid weight.' };
  if (n < 25) return { valid: false, message: 'Weight seems too low. Please check and try again.' };
  if (n > 300) return { valid: false, message: 'Weight seems too high. Please check and try again.' };
  return { valid: true };
}

export function validatePositiveNumber(value: unknown, label: string): ValidationResult {
  const n = Number(value);
  if (Number.isNaN(n) || n <= 0) {
    return { valid: false, message: `${label} must be a positive number.` };
  }
  return { valid: true };
}

export function validateQuantity(value: unknown): ValidationResult {
  const n = Number(value);
  if (Number.isNaN(n) || n <= 0) {
    return { valid: false, message: 'Quantity must be greater than zero.' };
  }
  return { valid: true };
}

export function validateSleepTimes(bedtime: string, wakeTime: string): ValidationResult {
  if (!bedtime || !wakeTime) {
    return { valid: false, message: 'Please enter both bedtime and wake time.' };
  }
  if (bedtime === wakeTime) {
    return { valid: false, message: 'Bedtime and wake time cannot be the same.' };
  }
  return { valid: true };
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateEmail(value: string): ValidationResult {
  if (!value.trim()) return { valid: false, message: 'Please enter your email.' };
  if (!isEmail(value.trim())) return { valid: false, message: 'Please enter a valid email address.' };
  return { valid: true };
}

export function validatePassword(value: string): ValidationResult {
  if (!value) return { valid: false, message: 'Please enter a password.' };
  if (value.length < 6) return { valid: false, message: 'Password must be at least 6 characters.' };
  return { valid: true };
}

export function validateName(value: string): ValidationResult {
  if (!value.trim()) return { valid: false, message: 'Please enter your full name.' };
  if (value.trim().length < 2) return { valid: false, message: 'Please enter a valid name.' };
  return { valid: true };
}
