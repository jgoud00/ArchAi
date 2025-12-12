/**
 * OutlinePanel - Document outline based on headings
 */

import { memo, useCallback } from 'react';
import { useDocumentStore } from '@/features/documents/store/documentStore';
import { DocumentHeading } from '@/types/document';
import { List, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface OutlinePanelProps {
    className?: string;
    onHeadingClick?: (heading: DocumentHeading) => void;
}

export const OutlinePanel = memo(({ className, onHeadingClick }: OutlinePanelProps) => {
    const { headings, document } = useDocumentStore();

    const handleClick = useCallback((heading: DocumentHeading) => {
        onHeadingClick?.(heading);

        // Scroll to heading in editor (best effort)
        const element = window.document.querySelector(`[data-heading-id="${heading.id}"]`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [onHeadingClick]);

    return (
        <div className={cn(
            'bg-card border-l border-border p-4 overflow-y-auto',
            className
        )}>
            <div className="flex items-center gap-2 mb-4">
                <List className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Document Outline</h3>
            </div>

            {headings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No headings yet. Add headings to see the document outline.
                </p>
            ) : (
                <nav className="space-y-1">
                    {headings.map((heading) => (
                        <button
                            key={heading.id}
                            onClick={() => handleClick(heading)}
                            className={cn(
                                'w-full text-left text-sm py-1 px-2 rounded hover:bg-muted transition-colors',
                                'flex items-center gap-1 group',
                                heading.level === 1 && 'font-semibold',
                                heading.level === 2 && 'pl-4',
                                heading.level === 3 && 'pl-6 text-muted-foreground',
                                heading.level >= 4 && 'pl-8 text-muted-foreground text-xs',
                            )}
                        >
                            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="truncate">{heading.text}</span>
                        </button>
                    ))}
                </nav>
            )}

            {/* Word count */}
            <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                    {document.meta.wordCount} words
                </p>
            </div>
        </div>
    );
});

OutlinePanel.displayName = 'OutlinePanel';
