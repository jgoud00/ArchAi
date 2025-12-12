import { memo, useState, useEffect, useCallback } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ValidationRule {
    validate: (value: string) => boolean;
    message: string;
}

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    rules?: ValidationRule[];
    validateOnBlur?: boolean;
    validateOnChange?: boolean;
    error?: string;
    successMessage?: string;
    hint?: string;
    label?: string;
}

export const ValidatedInput = memo(({
    rules = [],
    validateOnBlur = true,
    validateOnChange = false,
    error: externalError,
    successMessage,
    hint,
    label,
    required,
    className,
    onChange,
    onBlur,
    value,
    id,
    ...props
}: ValidatedInputProps) => {
    const [internalValue, setInternalValue] = useState(value?.toString() || '');
    const [touched, setTouched] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        if (value !== undefined) setInternalValue(value.toString());
    }, [value]);

    const validate = useCallback((val: string): string | null => {
        if (required && !val.trim()) return `${label || 'This field'} is required`;
        for (const rule of rules) {
            if (!rule.validate(val)) return rule.message;
        }
        return null;
    }, [rules, required, label]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInternalValue(newValue);
        if (validateOnChange && touched) setValidationError(validate(newValue));
        onChange?.(e);
    }, [validateOnChange, touched, validate, onChange]);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        setTouched(true);
        if (validateOnBlur) setValidationError(validate(internalValue));
        onBlur?.(e);
    }, [validateOnBlur, validate, internalValue, onBlur]);

    const error = externalError || (touched ? validationError : null);
    const isValid = touched && !error && internalValue.trim();

    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-foreground">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    {...props}
                    id={id}
                    value={internalValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(
                        "flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm pr-10",
                        "ring-offset-background transition-colors duration-200",
                        "placeholder:text-muted-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        error
                            ? "border-red-500 focus-visible:ring-red-500/30"
                            : isValid
                                ? "border-green-500 focus-visible:ring-green-500/30"
                                : "border-input focus-visible:ring-ring",
                        className
                    )}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
                />
                {touched && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {error ? <AlertCircle className="h-4 w-4 text-red-500" /> : isValid ? <Check className="h-4 w-4 text-green-500" /> : null}
                    </div>
                )}
            </div>
            {error && (
                <p id={`${id}-error`} className="text-xs text-red-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="h-3 w-3" />{error}
                </p>
            )}
            {!error && isValid && successMessage && (
                <p className="text-xs text-green-600 flex items-center gap-1"><Check className="h-3 w-3" />{successMessage}</p>
            )}
            {!error && hint && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    );
});

ValidatedInput.displayName = 'ValidatedInput';
