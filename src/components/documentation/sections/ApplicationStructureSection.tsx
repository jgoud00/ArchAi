import { memo } from 'react';
import { DocSection, BulletList, TechBadgeGrid } from '../DocComponents';

/**
 * ApplicationStructureSection - Pages, entities, and layout documentation
 */
export const ApplicationStructureSection = memo(() => (
    <DocSection title="Application Structure">
        <BulletList
            title="Pages"
            items={[
                'Dashboard - Project overview and statistics',
                'Project Detail - Individual project management',
                'Settings - User profile and account settings',
                'Login/Signup - Authentication pages',
                'Forgot/Reset Password - Password recovery',
                'Documentation - This page',
                'Calendar - Schedule and timeline view',
                'Templates - Project templates',
                '3D Viewer - Model visualization'
            ]}
        />

        <TechBadgeGrid
            title="Core Entities"
            badges={['Users', 'Projects', 'Scans', 'Files', 'Comments', 'Team Members', 'Activities', 'Tasks', 'Issues', 'Inventory']}
        />

        <BulletList
            title="Layout Features"
            items={[
                'Left sidebar with navigation and user info',
                'Main content area with page-specific content',
                'Responsive design for mobile and desktop',
                'Toast notifications for user feedback',
                'Breadcrumb navigation',
                'Skip link for accessibility'
            ]}
        />
    </DocSection>
));

ApplicationStructureSection.displayName = 'ApplicationStructureSection';
