import { useDraggable } from '@dnd-kit/core';
import { MoreHorizontal, MessageSquare, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PriorityBadge } from './PriorityBadge';
import { cn } from '@/utils/cn';

export type IssueStatus = 'Open' | 'In Progress' | 'Resolved';
export type Priority = 'High' | 'Medium' | 'Low';

export interface Issue {
    id: string;
    title: string;
    status: IssueStatus;
    priority: Priority;
    assignee: {
        name: string;
        avatarUrl?: string;
    };
    comments: number;
    attachments: number;
    dueDate: string;
    photoUrl?: string;
}

export const KanbanCard = ({ issue }: { issue: Issue }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: issue.id,
        data: { issue }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "group relative bg-card/80 backdrop-blur-md border border-border/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
                "hover-lift hover:border-primary/30",
                isDragging && "opacity-50 z-50 rotate-2 scale-105 shadow-xl border-primary"
            )}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-muted-foreground">{issue.id}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>

            <h4 className="font-medium text-sm mb-3 line-clamp-2">{issue.title}</h4>

            {issue.photoUrl && (
                <div className="mb-3 rounded-md overflow-hidden h-24 w-full relative">
                    <img src={issue.photoUrl} alt={issue.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
            )}

            <div className="flex items-center justify-between mt-3">
                <PriorityBadge priority={issue.priority} />

                <div className="flex items-center gap-2">
                    {issue.attachments > 0 && (
                        <div className="flex items-center text-muted-foreground text-xs">
                            <Paperclip className="w-3 h-3 mr-1" />
                            {issue.attachments}
                        </div>
                    )}
                    {issue.comments > 0 && (
                        <div className="flex items-center text-muted-foreground text-xs">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {issue.comments}
                        </div>
                    )}
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20 ml-1">
                        {issue.assignee.name.charAt(0)}
                    </div>
                </div>
            </div>
        </div>
    );
};
