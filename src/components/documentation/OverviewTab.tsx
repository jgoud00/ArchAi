import { memo } from 'react';
import { Collapsible } from '@/components/ui/Collapsible';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, AlertTriangle } from 'lucide-react';

/**
 * OverviewTab - Project identity, structure, and features documentation
 */
export const OverviewTab = memo(() => {
    return (
        <div className="space-y-4">
            {/* Project Identity */}
            <Collapsible title="Project Identity" defaultOpen>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Name</h3>
                        <p className="text-muted-foreground">ArchitectAI</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Purpose</h3>
                        <p className="text-muted-foreground">
                            A comprehensive web application for construction teams to manage projects,
                            collaborate with team members, upload and analyze drone scans, manage inventory,
                            create blueprints, and track project activities in real-time.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Vision</h3>
                        <p className="text-muted-foreground">
                            To revolutionize construction project management by providing an all-in-one
                            platform that combines project management, AI-powered drone image analysis,
                            blueprint sketching, and inventory tracking in a seamless, user-friendly interface.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Key Differentiators</h3>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>AI-powered drone scan analysis</li>
                            <li>Integrated blueprint sketching tool</li>
                            <li>Real-time team collaboration</li>
                            <li>Comprehensive activity tracking</li>
                            <li>Role-based access control</li>
                            <li>Cloud-based file storage and management</li>
                        </ul>
                    </div>
                </div>
            </Collapsible>

            {/* Application Structure */}
            <Collapsible title="Application Structure">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Pages</h3>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li><strong>Dashboard</strong> - Project overview and statistics</li>
                            <li><strong>Project Detail</strong> - Individual project management</li>
                            <li><strong>Settings</strong> - User profile and account settings</li>
                            <li><strong>Login/Signup</strong> - Authentication pages</li>
                            <li><strong>Forgot/Reset Password</strong> - Password recovery</li>
                            <li><strong>Documentation</strong> - This page</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Entities</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <Badge variant="outline">Users</Badge>
                            <Badge variant="outline">Projects</Badge>
                            <Badge variant="outline">Scans</Badge>
                            <Badge variant="outline">Files</Badge>
                            <Badge variant="outline">Comments</Badge>
                            <Badge variant="outline">Team Members</Badge>
                            <Badge variant="outline">Activities</Badge>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Layout</h3>
                        <p className="text-muted-foreground">
                            The application uses a sidebar navigation layout with:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                            <li>Left sidebar with navigation and user info</li>
                            <li>Main content area with page-specific content</li>
                            <li>Responsive design for mobile and desktop</li>
                            <li>Toast notifications for user feedback</li>
                        </ul>
                    </div>
                </div>
            </Collapsible>

            {/* Features Implemented */}
            <Collapsible title="Features Implemented" defaultOpen>
                <div className="space-y-4">
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
                        title="Client & Project Management"
                        description="Manage clients and projects with detailed information, status tracking, and team member assignment."
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
                        title="Comments & Notes"
                        description="Add comments and notes to projects. Full commenting system with user attribution and timestamps."
                        complete
                    />
                    <FeatureItem
                        title="Activity Tracking"
                        description="Automatic activity logging for all project actions. Track who did what and when with detailed activity feed."
                        complete
                    />
                    <FeatureItem
                        title="Profile Management"
                        description="User profile management with display name updates and avatar upload. Password change and account deletion."
                        complete
                    />
                    <FeatureItem
                        title="Authentication"
                        description="Complete authentication system with signup, login, logout, and password reset via email. Session persistence and protected routes."
                        complete
                    />
                </div>
            </Collapsible>

            {/* Features Incomplete */}
            <Collapsible title="Features Incomplete">
                <div className="space-y-4">
                    <FeatureItem
                        title="Drone Hub AI"
                        description="AI-powered analysis of drone scans is planned but not yet implemented. Will include object detection, progress tracking, and anomaly detection."
                    />
                    <FeatureItem
                        title="Blueprint Sketching (Sketcher)"
                        description="Interactive blueprint sketching tool is in planning phase. Will allow users to create and edit construction blueprints."
                    />
                    <FeatureItem
                        title="Inventory Management"
                        description="Inventory tracking system is partially planned. Will include material tracking, stock levels, and procurement management."
                    />
                    <FeatureItem
                        title="Real-time Updates"
                        description="Supabase Realtime subscriptions for live updates are not yet implemented. Will enable instant notifications and collaborative editing."
                    />
                    <FeatureItem
                        title="Dashboard Filtering"
                        description="Advanced filtering by status, owner, or team is planned but not implemented. Currently shows all accessible projects."
                    />
                </div>
            </Collapsible>

            {/* Data Relationship Gaps */}
            <Collapsible title="Data Relationship Gaps">
                <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Missing Relationships</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                            <li>Client entity not yet linked to projects (planned)</li>
                            <li>Inventory items not linked to projects (planned)</li>
                            <li>Blueprint sketches not linked to projects (planned)</li>
                            <li>AI analysis results not stored in database (planned)</li>
                            <li>File versioning not implemented</li>
                            <li>Comment threading/replies not implemented</li>
                        </ul>
                    </div>
                </div>
            </Collapsible>
        </div>
    );
});

OverviewTab.displayName = 'OverviewTab';

/**
 * FeatureItem - Reusable feature list item
 */
interface FeatureItemProps {
    title: string;
    description: string;
    complete?: boolean;
}

const FeatureItem = memo(({ title, description, complete = false }: FeatureItemProps) => (
    <div className="space-y-2">
        <div className="flex items-center gap-2">
            {complete ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            <span className="font-semibold">{title}</span>
        </div>
        <p className="text-sm text-muted-foreground ml-7">{description}</p>
    </div>
));

FeatureItem.displayName = 'FeatureItem';
