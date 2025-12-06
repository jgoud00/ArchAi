import React, { useState } from 'react';
import { cn } from '@/utils/cn';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'right' | 'bottom' | 'left';
    className?: string;
    delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'right',
    className,
    delay = 200,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

    const showTooltip = () => {
        const id = setTimeout(() => setIsVisible(true), delay);
        setTimeoutId(id);
    };

    const hideTooltip = () => {
        if (timeoutId) clearTimeout(timeoutId);
        setIsVisible(false);
    };

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    };

    return (
        <div
            className="relative flex items-center"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            {children}
            {isVisible && (
                <div
                    className={cn(
                        'absolute z-50 px-2 py-1 text-xs font-medium text-primary-foreground bg-primary/90 rounded shadow-lg backdrop-blur-sm whitespace-nowrap animate-in fade-in zoom-in-95 duration-200',
                        positionClasses[position],
                        className
                    )}
                >
                    {content}
                    {/* Arrow */}
                    <div
                        className={cn(
                            'absolute w-2 h-2 bg-primary/90 rotate-45',
                            position === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
                            position === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2',
                            position === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
                            position === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2'
                        )}
                    />
                </div>
            )}
        </div>
    );
};
