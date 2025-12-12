import { memo, useState, useEffect, useCallback, ReactNode } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

const ONBOARDING_KEY = 'archai-onboarding-completed';
const TOOLTIPS_KEY = 'archai-tooltips-dismissed';

// ============================================
// ONBOARDING TOOLTIP
// ============================================

interface OnboardingTooltipProps {
    /** Unique ID for this tooltip */
    id: string;
    /** Tooltip content */
    children: ReactNode;
    /** Position relative to target */
    position?: 'top' | 'bottom' | 'left' | 'right';
    /** Title text */
    title?: string;
    /** Whether to show on first visit only */
    firstTimeOnly?: boolean;
    /** Callback when dismissed */
    onDismiss?: () => void;
    /** Additional class names */
    className?: string;
}

/**
 * OnboardingTooltip - First-time user tooltip hints
 */
export const OnboardingTooltip = memo(({
    id,
    children,
    position = 'bottom',
    title,
    firstTimeOnly = true,
    onDismiss,
    className,
}: OnboardingTooltipProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (firstTimeOnly) {
            const dismissed = JSON.parse(localStorage.getItem(TOOLTIPS_KEY) || '[]');
            if (!dismissed.includes(id)) {
                setIsVisible(true);
            }
        } else {
            setIsVisible(true);
        }
    }, [id, firstTimeOnly]);

    const handleDismiss = useCallback(() => {
        setIsVisible(false);

        if (firstTimeOnly) {
            const dismissed = JSON.parse(localStorage.getItem(TOOLTIPS_KEY) || '[]');
            if (!dismissed.includes(id)) {
                dismissed.push(id);
                localStorage.setItem(TOOLTIPS_KEY, JSON.stringify(dismissed));
            }
        }

        onDismiss?.();
    }, [id, firstTimeOnly, onDismiss]);

    if (!isVisible) return null;

    const positionClasses = {
        top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
        bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
        left: 'right-full mr-2 top-1/2 -translate-y-1/2',
        right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-primary',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-primary',
        left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-primary',
        right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-primary',
    };

    return (
        <div
            className={cn(
                "absolute z-50 w-64",
                positionClasses[position],
                "animate-fade-in",
                className
            )}
        >
            <div className="bg-primary text-primary-foreground rounded-lg shadow-xl p-3">
                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-0.5 rounded hover:bg-white/20 transition-colors"
                    aria-label="Dismiss"
                >
                    <X className="h-3.5 w-3.5" />
                </button>

                {/* Content */}
                {title && <div className="font-semibold text-sm mb-1 pr-4">{title}</div>}
                <div className="text-xs opacity-90">{children}</div>

                {/* Got it button */}
                <button
                    onClick={handleDismiss}
                    className="mt-2 text-xs font-medium underline underline-offset-2 hover:no-underline"
                >
                    Got it
                </button>
            </div>

            {/* Arrow */}
            <div className={cn(
                "absolute w-0 h-0 border-[6px]",
                arrowClasses[position]
            )} />
        </div>
    );
});

OnboardingTooltip.displayName = 'OnboardingTooltip';

// ============================================
// FEATURE SPOTLIGHT
// ============================================

interface SpotlightProps {
    /** Whether spotlight is active */
    active: boolean;
    /** Target element selector or ref */
    targetSelector?: string;
    /** Position for the tooltip */
    tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
    /** Title text */
    title: string;
    /** Description text */
    description: string;
    /** Step number */
    step?: number;
    /** Total steps */
    totalSteps?: number;
    /** On next callback */
    onNext?: () => void;
    /** On previous callback */
    onPrev?: () => void;
    /** On skip callback */
    onSkip?: () => void;
    /** On complete callback */
    onComplete?: () => void;
}

/**
 * Spotlight - Feature discovery highlight effect
 */
