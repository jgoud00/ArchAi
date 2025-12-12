import { memo } from 'react';

interface StatCardProps {
    value: string;
    label: string;
}

export const StatCard = memo<StatCardProps>(({ value, label }) => (
    <div className="text-center p-6 rounded-2xl bg-card/50 border border-border backdrop-blur-sm">
        <div className="text-4xl font-bold text-primary mb-2">{value}</div>
        <div className="text-muted-foreground font-medium">{label}</div>
    </div>
));

StatCard.displayName = 'StatCard';
