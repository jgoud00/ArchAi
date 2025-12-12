import { memo } from 'react';
import { Collapsible } from '@/components/ui/Collapsible';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { TechBadge } from '@/components/ui/TechBadge';
import { Badge } from '@/components/ui/Badge';

/**
 * TechnicalTab - Technology stack, architecture, and security documentation
 */
export const TechnicalTab = memo(() => {
    return (
        <div className="space-y-4">
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

            {/* Authentication & Security */}
            <Collapsible title="Authentication & Security">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Roles</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">Owner</Badge>
                                <span className="text-sm text-muted-foreground">
                                    Full access: create, read, update, delete projects and manage team
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">Editor</Badge>
                                <span className="text-sm text-muted-foreground">
                                    Can edit projects, upload files, add comments, but cannot delete projects
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-gray-50 dark:bg-gray-900/20">Viewer</Badge>
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
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                                <li>Email verification not enforced (optional in Supabase)</li>
                                <li>Two-factor authentication not implemented</li>
                                <li>API rate limiting handled by Supabase (free tier limits)</li>
                                <li>Audit logging for security events not implemented</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Collapsible>
        </div>
    );
});

TechnicalTab.displayName = 'TechnicalTab';
