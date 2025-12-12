import { memo } from 'react';
import { DocSection, EntityTable } from '../DocComponents';

/**
 * DatabaseSchemaSection - Database entity schemas
 */
export const DatabaseSchemaSection = memo(() => (
    <DocSection title="Database Schema">
        <div className="space-y-4">
            <EntityTable
                name="users"
                fields={[
                    { name: 'id', type: 'uuid', description: 'Primary key, from auth' },
                    { name: 'email', type: 'text', description: 'User email address' },
                    { name: 'display_name', type: 'text', description: 'Display name' },
                    { name: 'avatar_url', type: 'text', description: 'Profile picture URL' },
                    { name: 'created_at', type: 'timestamp', description: 'Account creation date' },
                ]}
            />

            <EntityTable
                name="projects"
                fields={[
                    { name: 'id', type: 'uuid', description: 'Primary key' },
                    { name: 'name', type: 'text', description: 'Project name' },
                    { name: 'description', type: 'text', description: 'Project description' },
                    { name: 'status', type: 'enum', description: 'active, completed, archived' },
                    { name: 'owner_id', type: 'uuid', description: 'Foreign key to users' },
                    { name: 'created_at', type: 'timestamp', description: 'Creation date' },
                ]}
            />

            <EntityTable
                name="project_members"
                fields={[
                    { name: 'project_id', type: 'uuid', description: 'Foreign key to projects' },
                    { name: 'user_id', type: 'uuid', description: 'Foreign key to users' },
                    { name: 'role', type: 'enum', description: 'owner, editor, viewer' },
                    { name: 'joined_at', type: 'timestamp', description: 'Join date' },
                ]}
            />

            <EntityTable
                name="scans"
                fields={[
                    { name: 'id', type: 'uuid', description: 'Primary key' },
                    { name: 'project_id', type: 'uuid', description: 'Foreign key to projects' },
                    { name: 'name', type: 'text', description: 'Scan name' },
                    { name: 'url', type: 'text', description: 'Storage URL' },
                    { name: 'type', type: 'enum', description: 'image, video' },
                    { name: 'uploaded_at', type: 'timestamp', description: 'Upload date' },
                ]}
            />

            <EntityTable
                name="issues"
                fields={[
                    { name: 'id', type: 'uuid', description: 'Primary key' },
                    { name: 'project_id', type: 'uuid', description: 'Foreign key to projects' },
                    { name: 'title', type: 'text', description: 'Issue title' },
                    { name: 'description', type: 'text', description: 'Issue description' },
                    { name: 'priority', type: 'enum', description: 'low, medium, high, critical' },
                    { name: 'status', type: 'enum', description: 'open, in_progress, resolved' },
                ]}
            />
        </div>
    </DocSection>
));

DatabaseSchemaSection.displayName = 'DatabaseSchemaSection';
