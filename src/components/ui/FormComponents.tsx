import { memo, ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { formStyles } from '@/styles/designTokens';

interface FormFieldProps {
    children: ReactNode;
    className?: string;
}

/**
 * FormField - Wrapper for form fields with consistent spacing
 */
export const FormField = memo(({ children, className }: FormFieldProps) => {
    return (
        <div className={cn(formStyles.fieldWrapper, className)}>
            {children}
        </div>
    );
});

FormField.displayName = 'FormField';

interface FormActionsProps {
    children: ReactNode;
    align?: 'left' | 'center' | 'right';
    className?: string;
}

/**
 * FormActions - Footer actions for forms
 */
export const FormActions = memo(({ children, align = 'right', className }: FormActionsProps) => {
    const alignClass = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end',
    }[align];

    return (
        <div className={cn('flex gap-2', alignClass, className)}>
            {children}
        </div>
    );
});

FormActions.displayName = 'FormActions';

interface FieldErrorProps {
    children: ReactNode;
}

/**
 * FieldError - Error message for form fields
 */
export const FieldError = memo(({ children }: FieldErrorProps) => {
    if (!children) return null;

    return (
        <p className={formStyles.error}>
            {children}
        </p>
    );
});

FieldError.displayName = 'FieldError';
