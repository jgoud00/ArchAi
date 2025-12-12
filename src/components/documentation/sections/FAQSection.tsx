import { memo } from 'react';
import { DocSection, FAQItem } from '../DocComponents';

/**
 * FAQSection - Frequently asked questions
 */
export const FAQSection = memo(() => (
    <DocSection title="Frequently Asked Questions">
        <div className="space-y-2">
            <FAQItem
                question="How do I create a new project?"
                answer="Navigate to the Dashboard and click the 'New Project' button. Fill in the project name, description, and optional client information. The project will be created and you'll be redirected to the project detail page."
            />
            <FAQItem
                question="How do I invite team members?"
                answer="Open a project, go to the Team tab, and click 'Invite Member'. Enter their email address and select a role (Viewer, Editor, or Owner). They'll receive an email invitation to join the project."
            />
            <FAQItem
                question="Can I upload drone footage?"
                answer="Yes! In the project detail page, go to the Scans tab and click 'Upload Scan'. You can upload images (JPG, PNG) and videos (MP4, WebM). The system will process and store them in cloud storage."
            />
            <FAQItem
                question="How does the blueprint editor work?"
                answer="The CAD Blueprint Editor allows you to draw walls, rooms, doors, windows, and other architectural elements. Use the toolbar to select tools, the properties panel to adjust settings, and the layers panel to organize your drawing. Export to PDF or image when done."
            />
            <FAQItem
                question="Is my data secure?"
                answer="Yes. All data is stored in Supabase with Row Level Security (RLS) policies. Only authorized users can access project data. Passwords are hashed, and all connections use HTTPS encryption."
            />
            <FAQItem
                question="Can I use this on mobile?"
                answer="The application is responsive and works on mobile browsers. A dedicated mobile app is planned for future development with offline support."
            />
            <FAQItem
                question="How do I reset my password?"
                answer="Click 'Forgot Password' on the login page and enter your email. You'll receive a password reset link that's valid for 24 hours."
            />
            <FAQItem
                question="Can I export my data?"
                answer="Yes. You can export blueprints as PDF or images, generate project reports, and download uploaded files. Full data export functionality is planned."
            />
        </div>
    </DocSection>
));

FAQSection.displayName = 'FAQSection';
