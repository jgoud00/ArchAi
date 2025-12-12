import { memo, ReactNode } from 'react';
import {
    FolderOpen,
    FileText,
    Users,
    Calendar,
    LayoutDashboard,
    Plus,
    Layers,
    Settings,
    Inbox,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
    /** Type of module for illustration */
    type: 'projects' | 'documents' | 'team' | 'calendar' | 'dashboard' | 'layers' | 'settings' | 'inbox' | 'search' | 'custom';
    /** Title text */
    title: string;
    /** Description text */
    description: string;
    /** Primary action button text */
    actionLabel?: string;
    /** Primary action callback */
    onAction?: () => void;
    /** Secondary action button text */
    secondaryLabel?: string;
    /** Secondary action callback */
    onSecondaryAction?: () => void;
    /** Custom illustration component */
    illustration?: ReactNode;
    /** Additional class names */
    className?: string;
}

const illustrations: Record<string, React.ElementType> = {
    projects: FolderOpen,
    documents: FileText,
    team: Users,
    calendar: Calendar,
    dashboard: LayoutDashboard,
    layers: Layers,
    settings: Settings,
    inbox: Inbox,
    search: Search,
    custom: FolderOpen,
};

/**
 * EmptyState - Illustrated empty states with clear CTAs
 * 
 * Features:
 * - Animated icon illustrations
 * - Primary and secondary actions
 * - Helpful descriptions
 * - Responsive design
 */
export const EmptyState = memo(({
    type,
    title,
    description,
    actionLabel,
    onAction,
    secondaryLabel,
    onSecondaryAction,
    illustration,
    className,
}: EmptyStateProps) => {
    const Icon = illustrations[type];

    return (
        <div className={cn(
            "flex flex-col items-center justify-center text-center py-16 px-8",
            className
        )}>
            {/* Illustration */}
            <div className="relative mb-6">
                {/* Background circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-primary/5 animate-pulse" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10" />
                </div>

                {/* Icon or custom illustration */}
                <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-lg">
                    {illustration || <Icon className="w-10 h-10 text-primary" />}
                </div>
            </div>

            {/* Text */}
            <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-md mb-6 text-sm leading-relaxed">
                {description}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3">
                {actionLabel && onAction && (
                    <Button onClick={onAction} className="gap-2">
                        <Plus className="h-4 w-4" />
                        {actionLabel}
                    </Button>
                )}
                {secondaryLabel && onSecondaryAction && (
                    <Button variant="outline" onClick={onSecondaryAction}>
                        {secondaryLabel}
                    </Button>
                )}
            </div>
        </div>
    );
});

EmptyState.displayName = 'EmptyState';

// ============================================
// PRESET EMPTY STATES
// ============================================

interface PresetEmptyStateProps {
    onAction?: () => void;
    className?: string;
}

export const EmptyProjects = memo(({ onAction, className }: PresetEmptyStateProps) => (
    <EmptyState
        type="projects"
        title="No projects yet"
        description="Create your first project to start designing. Projects help you organize your architectural blueprints, floor plans, and design documents."
        actionLabel="Create Project"
        onAction={onAction}
        secondaryLabel="Browse Templates"
        className={className}
    />
));

EmptyProjects.displayName = 'EmptyProjects';

export const EmptyDocuments = memo(({ onAction, className }: PresetEmptyStateProps) => (
    <EmptyState
        type="documents"
        title="No documents found"
        description="Upload or create documents to store your design specifications, contracts, and reference materials all in one place."
        actionLabel="Upload Document"
        onAction={onAction}
        className={className}
    />
));

EmptyDocuments.displayName = 'EmptyDocuments';

export const EmptyTeam = memo(({ onAction, className }: PresetEmptyStateProps) => (
    <EmptyState
        type="team"
        title="Build your team"
        description="Invite team members to collaborate on projects. Share designs, leave comments, and work together in real-time."
        actionLabel="Invite Members"
        onAction={onAction}
        className={className}
    />
));

EmptyTeam.displayName = 'EmptyTeam';

export const EmptyCalendar = memo(({ onAction, className }: PresetEmptyStateProps) => (
    <EmptyState
        type="calendar"
        title="No upcoming events"
        description="Schedule meetings, set project deadlines, and track milestones. Your calendar helps keep everything on track."
        actionLabel="Add Event"
        onAction={onAction}
        className={className}
    />
));

EmptyCalendar.displayName = 'EmptyCalendar';

export const EmptySearch = memo(({ className }: { className?: string }) => (
    <EmptyState
        type="search"
        title="No results found"
        description="Try adjusting your search terms or filters. You can also browse categories to find what you're looking for."
        className={className}
    />
));

EmptySearch.displayName = 'EmptySearch';

export const EmptyInbox = memo(({ className }: { className?: string }) => (
    <EmptyState
        type="inbox"
        title="All caught up!"
        description="You have no new notifications. When teammates mention you or update shared projects, you'll see them here."
        className={className}
    />
));

EmptyInbox.displayName = 'EmptyInbox';
