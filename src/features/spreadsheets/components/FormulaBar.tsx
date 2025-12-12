/**
 * FormulaBar - Display and edit cell formulas
 */

import { memo, useCallback, useRef } from 'react';
import { useSpreadsheetStore } from '@/features/spreadsheets/store/spreadsheetStore';
import { cn } from '@/utils/cn';

interface FormulaBarProps {
    className?: string;
}

export const FormulaBar = memo(({ className }: FormulaBarProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const {
        selection,
        isEditing,
        editingValue,
        data,
        startEditing,
        stopEditing,
        setEditingValue,
    } = useSpreadsheetStore();

    // Get current cell info
    const activeRef = selection?.active || '';
    const cell = activeRef ? data.cells[activeRef] : null;
    const displayValue = cell?.formula || String(cell?.value ?? '');

    // Handle input change
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingValue(e.target.value);
    }, [setEditingValue]);

    // Handle focus
    const handleFocus = useCallback(() => {
        if (!isEditing) {
            startEditing(displayValue);
        }
    }, [isEditing, startEditing, displayValue]);

    // Handle key down
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            stopEditing(true);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            stopEditing(false);
        }
    }, [stopEditing]);

    return (
        <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 bg-card border-b border-border",
            className
        )}>
            {/* Cell reference */}
            <div className="w-16 px-2 py-1 text-sm font-mono bg-muted rounded text-center">
                {activeRef || '-'}
            </div>

            {/* Function indicator */}
            <div className="text-muted-foreground text-lg font-bold">
                fx
            </div>

            {/* Formula input */}
            <input
                ref={inputRef}
                type="text"
                value={isEditing ? editingValue : displayValue}
                onChange={handleChange}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                className={cn(
                    "flex-1 px-2 py-1 text-sm font-mono bg-background border border-border rounded",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                )}
                placeholder="Enter value or formula (e.g., =SUM(A1:A10))"
            />
        </div>
    );
});

FormulaBar.displayName = 'FormulaBar';
