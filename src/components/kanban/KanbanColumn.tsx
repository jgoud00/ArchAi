import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { memo } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { KanbanCard, Issue, IssueStatus } from './KanbanCard';
import { cn } from '@/utils/cn';

interface KanbanColumnProps {
    id: IssueStatus;
    title: string;
    count: number;
    issues: Issue[];
    color: string;
}

export const KanbanColumn = memo(({
    id,
    title,
    count,
    issues,
    color
}: KanbanColumnProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: id
    });

    return (
        <div className="flex flex-col h-full min-h-screen">
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", color)} />
                    <h3 className="font-semibold text-sm text-foreground">{title}</h3>
                    <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0 h-5">
                        {count}
                    </Badge>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    aria-label={`Add new issue to ${title}`}
                    title={`Add new issue to ${title}`}
                >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                </Button>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 bg-card/30 backdrop-blur-sm rounded-xl p-2 space-y-3 transition-colors border-2 border-transparent border-dashed",
                    isOver && "bg-primary/5 border-primary/20"
                )}
            >
                {issues.map(issue => (
                    <KanbanCard key={issue.id} issue={issue} />
                ))}
                {issues.length === 0 && (
                    <div className="h-24 flex items-center justify-center text-muted-foreground text-xs italic">
                        No issues
                    </div>
                )}
            </div>
        </div>
    );
});

KanbanColumn.displayName = 'KanbanColumn';
