import { memo } from 'react';

interface TestimonialCardProps {
    quote: string;
    author: string;
    role: string;
}

export const TestimonialCard = memo<TestimonialCardProps>(({ quote, author, role }) => (
    <div className="p-8 rounded-2xl bg-card/50 border border-border backdrop-blur-sm">
        <div className="flex text-primary mb-4">
            {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
            ))}
        </div>
        <p className="text-muted-foreground mb-6 italic">"{quote}"</p>
        <div>
            <div className="font-bold text-white">{author}</div>
            <div className="text-sm text-muted-foreground">{role}</div>
        </div>
    </div>
));

TestimonialCard.displayName = 'TestimonialCard';
