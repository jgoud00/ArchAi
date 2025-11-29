import { ArrowUpCircle, ArrowRightCircle, ArrowDownCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

type Priority = 'High' | 'Medium' | 'Low';

export const PriorityBadge = ({ priority }: { priority: Priority }) => {
    const colors = {
        High: 'text-red-500 bg-red-500/10 border-red-500/20',
        Medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
        Low: 'text-primary bg-primary/10 border-primary/20'
    };

    const icons = {
        High: ArrowUpCircle,
        Medium: ArrowRightCircle,
        Low: ArrowDownCircle
    };

    const Icon = icons[priority];

    return (
        <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", colors[priority])}>
            <Icon className="w-3 h-3" />
            {priority}
        </div>
    );
};
