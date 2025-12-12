import { memo } from 'react';
import { Collapsible } from '@/components/ui/Collapsible';

/**
 * WorkflowsTab - User workflows and data flows documentation
 */
export const WorkflowsTab = memo(() => {
    return (
        <div className="space-y-4">
            {/* Client & Project Management */}
            <Collapsible title="Client & Project Management Workflow" defaultOpen>
                <div className="space-y-4">
                    <WorkflowStep
                        number={1}
                        title="User Authentication"
                        steps={[
                            'User signs up or logs in via Supabase Auth',
                            'Profile created/fetched from users table',
                            'Session token stored in localStorage',
                        ]}
                    />
                    <WorkflowStep
                        number={2}
                        title="Project Creation"
                        steps={[
                            'User clicks "New Project" on Dashboard',
                            'Fills in project name and description',
                            'Project created with owner_id = current user',
                            'Activity logged: "project_created"',
                        ]}
                    />
                    <WorkflowStep
                        number={3}
                        title="Team Collaboration"
                        steps={[
                            'Owner navigates to Team tab in project',
                            'Adds team member by email',
                            'Member added to team_members table with role',
                            'Activity logged: "member_added"',
                        ]}
                    />
                    <WorkflowStep
                        number={4}
                        title="File & Scan Upload"
                        steps={[
                            'User selects file or drag-and-drops',
                            'File uploaded to Supabase Storage bucket',
                            'Record created in project_files or scans table',
                            'Activity logged: "file_uploaded" or "scan_uploaded"',
                        ]}
                    />
                </div>
            </Collapsible>

            {/* Data Flow */}
            <Collapsible title="Data Flow Architecture">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Request Flow</h3>
                        <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                            <p>React Component → Supabase Client → Supabase API → PostgreSQL</p>
                            <p className="mt-2 text-muted-foreground">↓ Response ↓</p>
                            <p>PostgreSQL → Supabase API → Supabase Client → React State → UI Update</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Authentication Flow</h3>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                            <li>User submits login/signup form</li>
                            <li>Supabase Auth validates credentials</li>
                            <li>JWT token issued and stored in localStorage</li>
                            <li>Token included in all subsequent API requests</li>
                            <li>RLS policies enforce access control</li>
                        </ol>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">File Upload Flow</h3>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                            <li>User selects file in upload component</li>
                            <li>File uploaded to Supabase Storage bucket</li>
                            <li>Public URL generated for the file</li>
                            <li>Metadata saved to database table</li>
                            <li>Activity record created</li>
                            <li>UI updated with new file</li>
                        </ol>
                    </div>
                </div>
            </Collapsible>

            {/* Activity Tracking */}
            <Collapsible title="Activity Tracking System">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Tracked Activities</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="p-2 bg-muted rounded">project_created</div>
                            <div className="p-2 bg-muted rounded">project_updated</div>
                            <div className="p-2 bg-muted rounded">project_deleted</div>
                            <div className="p-2 bg-muted rounded">file_uploaded</div>
                            <div className="p-2 bg-muted rounded">file_deleted</div>
                            <div className="p-2 bg-muted rounded">member_added</div>
                            <div className="p-2 bg-muted rounded">member_removed</div>
                            <div className="p-2 bg-muted rounded">member_role_changed</div>
                            <div className="p-2 bg-muted rounded">comment_added</div>
                            <div className="p-2 bg-muted rounded">scan_uploaded</div>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Activity Record Structure</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            <li><strong>project_id</strong>: Which project this activity belongs to</li>
                            <li><strong>user_id</strong>: Who performed the action</li>
                            <li><strong>activity_type</strong>: Type of activity (enum)</li>
                            <li><strong>description</strong>: Human-readable description</li>
                            <li><strong>metadata</strong>: Additional JSON data (e.g., old/new values)</li>
                            <li><strong>created_at</strong>: When the activity occurred</li>
                        </ul>
                    </div>
                </div>
            </Collapsible>

            {/* Error Handling */}
            <Collapsible title="Error Handling">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Error Types</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            <li><strong>Authentication Errors</strong>: Invalid credentials, expired session</li>
                            <li><strong>Authorization Errors</strong>: Insufficient permissions (RLS violation)</li>
                            <li><strong>Validation Errors</strong>: Invalid input data</li>
                            <li><strong>Network Errors</strong>: Connection issues, timeouts</li>
                            <li><strong>Storage Errors</strong>: File too large, invalid type</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Error Display</h3>
                        <p className="text-sm text-muted-foreground">
                            Errors are displayed via toast notifications with appropriate severity levels
                            (success, error, warning, info). Form validation errors are shown inline below
                            the relevant input fields.
                        </p>
                    </div>
                </div>
            </Collapsible>
        </div>
    );
});

WorkflowsTab.displayName = 'WorkflowsTab';

/**
 * WorkflowStep - Reusable workflow step component
 */
interface WorkflowStepProps {
    number: number;
    title: string;
    steps: string[];
}

const WorkflowStep = memo(({ number, title, steps }: WorkflowStepProps) => (
    <div>
        <h3 className="font-semibold mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm mr-2">
                {number}
            </span>
            {title}
        </h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-8">
            {steps.map((step, idx) => (
                <li key={idx}>{step}</li>
            ))}
        </ul>
    </div>
));

WorkflowStep.displayName = 'WorkflowStep';
