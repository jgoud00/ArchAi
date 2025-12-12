/**
 * Form validation types
 */

export interface ValidationRule {
    validate: (value: string) => boolean;
    message: string;
}

export interface Suggestion {
    id: string;
    value: string;
    label?: string;
    description?: string;
}
