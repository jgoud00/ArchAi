import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/utils/cn';

interface Suggestion {
    id: string;
    value: string;
    label?: string;
    description?: string;
}

interface SmartSuggestionsInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onSelect'> {
    suggestions: Suggestion[];
    onChange: (value: string) => void;
    onSuggestionSelect?: (suggestion: Suggestion) => void;
    label?: string;
    minChars?: number;
}

export const SmartSuggestionsInput = memo(({
    suggestions,
    onChange,
    onSuggestionSelect,
    label,
    minChars = 1,
    value,
    className,
    id,
    ...props
}: SmartSuggestionsInputProps) => {
    const [inputValue, setInputValue] = useState(value?.toString() || '');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredSuggestions = inputValue.length >= minChars
        ? suggestions.filter(s => s.value.toLowerCase().includes(inputValue.toLowerCase()) || s.label?.toLowerCase().includes(inputValue.toLowerCase()))
        : [];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setIsOpen(true);
        setSelectedIndex(-1);
        onChange(newValue);
    }, [onChange]);

    const handleSelect = useCallback((suggestion: Suggestion) => {
        setInputValue(suggestion.value);
        setIsOpen(false);
        onChange(suggestion.value);
        onSuggestionSelect?.(suggestion);
        inputRef.current?.focus();
    }, [onChange, onSuggestionSelect]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!isOpen || filteredSuggestions.length === 0) return;
        switch (e.key) {
            case 'ArrowDown': e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filteredSuggestions.length - 1)); break;
            case 'ArrowUp': e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); break;
            case 'Enter': e.preventDefault(); if (selectedIndex >= 0) handleSelect(filteredSuggestions[selectedIndex]); break;
            case 'Escape': setIsOpen(false); break;
        }
    }, [isOpen, filteredSuggestions, selectedIndex, handleSelect]);

    return (
        <div ref={containerRef} className="relative">
            {label && <label htmlFor={id} className="text-sm font-medium text-foreground block mb-1.5">{label}</label>}
            <input
                ref={inputRef}
                {...props}
                id={id}
                value={inputValue}
                onChange={handleChange}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                className={cn(
                    "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
                    "ring-offset-background transition-colors placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    className
                )}
                role="combobox"
                aria-expanded={isOpen && filteredSuggestions.length > 0}
                aria-autocomplete="list"
                aria-controls={`${id}-listbox`}
            />
            {isOpen && filteredSuggestions.length > 0 && (
                <ul id={`${id}-listbox`} className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto py-1" role="listbox">
                    {filteredSuggestions.map((suggestion, index) => (
                        <li
                            key={suggestion.id}
                            onClick={() => handleSelect(suggestion)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={cn("px-3 py-2 cursor-pointer transition-colors", index === selectedIndex ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted")}
                            role="option"
                            aria-selected={index === selectedIndex}
                        >
                            <div className="font-medium text-sm">{suggestion.label || suggestion.value}</div>
                            {suggestion.description && <div className="text-xs text-muted-foreground">{suggestion.description}</div>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
});

SmartSuggestionsInput.displayName = 'SmartSuggestionsInput';
