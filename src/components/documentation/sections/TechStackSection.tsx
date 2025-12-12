import { memo } from 'react';
import { DocSection, TechBadgeGrid } from '../DocComponents';

/**
 * TechStackSection - Technology stack documentation
 */
export const TechStackSection = memo(() => (
    <DocSection title="Technology Stack" defaultOpen>
        <TechBadgeGrid
            title="Frontend Core"
            badges={['React 18', 'TypeScript', 'Vite', 'TailwindCSS']}
        />

        <TechBadgeGrid
            title="UI Components"
            badges={['ShadCN/UI', 'Lucide Icons', 'React Router v6', 'Radix UI']}
        />

        <TechBadgeGrid
            title="State & Forms"
            badges={['Zustand', 'React Hook Form', 'Zod Validation']}
        />

        <TechBadgeGrid
            title="Backend (BaaS)"
            badges={['Supabase Auth', 'Supabase PostgreSQL', 'Supabase Storage', 'Supabase Realtime']}
        />

        <TechBadgeGrid
            title="Utilities"
            badges={['date-fns', 'jsPDF', 'html2canvas', '@xyflow/react', 'Three.js']}
        />

        <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Why This Stack?</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><strong>React + TypeScript</strong>: Type safety and component reusability</li>
                <li><strong>Vite</strong>: Fast development builds and HMR</li>
                <li><strong>TailwindCSS</strong>: Utility-first styling for rapid development</li>
                <li><strong>Supabase</strong>: Complete backend without server management</li>
                <li><strong>Zustand</strong>: Simple, scalable state management</li>
            </ul>
        </div>
    </DocSection>
));

TechStackSection.displayName = 'TechStackSection';
