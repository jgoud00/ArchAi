import { memo } from 'react';

interface StepCardProps {
    number: string;
    title: string;
    description: string;
}

export const StepCard = memo<StepCardProps>(({ number, title, description }) => (
    <div className="relative flex flex-col items-center text-center max-w-sm mx-auto">
        <div className="w-16 h-16 rounded-full bg-muted border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-primary mb-6 shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
            {number}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
));

StepCard.displayName = 'StepCard';
