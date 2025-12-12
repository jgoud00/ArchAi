import { memo } from 'react';
import { Collapsible } from '@/components/ui/Collapsible';
import { CodeBlock } from '@/components/ui/CodeBlock';

/**
 * DatabaseTab - Schema, entities, and relationships documentation
 */
export const DatabaseTab = memo(() => {
    return (
        <div className="space-y-4">
            {/* Schema Overview */}
            <Collapsible title="Schema Overview" defaultOpen>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Entity Relationships</h3>
                        <CodeBlock
                            code={`users (1) ──< (many) projects
                    │                    │
                    │                    ├──< (many) scans
                    │                    ├──< (many) project_files
                    │                    ├──< (many) project_comments
                    │                    ├──< (many) project_activities
                    │                    └──< (many) team_members
                    │
                    └──< (many) team_members (through projects)`}
                            language="text"
                        />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            The database uses PostgreSQL with the following relationships:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                            <li>Users can own multiple projects</li>
                            <li>Projects can have multiple scans, files, comments, and activities</li>
                            <li>Team members link users to projects with roles</li>
                            <li>All relationships use foreign keys with CASCADE delete</li>
                        </ul>
                    </div>
                </div>
            </Collapsible>

            {/* Entity Details */}
            <Collapsible title="Entity Details">
                <div className="space-y-6">
                    {/* Users Entity */}
                    <EntityTable
                        name="users"
                        fields={[
                            { field: 'id', type: 'UUID', required: true, description: 'Primary key, references auth.users' },
                            { field: 'email', type: 'TEXT', required: true, description: 'User email (unique)' },
                            { field: 'display_name', type: 'TEXT', required: false, description: 'User display name' },
                            { field: 'avatar', type: 'TEXT', required: false, description: 'Avatar image URL' },
                            { field: 'created_at', type: 'TIMESTAMPTZ', required: true, description: 'Auto-generated timestamp' },
                            { field: 'updated_at', type: 'TIMESTAMPTZ', required: true, description: 'Auto-updated timestamp' },
                        ]}
                    />

                    {/* Projects Entity */}
                    <EntityTable
                        name="projects"
                        fields={[
                            { field: 'id', type: 'UUID', required: true, description: 'Primary key' },
                            { field: 'owner_id', type: 'UUID', required: true, description: 'Foreign key to users.id' },
                            { field: 'name', type: 'TEXT', required: true, description: 'Project name' },
                            { field: 'description', type: 'TEXT', required: false, description: 'Project description' },
                            { field: 'status', type: 'TEXT', required: true, description: "Enum: 'active', 'completed', 'archived'" },
                            { field: 'created_at', type: 'TIMESTAMPTZ', required: true, description: 'Auto-generated' },
                            { field: 'updated_at', type: 'TIMESTAMPTZ', required: true, description: 'Auto-updated' },
                        ]}
                    />

                    {/* Other Entities Summary */}
                    <div>
                        <h3 className="font-semibold mb-3">Other Entities</h3>
                        <div className="space-y-3">
                            <EntitySummary
                                name="scans"
                                description="Drone scan images/videos: id, project_id, name, url, type, uploaded_by, uploaded_at"
                            />
                            <EntitySummary
                                name="project_files"
                                description="File attachments: id, project_id, name, file_url, file_type, file_size, uploaded_by, category, description"
                            />
                            <EntitySummary
                                name="project_comments"
                                description="Comments/notes: id, project_id, user_id, content, created_at, updated_at"
                            />
                            <EntitySummary
                                name="project_activities"
                                description="Activity log: id, project_id, user_id, activity_type, description, metadata, created_at"
                            />
                            <EntitySummary
                                name="team_members"
                                description="Team members: id, project_id, user_id, email, role ('owner', 'editor', 'viewer'), joined_at"
                            />
                        </div>
                    </div>

                    {/* Built-in Fields */}
                    <div>
                        <h3 className="font-semibold mb-2">Built-in Fields</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                            All entities include these standard fields:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            <li><strong>id</strong> - UUID primary key (auto-generated)</li>
                            <li><strong>created_at</strong> - Timestamp of creation (auto-set)</li>
                            <li><strong>updated_at</strong> - Timestamp of last update (auto-updated via trigger)</li>
                            <li><strong>created_by</strong> - User ID (where applicable, via auth.uid())</li>
                        </ul>
                    </div>
                </div>
            </Collapsible>
        </div>
    );
});

DatabaseTab.displayName = 'DatabaseTab';

/**
 * EntityTable - Reusable entity field table
 */
interface EntityField {
    field: string;
    type: string;
    required: boolean;
    description: string;
}

interface EntityTableProps {
    name: string;
    fields: EntityField[];
}

const EntityTable = memo(({ name, fields }: EntityTableProps) => (
    <div>
        <h3 className="font-semibold mb-3">{name}</h3>
        <table className="w-full text-sm border-collapse mb-4">
            <thead>
                <tr className="border-b bg-muted">
                    <th className="text-left p-2">Field</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Required</th>
                    <th className="text-left p-2">Description</th>
                </tr>
            </thead>
            <tbody>
                {fields.map((field) => (
                    <tr key={field.field} className="border-b">
                        <td className="p-2 font-mono">{field.field}</td>
                        <td className="p-2">{field.type}</td>
                        <td className="p-2">{field.required ? '✅' : '❌'}</td>
                        <td className="p-2">{field.description}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
));

EntityTable.displayName = 'EntityTable';

/**
 * EntitySummary - Summary line for an entity
 */
interface EntitySummaryProps {
    name: string;
    description: string;
}

const EntitySummary = memo(({ name, description }: EntitySummaryProps) => (
    <div>
        <h4 className="font-medium mb-1">{name}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
    </div>
));

EntitySummary.displayName = 'EntitySummary';
