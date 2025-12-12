import { memo, ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { layout, textStyles } from '@/styles/designTokens';

interface SectionProps {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
    headerActions?: ReactNode;
}

/**
 * Section - Reusable section component with optional title and description
 */
export const Section = memo(({ title, description, children, className, headerActions }: SectionProps) => {
    return (
        <section className={cn(layout.sectionSpacing, className)}>
            {(title || description || headerActions) && (
                <div className="flex justify-between items-start mb-4">
                    <div>
                        {title && <h2 className={cn(textStyles.h2, 'text-foreground')}>{title}</h2>}
                        {description && <p className={cn(textStyles.small, 'mt-1')}>{description}</p>}
                    </div>
                    {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
                </div>
            )}
            {children}
        </section>
    );
});

Section.displayName = 'Section';
