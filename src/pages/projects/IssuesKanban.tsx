import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  PointerSensor
} from '@dnd-kit/core';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  MoreHorizontal,
  MessageSquare,
  Paperclip,
  Plus,
  Filter,
  ArrowUpCircle,
  ArrowRightCircle,
  ArrowDownCircle
} from 'lucide-react';
import { cn } from '@/utils/cn';

// Types
type IssueStatus = 'Open' | 'In Progress' | 'Resolved';
type Priority = 'High' | 'Medium' | 'Low';

interface Issue {
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

// Mock Data
const INITIAL_ISSUES: Issue[] = [
  {
    id: 'ISS-101',
    title: 'Foundation crack in Sector 4',
    status: 'Open',
    priority: 'High',
    assignee: { name: 'Alex Johnson' },
    comments: 3,
    attachments: 2,
    dueDate: '2024-03-20',
    photoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ISS-102',
    title: 'HVAC duct alignment error',
    status: 'In Progress',
    priority: 'Medium',
    assignee: { name: 'Sarah Lee' },
    comments: 5,
    attachments: 1,
    dueDate: '2024-03-22'
  },
  {
    id: 'ISS-103',
    title: 'Electrical wiring inspection',
    status: 'Resolved',
    priority: 'Low',
    assignee: { name: 'Mike Chen' },
    comments: 0,
    attachments: 0,
    dueDate: '2024-03-15'
  },
  {
    id: 'ISS-104',
    title: 'Safety railing missing on 3rd floor',
    status: 'Open',
    priority: 'High',
    assignee: { name: 'Alex Johnson' },
    comments: 1,
    attachments: 0,
    dueDate: '2024-03-19'
  },
  {
    id: 'ISS-105',
    title: 'Paint color mismatch in lobby',
    status: 'In Progress',
    priority: 'Low',
    assignee: { name: 'Emily Davis' },
    comments: 8,
    attachments: 3,
    dueDate: '2024-03-25'
  }
];

// Components

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const colors = {
    High: 'text-red-500 bg-red-500/10 border-red-500/20',
    Medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    Low: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  };

  const icons = {
    High: ArrowUpCircle,
    Medium: ArrowRightCircle,
    Low: ArrowDownCircle
  };

  const Icon = icons[priority];

  return (
    <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", colors[priority])}>
      <Icon className="w-3 h-3" />
      {priority}
    </div>
  );
};

const DraggableIssueCard = ({ issue }: { issue: Issue }) => {
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
        "group relative bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
        "hover-lift",
        isDragging && "opacity-50 z-50 rotate-2 scale-105 shadow-xl"
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
          <img src={issue.photoUrl} alt="Issue attachment" className="w-full h-full object-cover" />
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

const DroppableColumn = ({
  id,
  title,
  count,
  issues,
  color
}: {
  id: IssueStatus,
  title: string,
  count: number,
  issues: Issue[],
  color: string
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id
  });

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", color)} />
          <h3 className="font-semibold text-sm text-foreground">{title}</h3>
          <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0 h-5">
            {count}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 bg-muted/30 rounded-xl p-2 space-y-3 transition-colors border-2 border-transparent border-dashed",
          isOver && "bg-muted/50 border-primary/20"
        )}
      >
        {issues.map(issue => (
          <DraggableIssueCard key={issue.id} issue={issue} />
        ))}
        {issues.length === 0 && (
          <div className="h-24 flex items-center justify-center text-muted-foreground text-xs italic">
            No issues
          </div>
        )}
      </div>
    </div>
  );
};

export default function IssuesKanban() {
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const issueId = active.id as string;
      const newStatus = over.id as IssueStatus;

      // Optimistic update
      setIssues((prev) =>
        prev.map(issue =>
          issue.id === issueId
            ? { ...issue, status: newStatus }
            : issue
        )
      );

      // Simulate API call
      console.log(`Moved issue ${issueId} to ${newStatus}`);
    }
  };

  const getIssuesByStatus = (status: IssueStatus) => issues.filter(i => i.status === status);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Issues Board</h1>
          <p className="text-muted-foreground">Manage and track project issues across statuses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button className="gap-2 btn-primary-enhanced">
            <Plus className="w-4 h-4" />
            New Issue
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          <DroppableColumn
            id="Open"
            title="Open"
            count={getIssuesByStatus('Open').length}
            issues={getIssuesByStatus('Open')}
            color="bg-gray-400"
          />
          <DroppableColumn
            id="In Progress"
            title="In Progress"
            count={getIssuesByStatus('In Progress').length}
            issues={getIssuesByStatus('In Progress')}
            color="bg-blue-500"
          />
          <DroppableColumn
            id="Resolved"
            title="Resolved"
            count={getIssuesByStatus('Resolved').length}
            issues={getIssuesByStatus('Resolved')}
            color="bg-green-500"
          />
        </div>
      </DndContext>
    </div>
  );
}
