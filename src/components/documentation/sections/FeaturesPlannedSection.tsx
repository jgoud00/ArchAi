import { memo } from 'react';
import { DocSection, FeatureItem } from '../DocComponents';

/**
 * FeaturesPlannedSection - List of planned/incomplete features
 */
export const FeaturesPlannedSection = memo(() => (
    <DocSection title="Features Planned">
        <FeatureItem
            title="Drone Hub AI"
            description="AI-powered analysis of drone scans is planned. Will include object detection, progress tracking, anomaly detection, and automated reporting."
        />
        <FeatureItem
            title="3D Model Integration"
            description="Full 3D model viewing and manipulation with measurements, annotations, and export options."
        />
        <FeatureItem
            title="Real-time Collaboration"
            description="Supabase Realtime subscriptions for live updates. Will enable instant notifications and collaborative editing."
        />
        <FeatureItem
            title="Advanced Reporting"
            description="Generate comprehensive reports with charts, progress photos, and export to PDF/Excel."
        />
        <FeatureItem
            title="Mobile App"
            description="React Native mobile application for field workers with offline support."
        />
        <FeatureItem
            title="API Access"
            description="RESTful API for third-party integrations with webhook support."
        />
    </DocSection>
));

FeaturesPlannedSection.displayName = 'FeaturesPlannedSection';