export const Spotlight = memo(({
    active,
    targetSelector,
    tooltipPosition = 'bottom',
    title,
    description,
    step = 1,
    totalSteps = 1,
    onNext,
    onPrev,
    onSkip,
    onComplete,
}: SpotlightProps) => {
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (!active || !targetSelector) return;

        const target = document.querySelector(targetSelector);
        if (target) {
            const rect = target.getBoundingClientRect();
            setTargetRect(rect);

            // Scroll into view if needed
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [active, targetSelector]);

    if (!active) return null;

    const isLastStep = step === totalSteps;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-[100] pointer-events-auto"
                onClick={onSkip}
            >
                {/* Dark overlay with cutout */}
                <svg className="absolute inset-0 w-full h-full">
                    <defs>
                        <mask id="spotlight-mask">
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            {targetRect && (
                                <rect
                                    x={targetRect.left - 8}
                                    y={targetRect.top - 8}
                                    width={targetRect.width + 16}
                                    height={targetRect.height + 16}
                                    rx="8"
                                    fill="black"
                                />
                            )}
                        </mask>
                    </defs>
                    <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="rgba(0,0,0,0.7)"
                        mask="url(#spotlight-mask)"
                    />
                </svg>

                {/* Highlight ring */}
                {targetRect && (
                    <div
                        className="absolute border-2 border-primary rounded-lg animate-pulse pointer-events-none"
                        style={{
                            left: targetRect.left - 8,
                            top: targetRect.top - 8,
                            width: targetRect.width + 16,
                            height: targetRect.height + 16,
                        }}
                    />
                )}
            </div>

            {/* Tooltip */}
            {targetRect && (
                <div
                    className="fixed z-[101] w-80 bg-card border border-border rounded-xl shadow-2xl p-4 animate-fade-in"
                    style={{
                        left: tooltipPosition === 'left'
                            ? targetRect.left - 340
                            : tooltipPosition === 'right'
                                ? targetRect.right + 20
                                : targetRect.left + (targetRect.width - 320) / 2,
                        top: tooltipPosition === 'top'
                            ? targetRect.top - 160
                            : tooltipPosition === 'bottom'
                                ? targetRect.bottom + 20
                                : targetRect.top + (targetRect.height - 120) / 2,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Step indicator */}
                    {totalSteps > 1 && (
                        <div className="flex items-center gap-1 mb-2">
                            {Array.from({ length: totalSteps }).map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all",
                                        i + 1 === step ? "w-4 bg-primary" : "w-1.5 bg-muted"
                                    )}
                                />
                            ))}
                            <span className="ml-auto text-xs text-muted-foreground">
                                {step} of {totalSteps}
                            </span>
                        </div>
                    )}

                    {/* Content */}
                    <h4 className="font-semibold text-foreground mb-1">{title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{description}</p>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onSkip}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Skip tour
                        </button>
                        <div className="flex items-center gap-2">
                            {step > 1 && (
                                <Button variant="ghost" size="sm" onClick={onPrev}>
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Back
                                </Button>
                            )}
                            <Button
                                size="sm"
                                onClick={isLastStep ? onComplete : onNext}
                            >
                                {isLastStep ? 'Finish' : 'Next'}
                                {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

Spotlight.displayName = 'Spotlight';

// ============================================
// TUTORIAL MODE HOOK
// ============================================

import { useTutorial, TutorialStep } from '@/hooks/useTutorial';

interface TutorialProps {
    tutorialId: string;
    steps: TutorialStep[];
    showOnce?: boolean;
    onComplete?: () => void;
}

/**
 * Tutorial - Guided walkthrough component
 */
export const Tutorial = memo(({ tutorialId, steps, showOnce = true, onComplete }: TutorialProps) => {
    const {
        isActive,
        currentStep,
        totalSteps,
        currentStepData,
        next,
        prev,
        skip,
        complete,
    } = useTutorial({ tutorialId, steps, showOnce, onComplete });

    if (!isActive || !currentStepData) return null;

    return (
        <Spotlight
            active={isActive}
            targetSelector={currentStepData.targetSelector}
            tooltipPosition={currentStepData.position}
            title={currentStepData.title}
            description={currentStepData.description}
            step={currentStep}
            totalSteps={totalSteps}
            onNext={next}
            onPrev={prev}
            onSkip={skip}
            onComplete={complete}
        />
    );
});

Tutorial.displayName = 'Tutorial';

// ============================================
// RESET ONBOARDING BUTTON (for settings)
// ============================================

export const ResetOnboardingButton = memo(() => {
    const handleReset = useCallback(() => {
        localStorage.removeItem(ONBOARDING_KEY);
        localStorage.removeItem(TOOLTIPS_KEY);
        window.location.reload();
    }, []);

    return (
        <Button variant="outline" size="sm" onClick={handleReset}>
            Reset Onboarding
        </Button>
    );
});

ResetOnboardingButton.displayName = 'ResetOnboardingButton';
