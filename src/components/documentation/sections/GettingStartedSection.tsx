import { memo } from 'react';
import { DocSection, WorkflowStep } from '../DocComponents';

/**
 * GettingStartedSection - Tutorial/walkthrough for new users
 */
export const GettingStartedSection = memo(() => (
    <DocSection title="Getting Started" defaultOpen>
        <div className="space-y-6">
            <WorkflowStep
                step={1}
                title="Create an Account"
                description="Sign up with your email and password. Verify your email if required by your organization's settings."
            />
            <WorkflowStep
                step={2}
                title="Create Your First Project"
                description="Click 'New Project' on the dashboard. Enter a name, description, and optionally assign a client."
            />
            <WorkflowStep
                step={3}
                title="Invite Your Team"
                description="Go to the Team tab in your project and invite members by email. Assign appropriate roles based on their responsibilities."
            />
            <WorkflowStep
                step={4}
                title="Upload Drone Scans"
                description="Navigate to the Scans tab and upload your drone imagery. Supported formats include JPG, PNG, and MP4."
            />
            <WorkflowStep
                step={5}
                title="Create Blueprints"
                description="Use the CAD Blueprint Editor to create floor plans, site layouts, or annotate existing drawings."
            />
            <WorkflowStep
                step={6}
                title="Track Progress"
                description="Use Issues, Tasks, and Activity tracking to monitor project progress and team contributions."
            />
        </div>
    </DocSection>
));

GettingStartedSection.displayName = 'GettingStartedSection';
