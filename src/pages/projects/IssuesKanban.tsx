import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import {
  Plus,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { KanbanColumn } from '@/components/kanban/KanbanColumn';
import { Issue, IssueStatus } from '@/components/kanban/KanbanCard';

// Types


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
          <KanbanColumn
            id="Open"
            title="Open"
            count={getIssuesByStatus('Open').length}
            issues={getIssuesByStatus('Open')}
            color="bg-muted"
          />
          <KanbanColumn
            id="In Progress"
            title="In Progress"
            count={getIssuesByStatus('In Progress').length}
            issues={getIssuesByStatus('In Progress')}
            color="bg-primary"
          />
          <KanbanColumn
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
