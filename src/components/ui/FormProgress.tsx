import { memo } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FormProgressProps {
    currentStep: number;
    totalSteps: number;
    steps?: string[];
    completedSteps?: number[];
    className?: string;
}

export const FormProgress = memo(({ currentStep, totalSteps, steps, completedSteps = [], className }: FormProgressProps) => {
    const percentage = totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 0;

    return (
        <div className={cn("space-y-3", className)} role="navigation" aria-label="Form progress">
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${percentage}%` }} />
            </div>
            <div className="flex justify-between">
                {Array.from({ length: totalSteps }).map((_, index) => {
                    const stepNum = index + 1;
                    const isActive = stepNum === currentStep;
                    const isCompleted = completedSteps.includes(stepNum) || stepNum < currentStep;
                    return (
                        <div key={index} className="flex flex-col items-center gap-1">
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                                isCompleted ? "bg-primary text-primary-foreground" : isActive ? "bg-primary/20 text-primary ring-2 ring-primary" : "bg-muted text-muted-foreground"
                            )} aria-current={isActive ? 'step' : undefined}>
                                {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
                            </div>
                            {steps?.[index] && <span className={cn("text-xs", isActive ? "text-foreground font-medium" : "text-muted-foreground")}>{steps[index]}</span>}
                        </div>
                    );
                })}
            </div>
            <div className="sr-only">Step {currentStep} of {totalSteps}</div>
        </div>
    );
});

FormProgress.displayName = 'FormProgress';
