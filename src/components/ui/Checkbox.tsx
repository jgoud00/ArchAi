import * as React from "react";
import { cn } from "@/utils/cn";

interface CheckboxProps {
    id?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    className?: string;
    disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
    id,
    checked,
    onCheckedChange,
    className,
    disabled = false,
}) => {
    return (
        <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
            disabled={disabled}
            className={cn(
                "h-4 w-4 rounded border-border bg-background text-primary",
                "focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "cursor-pointer",
                className
            )}
        />
    );
};
