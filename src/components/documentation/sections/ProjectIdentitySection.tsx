import { memo } from 'react';
import { DocSection, DefinitionList, BulletList } from '../DocComponents';

/**
 * ProjectIdentitySection - Project name, purpose, vision, and differentiators
 */
export const ProjectIdentitySection = memo(() => (
    <DocSection title="Project Identity" defaultOpen>
        <DefinitionList
            items={[
                { term: 'Name', definition: 'ArchitectAI' },
                {
                    term: 'Purpose',
                    definition: 'A comprehensive web application for construction teams to manage projects, collaborate with team members, upload and analyze drone scans, manage inventory, create blueprints, and track project activities in real-time.'
                },
                {
                    term: 'Vision',
                    definition: 'To revolutionize construction project management by providing an all-in-one platform that combines project management, AI-powered drone image analysis, blueprint sketching, and inventory tracking in a seamless, user-friendly interface.'
                }
            ]}
        />
        <BulletList
            title="Key Differentiators"
            items={[
                'AI-powered drone scan analysis',
                'Integrated blueprint sketching tool',
                'Real-time team collaboration',
                'Comprehensive activity tracking',
                'Role-based access control',
                'Cloud-based file storage and management'
            ]}
        />
    </DocSection>
));

ProjectIdentitySection.displayName = 'ProjectIdentitySection';
