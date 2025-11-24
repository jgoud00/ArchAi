import { useState, useCallback, useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Collapsible } from '@/components/ui/Collapsible'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { TechBadge } from '@/components/ui/TechBadge'
import { Badge } from '@/components/ui/Badge'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { CheckCircle, AlertTriangle, BookOpen } from 'lucide-react'

/**
 * Documentation Page Component
 * 
 * Comprehensive documentation with four main tabs:
 * - OVERVIEW: Project identity, structure, features
 * - TECHNICAL: Tech stack, architecture, security
 * - DATABASE: Schema, entities, relationships
 * - WORKFLOWS: User workflows and data flows
 * 
 * Optimized with:
 * - Lazy rendering of tab content
 * - Memoized components
 * - Stable state management
 * - No infinite loops
 */
export const Documentation = () => {
  // Stable state management - initialize with default value
  const [activeTab, setActiveTab] = useState<string>('overview')

  // Memoized tab change handler to prevent re-renders
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
  }, [])

  // Memoized header content
  const headerContent = useMemo(() => (
    <div className="flex items-center gap-3">
      <BookOpen className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-3xl font-bold">Documentation</h1>
        <p className="text-muted-foreground mt-1">
          Complete guide to ArchitectAI architecture, features, and workflows
        </p>
      </div>
    </div>
  ), [])

  // Memoize tab list to prevent re-renders
  const tabListContent = useMemo(() => (
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="overview">OVERVIEW</TabsTrigger>
      <TabsTrigger value="technical">TECHNICAL</TabsTrigger>
      <TabsTrigger value="database">DATABASE</TabsTrigger>
      <TabsTrigger value="workflows">WORKFLOWS</TabsTrigger>
    </TabsList>
  ), [])

  return (
    <ErrorBoundary>
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        {/* Header */}
        {headerContent}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {tabListContent}

        {/* OVERVIEW Tab */}
        <TabsContent value="overview" className="space-y-4 mt-6">
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
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Dashboard</span>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  Project overview with statistics, project cards, and quick actions. 
                  Displays total projects, scans, files, and team members.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Project Management</span>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  Full CRUD operations for projects. Create, view, update, and delete projects 
                  with status management (Active, Completed, Archived).
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Drone Scan Upload</span>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  Upload and manage drone scan images and videos. Gallery view with preview, 
                  delete functionality, and metadata tracking.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Client & Project Management</span>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  Manage clients and projects with detailed information, status tracking, 
                  and team member assignment.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Team Collaboration</span>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  Add/remove team members with role-based access (Owner, Editor, Viewer). 
                  Team member management UI with role assignment.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">File Management</span>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  Upload files to projects with categories, descriptions, and metadata. 
                  Organize files by project and category.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Comments & Notes</span>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  Add comments and notes to projects. Full commenting system with user attribution 
                  and timestamps.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Activity Tracking</span>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  Automatic activity logging for all project actions. Track who did what and when 
                  with detailed activity feed.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Profile Management</span>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  User profile management with display name updates and avatar upload. 
                  Password change and account deletion.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Authentication</span>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  Complete authentication system with signup, login, logout, and password reset 
                  via email. Session persistence and protected routes.
                </p>
              </div>
            </div>
          </Collapsible>

          {/* Features Incomplete */}
          <Collapsible title="Features Incomplete">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold">Drone Hub AI</span>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  AI-powered analysis of drone scans is planned but not yet implemented. 
                  Will include object detection, progress tracking, and anomaly detection.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold">Blueprint Sketching (Sketcher)</span>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  Interactive blueprint sketching tool is in planning phase. 
                  Will allow users to create and edit construction blueprints.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold">Inventory Management</span>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  Inventory tracking system is partially planned. 
                  Will include material tracking, stock levels, and procurement management.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold">Real-time Updates</span>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  Supabase Realtime subscriptions for live updates are not yet implemented. 
                  Will enable instant notifications and collaborative editing.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold">Dashboard Filtering</span>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  Advanced filtering by status, owner, or team is planned but not implemented. 
                  Currently shows all accessible projects.
                </p>
              </div>
            </div>
          </Collapsible>

          {/* Data Relationship Gaps */}
          <Collapsible title="Data Relationship Gaps">
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Missing Relationships</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
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
        </TabsContent>

        {/* TECHNICAL Tab */}
        <TabsContent value="technical" className="space-y-4 mt-6">
          {/* Technology Stack */}
          <Collapsible title="Technology Stack" defaultOpen>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Frontend Libraries</h3>
                <div className="flex flex-wrap gap-2">
                  <TechBadge name="React 18" category="frontend" />
                  <TechBadge name="TypeScript" category="frontend" />
                  <TechBadge name="Vite" category="tool" />
                  <TechBadge name="TailwindCSS" category="frontend" />
                  <TechBadge name="ShadCN/UI" category="library" />
                  <TechBadge name="React Router" category="library" />
                  <TechBadge name="Zustand" category="library" />
                  <TechBadge name="React Hook Form" category="library" />
                  <TechBadge name="Zod" category="library" />
                  <TechBadge name="Lucide React" category="library" />
                  <TechBadge name="jsPDF" category="library" />
                  <TechBadge name="html2canvas" category="library" />
                </div>
              </div>
            </div>
          </Collapsible>

          {/* Backend & Platform */}
          <Collapsible title="Backend & Platform">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">BaaS Services</h3>
                <div className="flex flex-wrap gap-2">
                  <TechBadge name="Supabase Auth" category="backend" />
                  <TechBadge name="Supabase PostgreSQL" category="database" />
                  <TechBadge name="Supabase Storage" category="backend" />
                  <TechBadge name="Supabase Realtime" category="backend" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  ArchitectAI uses Supabase as a Backend-as-a-Service (BaaS) platform, 
                  providing authentication, database, storage, and real-time capabilities 
                  without requiring a custom backend server.
                </p>
              </div>
            </div>
          </Collapsible>

          {/* Frontend Architecture */}
          <Collapsible title="Frontend Architecture">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">File Structure</h3>
                <CodeBlock
                  code={`src/
├── components/          # React components
│   ├── layout/         # Layout components (Sidebar, MainLayout)
│   └── ui/             # ShadCN UI components
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── ProjectDetail.tsx
│   ├── Settings.tsx
│   ├── Login.tsx
│   └── Documentation.tsx
├── services/           # Supabase service functions
│   ├── supabase.ts     # Supabase client
│   ├── auth.ts         # Authentication
│   ├── projects.ts     # Project CRUD
│   ├── files.ts        # File management
│   ├── comments.ts     # Comments
│   └── activities.ts   # Activity tracking
├── store/              # Zustand state management
│   └── authStore.ts    # Auth state
├── hooks/              # Custom React hooks
├── types/              # TypeScript types
└── utils/              # Utility functions`}
                  language="text"
                />
              </div>
              <div>
                <h3 className="font-semibold mb-2">State Management</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Uses Zustand for global state management:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li><strong>authStore</strong> - User authentication state</li>
                  <li>Local component state for UI interactions</li>
                  <li>React Query could be added for server state caching</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Routing</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  React Router v6 with protected routes:
                </p>
                <CodeBlock
                  code={`// Protected routes require authentication
<ProtectedRoute>
  <MainLayout>
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="projects/:id" element={<ProjectDetail />} />
    <Route path="settings" element={<Settings />} />
  </MainLayout>
</ProtectedRoute>`}
                  language="typescript"
                />
              </div>
            </div>
          </Collapsible>

          {/* Backend & API Architecture */}
          <Collapsible title="Backend & API Architecture">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">SDK Methods</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  All backend operations use Supabase JavaScript SDK:
                </p>
                <CodeBlock
                  code={`// Example: Project service methods
import { supabase } from './supabase'

// Create project
const { data, error } = await supabase
  .from('projects')
  .insert({ name, description, owner_id })
  .select()
  .single()

// Get projects
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('owner_id', userId)

// Update project
const { error } = await supabase
  .from('projects')
  .update({ name, description })
  .eq('id', projectId)

// Delete project
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', projectId)`}
                  language="typescript"
                />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Auth Flow</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>1. Sign Up:</strong> User creates account → Supabase Auth → User profile created via trigger</p>
                  <p><strong>2. Sign In:</strong> Email/password → Supabase Auth → Session created → User profile fetched</p>
                  <p><strong>3. Session:</strong> Stored in localStorage → Auto-refresh → Protected routes check</p>
                  <p><strong>4. Sign Out:</strong> Session cleared → Redirect to login</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Endpoints</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  All endpoints are handled by Supabase:
                </p>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Service</th>
                      <th className="text-left p-2">Endpoint</th>
                      <th className="text-left p-2">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">Auth</td>
                      <td className="p-2">/auth/v1/*</td>
                      <td className="p-2">POST, GET</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Database</td>
                      <td className="p-2">/rest/v1/*</td>
                      <td className="p-2">GET, POST, PATCH, DELETE</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Storage</td>
                      <td className="p-2">/storage/v1/*</td>
                      <td className="p-2">POST, GET, DELETE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Collapsible>

          {/* Authentication & Security */}
          <Collapsible title="Authentication & Security">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Roles</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50">Owner</Badge>
                    <span className="text-sm text-muted-foreground">
                      Full access: create, read, update, delete projects and manage team
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50">Editor</Badge>
                    <span className="text-sm text-muted-foreground">
                      Can edit projects, upload files, add comments, but cannot delete projects
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-gray-50">Viewer</Badge>
                    <span className="text-sm text-muted-foreground">
                      Read-only access: can view projects and files but cannot make changes
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">RLS Policies</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Row Level Security (RLS) is enabled on all tables:
                </p>
                <CodeBlock
                  code={`-- Example: Projects RLS Policy
CREATE POLICY "Users can view own or member projects"
  ON public.projects FOR SELECT
  USING (
    owner_id = auth.uid()
    OR
    public.is_project_member(id, auth.uid())
  );

-- Only owners can update/delete
CREATE POLICY "Owners can update projects"
  ON public.projects FOR UPDATE
  USING (owner_id = auth.uid());`}
                  language="sql"
                />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Current Gaps</h3>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                    <li>Email verification not enforced (optional in Supabase)</li>
                    <li>Two-factor authentication not implemented</li>
                    <li>API rate limiting handled by Supabase (free tier limits)</li>
                    <li>Audit logging for security events not implemented</li>
                  </ul>
                </div>
              </div>
            </div>
          </Collapsible>
        </TabsContent>

        {/* DATABASE Tab */}
        <TabsContent value="database" className="space-y-4 mt-6">
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
              <div>
                <h3 className="font-semibold mb-3">1. users</h3>
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
                    <tr className="border-b">
                      <td className="p-2 font-mono">id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2">✅</td>
                      <td className="p-2">Primary key, references auth.users</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-mono">email</td>
                      <td className="p-2">TEXT</td>
                      <td className="p-2">✅</td>
                      <td className="p-2">User email (unique)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-mono">display_name</td>
                      <td className="p-2">TEXT</td>
                      <td className="p-2">❌</td>
                      <td className="p-2">User display name</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-mono">avatar</td>
                      <td className="p-2">TEXT</td>
                      <td className="p-2">❌</td>
                      <td className="p-2">Avatar image URL</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-mono">created_at</td>
                      <td className="p-2">TIMESTAMPTZ</td>
                      <td className="p-2">✅</td>
                      <td className="p-2">Auto-generated timestamp</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-mono">updated_at</td>
                      <td className="p-2">TIMESTAMPTZ</td>
                      <td className="p-2">✅</td>
                      <td className="p-2">Auto-updated timestamp</td>
                    </tr>
                  </tbody>
                </table>
                <CodeBlock
                  code={`{
  "id": "uuid",
  "email": "string",
  "display_name": "string | null",
  "avatar": "string | null",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}`}
                  language="json"
                />
              </div>

              {/* Projects Entity */}
              <div>
                <h3 className="font-semibold mb-3">2. projects</h3>
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
                    <tr className="border-b">
                      <td className="p-2 font-mono">id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2">✅</td>
                      <td className="p-2">Primary key</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-mono">name</td>
                      <td className="p-2">TEXT</td>
                      <td className="p-2">✅</td>
                      <td className="p-2">Project name</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-mono">description</td>
                      <td className="p-2">TEXT</td>
                      <td className="p-2">✅</td>
                      <td className="p-2">Project description</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-mono">owner_id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2">✅</td>
                      <td className="p-2">Foreign key to users.id</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-mono">status</td>
                      <td className="p-2">TEXT</td>
                      <td className="p-2">✅</td>
                      <td className="p-2">Enum: 'active', 'completed', 'archived'</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-mono">created_at</td>
                      <td className="p-2">TIMESTAMPTZ</td>
                      <td className="p-2">✅</td>
                      <td className="p-2">Auto-generated</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-mono">updated_at</td>
                      <td className="p-2">TIMESTAMPTZ</td>
                      <td className="p-2">✅</td>
                      <td className="p-2">Auto-updated</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Other Entities Summary */}
              <div>
                <h3 className="font-semibold mb-3">Other Entities</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">3. scans</h4>
                    <p className="text-sm text-muted-foreground">
                      Drone scan images/videos: id, project_id, name, url, type, uploaded_by, uploaded_at
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">4. project_files</h4>
                    <p className="text-sm text-muted-foreground">
                      File attachments: id, project_id, name, file_url, file_type, file_size, uploaded_by, category, description
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">5. project_comments</h4>
                    <p className="text-sm text-muted-foreground">
                      Comments/notes: id, project_id, user_id, content, created_at, updated_at
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">6. project_activities</h4>
                    <p className="text-sm text-muted-foreground">
                      Activity log: id, project_id, user_id, activity_type, description, metadata, created_at
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">7. team_members</h4>
                    <p className="text-sm text-muted-foreground">
                      Team members: id, project_id, user_id, email, role ('owner', 'editor', 'viewer'), joined_at
                    </p>
                  </div>
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
        </TabsContent>

        {/* WORKFLOWS Tab */}
        <TabsContent value="workflows" className="space-y-4 mt-6">
          {/* Client & Project Management */}
          <Collapsible title="Client & Project Management Workflow" defaultOpen>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">User Flow</h3>
                <CodeBlock
                  code={`1. User logs in → Dashboard
2. Click "New Project" → Create project form
3. Fill project details (name, description)
4. Submit → Project created → Redirect to project detail
5. Add team members → Invite by email
6. Assign roles (Editor/Viewer)
7. Upload files → Select files → Upload to project
8. Add comments → Type comment → Submit
9. Update project status → Change to Completed/Archived
10. Generate report → PDF download`}
                  language="text"
                />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Data Flow</h3>
                <CodeBlock
                  code={`CREATE Project:
  Frontend → projects.ts → Supabase API
  → PostgreSQL INSERT → RLS Check
  → Trigger: log activity
  → Return project data → Update UI

UPDATE Project:
  Frontend → projects.ts → Supabase API
  → PostgreSQL UPDATE → RLS Check (owner only)
  → Trigger: update updated_at, log activity
  → Return updated data → Update UI

DELETE Project:
  Frontend → projects.ts → Supabase API
  → PostgreSQL DELETE → RLS Check (owner only)
  → CASCADE: delete scans, files, comments, activities
  → Return success → Redirect to dashboard`}
                  language="text"
                />
              </div>
            </div>
          </Collapsible>

          {/* Drone Image Analysis */}
          <Collapsible title="Drone Image Analysis (AI) Workflow">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Current Implementation</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Currently supports upload and storage. AI analysis is planned:
                </p>
                <CodeBlock
                  code={`1. Upload drone scan → Storage bucket
2. Save metadata → scans table
3. Display in gallery → Project detail page
4. [PLANNED] AI Analysis:
   - Trigger analysis job
   - Process image with AI model
   - Extract objects, measurements
   - Store results in database
   - Display analysis results`}
                  language="text"
                />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Planned AI Flow</h3>
                <CodeBlock
                  code={`Upload → Storage → Trigger Edge Function
  → AI Model Processing (TensorFlow/PyTorch)
  → Object Detection (construction equipment, materials)
  → Progress Analysis (compare with previous scans)
  → Anomaly Detection (safety issues, defects)
  → Store Results → Update UI with insights`}
                  language="text"
                />
              </div>
            </div>
          </Collapsible>

          {/* Blueprint Sketching */}
          <Collapsible title="Blueprint Sketching Workflow">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Planned Workflow</h3>
                <CodeBlock
                  code={`1. Open Sketcher → Canvas interface
2. Select tools (line, rectangle, circle, text)
3. Draw blueprint → Canvas updates
4. Save draft → Store in project_files
5. Export as image/PDF → Download
6. Link to project → Associate with project
7. Version control → Save multiple versions
8. Share with team → View/edit permissions`}
                  language="text"
                />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Data Flow Architecture</h3>
                <CodeBlock
                  code={`Sketcher Component → Canvas State
  → Save Action → Convert to image/data
  → Upload to Storage → Save metadata
  → Link to project → project_files table
  → Store version → Version history
  → Real-time sync (planned) → Supabase Realtime`}
                  language="text"
                />
              </div>
            </div>
          </Collapsible>

          {/* Inventory Management */}
          <Collapsible title="Inventory Management Workflow">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Planned Workflow</h3>
                <CodeBlock
                  code={`1. View inventory → List items
2. Add item → Form (name, quantity, category)
3. Update stock → Adjust quantity
4. Link to project → Associate materials
5. Track usage → Record consumption
6. Low stock alerts → Notifications
7. Procurement → Generate purchase orders
8. Reports → Stock levels, usage trends`}
                  language="text"
                />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Data Flow</h3>
                <CodeBlock
                  code={`[PLANNED] Inventory Table:
  - id, name, category, quantity, unit
  - project_id (optional link)
  - supplier, cost, location
  - created_at, updated_at

CRUD Operations:
  CREATE → inventory table
  READ → Filter by project/category
  UPDATE → Adjust quantities
  DELETE → Remove items (with history)`}
                  language="text"
                />
              </div>
            </div>
          </Collapsible>

          {/* Data Flow Architecture */}
          <Collapsible title="Data Flow Architecture">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">CRUD Pattern</h3>
                <CodeBlock
                  code={`┌─────────┐
│ Frontend│
│ Component│
└────┬────┘
     │
     ▼
┌─────────┐
│ Service │  (projects.ts, files.ts, etc.)
│ Function│
└────┬────┘
     │
     ▼
┌─────────┐
│Supabase │
│   SDK   │
└────┬────┘
     │
     ▼
┌─────────┐
│PostgreSQL│
│ Database │
└────┬────┘
     │
     ▼
┌─────────┐
│   RLS   │  (Row Level Security)
│ Policies│
└────┬────┘
     │
     ▼
┌─────────┐
│ Trigger │  (Activity logging, timestamps)
│Function │
└─────────┘`}
                  language="text"
                />
              </div>
              <div>
                <h3 className="font-semibold mb-2">AI Pattern (Planned)</h3>
                <CodeBlock
                  code={`Upload → Storage → Edge Function Trigger
  → AI Processing Service
  → Model Inference
  → Results Storage
  → Real-time Update → Frontend`}
                  language="text"
                />
              </div>
            </div>
          </Collapsible>

          {/* System Limitations */}
          <Collapsible title="System Limitations & Performance">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Current Limitations</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted">
                      <th className="text-left p-2">Aspect</th>
                      <th className="text-left p-2">Limit</th>
                      <th className="text-left p-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">File Size</td>
                      <td className="p-2">50MB</td>
                      <td className="p-2">Configurable in Supabase Storage</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">API Rate</td>
                      <td className="p-2">Free tier limits</td>
                      <td className="p-2">Upgrade for higher limits</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Real-time</td>
                      <td className="p-2">Not implemented</td>
                      <td className="p-2">Planned feature</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">AI Analysis</td>
                      <td className="p-2">Not implemented</td>
                      <td className="p-2">Requires Edge Functions + AI model</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Performance Notes</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Database queries are optimized with indexes on foreign keys</li>
                  <li>File uploads use Supabase Storage with CDN</li>
                  <li>RLS policies may add slight overhead but ensure security</li>
                  <li>Activity logging is asynchronous via triggers</li>
                  <li>Consider pagination for large project lists</li>
                </ul>
              </div>
            </div>
          </Collapsible>
        </TabsContent>
      </Tabs>
      </div>
    </ErrorBoundary>
  )
}

