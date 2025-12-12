import { memo } from 'react';
import { DocSection } from '../DocComponents';
import { CodeBlock } from '@/components/ui/CodeBlock';

/**
 * ArchitectureSection - Frontend architecture documentation
 */
export const ArchitectureSection = memo(() => (
    <DocSection title="Frontend Architecture">
        <div>
            <h3 className="font-semibold mb-2">Directory Structure</h3>
            <CodeBlock
                code={`src/
├── components/          # React components
│   ├── layout/         # MainLayout, Sidebar, Topbar
│   ├── ui/             # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── documentation/  # Documentation sections
│   ├── projects/       # Project-related components
│   ├── settings/       # Settings components
│   ├── blueprint/      # CAD editor components
│   └── 3d/             # 3D viewer components
├── pages/              # Route page components
├── services/           # Supabase API services
├── store/              # Zustand state stores
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # CSS and design system`}
                language="text"
            />
        </div>

        <div>
            <h3 className="font-semibold mb-2">State Management</h3>
            <CodeBlock
                code={`// Zustand store example
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  login: async (email, password) => { /* ... */ },
  logout: async () => { /* ... */ },
}));`}
                language="typescript"
            />
        </div>

        <div>
            <h3 className="font-semibold mb-2">Component Patterns</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>memo()</strong> - All components wrapped for performance</li>
                <li><strong>useCallback</strong> - Event handlers memoized</li>
                <li><strong>Compound components</strong> - UI building blocks</li>
                <li><strong>ErrorBoundary</strong> - Error handling at route level</li>
                <li><strong>Lazy loading</strong> - Code splitting per route</li>
            </ul>
        </div>
    </DocSection>
));

ArchitectureSection.displayName = 'ArchitectureSection';
