import { memo } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ModuleButtonProps {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
}

/**
 * ModuleButton - Navigation button for project modules
 */
export const ModuleButton = memo(({ icon: Icon, label, onClick }: ModuleButtonProps) => (
    <Button
        variant="outline"
        className="h-auto flex-col py-4 hover-lift border-primary/20 hover:border-primary/50 hover:bg-primary/5"
        onClick={onClick}
    >
        <Icon className="h-5 w-5 mb-2 text-primary" />
        {label}
    </Button>
));

ModuleButton.displayName = 'ModuleButton';
