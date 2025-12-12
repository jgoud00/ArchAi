import { memo } from 'react';
import { DocSection, RoleBadge, InfoCard, BulletList } from '../DocComponents';
import { CodeBlock } from '@/components/ui/CodeBlock';

/**
 * SecuritySection - Authentication, roles, and security documentation
 */
export const SecuritySection = memo(() => (
    <DocSection title="Authentication & Security">
        <div>
            <h3 className="font-semibold mb-3">User Roles</h3>
            <div className="space-y-2">
                <RoleBadge
                    role="Owner"
                    description="Full access: create, read, update, delete projects and manage team"
                    color="blue"
                />
                <RoleBadge
                    role="Editor"
                    description="Can edit projects, upload files, add comments, but cannot delete projects"
                    color="green"
                />
                <RoleBadge
                    role="Viewer"
                    description="Read-only access: can view projects and files but cannot make changes"
                    color="gray"
                />
            </div>
        </div>

        <div>
            <h3 className="font-semibold mb-2">Row Level Security (RLS)</h3>
            <p className="text-sm text-muted-foreground mb-3">
                All database tables are protected with Row Level Security policies:
            </p>
            <CodeBlock
                code={`-- Projects: Users see only their own or member projects
CREATE POLICY "project_access" ON projects
  USING (owner_id = auth.uid() OR is_project_member(id, auth.uid()));

-- Files: Access based on project membership
CREATE POLICY "file_access" ON files
  USING (is_project_member(project_id, auth.uid()));`}
                language="sql"
            />
        </div>

        <InfoCard title="Security Features" variant="success">
            <BulletList
                items={[
                    'JWT-based authentication via Supabase',
                    'Password hashing with bcrypt',
                    'HTTPS encryption in transit',
                    'Row Level Security on all tables',
                    'Protected routes on frontend',
                    'Environment variable protection'
                ]}
            />
        </InfoCard>

        <InfoCard title="Security Roadmap" variant="warning">
            <BulletList
                items={[
                    'Two-factor authentication (planned)',
                    'Audit logging for sensitive actions',
                    'Rate limiting configuration',
                    'Session management improvements'
                ]}
            />
        </InfoCard>
    </DocSection>
));

SecuritySection.displayName = 'SecuritySection';
