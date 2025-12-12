/**
 * Common Validation Rules
 * 
 * Reusable validation rules for form inputs.
 * Returns human-readable error messages.
 */

import { ValidationRule } from '@/types/form';

// ============================================
// EMAIL VALIDATION
// ============================================

export const emailRules: ValidationRule[] = [
    {
        validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Please enter a valid email address (e.g., name@example.com)',
    },
];

// ============================================
// PASSWORD VALIDATION
// ============================================

export const passwordRules: ValidationRule[] = [
    {
        validate: (value) => value.length >= 8,
        message: 'Password must be at least 8 characters long',
    },
    {
        validate: (value) => /[A-Z]/.test(value),
        message: 'Password must contain at least one uppercase letter',
    },
    {
        validate: (value) => /[a-z]/.test(value),
        message: 'Password must contain at least one lowercase letter',
    },
    {
        validate: (value) => /[0-9]/.test(value),
        message: 'Password must contain at least one number',
    },
];

export const simplePasswordRules: ValidationRule[] = [
    {
        validate: (value) => value.length >= 6,
        message: 'Password must be at least 6 characters',
    },
];

// ============================================
// NAME VALIDATION
// ============================================

export const nameRules: ValidationRule[] = [
    {
        validate: (value) => value.trim().length >= 2,
        message: 'Name must be at least 2 characters',
    },
    {
        validate: (value) => /^[a-zA-Z\s'-]+$/.test(value),
        message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
    },
];

export const projectNameRules: ValidationRule[] = [
    {
        validate: (value) => value.trim().length >= 3,
        message: 'Project name must be at least 3 characters',
    },
    {
        validate: (value) => value.trim().length <= 50,
        message: 'Project name must be less than 50 characters',
    },
];

// ============================================
// PHONE VALIDATION
// ============================================

export const phoneRules: ValidationRule[] = [
    {
        validate: (value) => /^[\d\s\-+()]{10,}$/.test(value),
        message: 'Please enter a valid phone number',
    },
];

// ============================================
// URL VALIDATION
// ============================================

export const urlRules: ValidationRule[] = [
    {
        validate: (value) => {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        },
        message: 'Please enter a valid URL (e.g., https://example.com)',
    },
];

// ============================================
// NUMBER VALIDATION
// ============================================

export const positiveNumberRules: ValidationRule[] = [
    {
        validate: (value) => !isNaN(Number(value)) && Number(value) > 0,
        message: 'Please enter a positive number',
    },
];

export const percentageRules: ValidationRule[] = [
    {
        validate: (value) => {
            const num = Number(value);
            return !isNaN(num) && num >= 0 && num <= 100;
        },
        message: 'Please enter a value between 0 and 100',
    },
];

export const currencyRules: ValidationRule[] = [
    {
        validate: (value) => /^\d+(\.\d{1,2})?$/.test(value),
        message: 'Please enter a valid amount (e.g., 100 or 100.50)',
    },
];

// ============================================
// DATE VALIDATION
// ============================================

export const futureDateRules: ValidationRule[] = [
    {
        validate: (value) => {
            const date = new Date(value);
            return date > new Date();
        },
        message: 'Date must be in the future',
    },
];

export const pastDateRules: ValidationRule[] = [
    {
        validate: (value) => {
            const date = new Date(value);
            return date < new Date();
        },
        message: 'Date must be in the past',
    },
];

// ============================================
// TEXT LENGTH VALIDATION FACTORY
// ============================================

export const minLengthRule = (min: number, fieldName = 'This field'): ValidationRule => ({
    validate: (value) => value.trim().length >= min,
    message: `${fieldName} must be at least ${min} characters`,
});

export const maxLengthRule = (max: number, fieldName = 'This field'): ValidationRule => ({
    validate: (value) => value.trim().length <= max,
    message: `${fieldName} must be less than ${max} characters`,
});

// ============================================
// MATCH VALIDATION FACTORY
// ============================================

export const matchRule = (otherValue: string, fieldName = 'Fields'): ValidationRule => ({
    validate: (value) => value === otherValue,
    message: `${fieldName} do not match`,
});

// ============================================
// PATTERN VALIDATION FACTORY
// ============================================

export const patternRule = (pattern: RegExp, message: string): ValidationRule => ({
    validate: (value) => pattern.test(value),
    message,
});

// ============================================
// CUSTOM VALIDATION FACTORY
// ============================================

export const customRule = (
    validate: (value: string) => boolean,
    message: string
): ValidationRule => ({
    validate,
    message,
});
