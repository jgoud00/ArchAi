import { memo } from 'react';
import { DocSection, FeatureItem } from '../DocComponents';

/**
 * FeaturesCompletedSection - List of implemented features
 */
export const FeaturesCompletedSection = memo(() => (
    <DocSection title="Features Implemented" defaultOpen>
        <FeatureItem
            title="Dashboard"
            description="Project overview with statistics, project cards, and quick actions. Displays total projects, scans, files, and team members."
            complete
        />
        <FeatureItem
            title="Project Management"
            description="Full CRUD operations for projects. Create, view, update, and delete projects with status management (Active, Completed, Archived)."
            complete
        />
        <FeatureItem
            title="Drone Scan Upload"
            description="Upload and manage drone scan images and videos. Gallery view with preview, delete functionality, and metadata tracking."
            complete
        />
        <FeatureItem
            title="CAD Blueprint Editor"
            description="Full-featured CAD blueprint editor with drawing tools, shapes, snapping, layers, undo/redo, and export capabilities."
            complete
        />
        <FeatureItem
            title="Team Collaboration"
            description="Add/remove team members with role-based access (Owner, Editor, Viewer). Team member management UI with role assignment."
            complete
        />
        <FeatureItem
            title="File Management"
            description="Upload files to projects with categories, descriptions, and metadata. Organize files by project and category."
            complete
        />
        <FeatureItem
            title="Issue Tracking"
            description="Create and manage project issues with priorities, statuses, and assignments. Full issue lifecycle management."
            complete
        />
        <FeatureItem
            title="Inventory Management"
            description="Track materials and inventory items with quantities, locations, and categories."
            complete
        />
        <FeatureItem
            title="Timeline & Tasks"
            description="Project timeline with task management, due dates, and progress tracking."
            complete
        />
        <FeatureItem
            title="Activity Tracking"
            description="Automatic activity logging for all project actions. Track who did what and when with detailed activity feed."
            complete
        />
        <FeatureItem
            title="Authentication"
            description="Complete authentication system with signup, login, logout, and password reset via email. Session persistence and protected routes."
            complete
        />
    </DocSection>
));

FeaturesCompletedSection.displayName = 'FeaturesCompletedSection';
