import { useState, useCallback, memo, ReactNode } from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/utils/cn';

interface QuickActionItem {
    id: string;
    title: string;
    description?: string;
    icon: ReactNode;
    onClick: () => void;
}

interface QuickActionsProps {
    items: QuickActionItem[];
    onReorder?: (items: QuickActionItem[]) => void;
    className?: string;
}

const STORAGE_KEY = 'archai-quick-actions-order';

/**
 * QuickActions - Drag-to-reorder action cards
 * 
 * Features:
 * - Native HTML5 drag and drop
 * - Persists order to localStorage
 * - Smooth animations
 * - Touch-friendly
 */
export const QuickActions = memo(({ items, onReorder, className }: QuickActionsProps) => {
    // Load persisted order
    const getInitialOrder = (): string[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : items.map(i => i.id);
        } catch {
            return items.map(i => i.id);
        }
    };

    const [order, setOrder] = useState<string[]>(getInitialOrder);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    // Sort items based on order
    const sortedItems = [...items].sort((a, b) => {
        const aIndex = order.indexOf(a.id);
        const bIndex = order.indexOf(b.id);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    });

    const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
        // Set drag image offset
        if (e.currentTarget instanceof HTMLElement) {
            const rect = e.currentTarget.getBoundingClientRect();
            e.dataTransfer.setDragImage(e.currentTarget, rect.width / 2, rect.height / 2);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (id !== draggedId) {
            setDragOverId(id);
        }
    }, [draggedId]);

    const handleDragLeave = useCallback(() => {
        setDragOverId(null);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        const sourceId = e.dataTransfer.getData('text/plain');

        if (sourceId === targetId) return;

        const newOrder = [...order];
        const sourceIndex = newOrder.indexOf(sourceId);
        const targetIndex = newOrder.indexOf(targetId);

        if (sourceIndex === -1 || targetIndex === -1) return;

        // Remove from old position and insert at new position
        newOrder.splice(sourceIndex, 1);
        newOrder.splice(targetIndex, 0, sourceId);

        setOrder(newOrder);
        setDraggedId(null);
        setDragOverId(null);

        // Persist to localStorage
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
        } catch {
            // Ignore storage errors
        }

        // Notify parent
        const reorderedItems = newOrder.map(id => items.find(i => i.id === id)!).filter(Boolean);
        onReorder?.(reorderedItems);
    }, [order, items, onReorder]);

    const handleDragEnd = useCallback(() => {
        setDraggedId(null);
        setDragOverId(null);
    }, []);

    return (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", className)}>
            {sortedItems.map((item) => (
                <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragOver={(e) => handleDragOver(e, item.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, item.id)}
                    onDragEnd={handleDragEnd}
                    onClick={item.onClick}
                    className={cn(
                        "group cursor-pointer select-none",
                        "flex items-center gap-3 p-4 rounded-xl",
                        "bg-card border border-border",
                        "transition-all duration-200",
                        "hover:shadow-md hover:border-primary/30",
                        draggedId === item.id && "opacity-50 scale-95",
                        dragOverId === item.id && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    )}
                >
                    {/* Drag Handle */}
                    <div
                        className="cursor-grab active:cursor-grabbing text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-hidden="true"
                    >
                        <GripVertical className="h-4 w-4" />
                    </div>

                    {/* Icon */}
                    <div className={cn(
                        "p-2 rounded-lg bg-primary/10 text-primary",
                        "transition-colors duration-200",
                        "group-hover:bg-primary group-hover:text-primary-foreground"
                    )}>
                        {item.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">
                            {item.title}
                        </h4>
                        {item.description && (
                            <p className="text-xs text-muted-foreground truncate">
                                {item.description}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
});

QuickActions.displayName = 'QuickActions';
