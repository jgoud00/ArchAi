import { useState, useEffect, useCallback } from 'react';

const ONBOARDING_KEY = 'archai-onboarding-completed';

export interface TutorialStep {
    id: string;
    targetSelector: string;
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface UseTutorialOptions {
    /** Tutorial ID for persistence */
    tutorialId: string;
    /** Tutorial steps */
    steps: TutorialStep[];
    /** Show only once */
    showOnce?: boolean;
    /** On complete callback */
    onComplete?: () => void;
}

/**
 * useTutorial - Hook for guided tutorial mode
 */
export const useTutorial = ({
    tutorialId,
    steps,
    showOnce = true,
    onComplete,
}: UseTutorialOptions) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Check if already completed
    useEffect(() => {
        if (showOnce) {
            const completed = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '[]');
            if (!completed.includes(tutorialId)) {
                // Auto-start on first visit
                setIsActive(true);
            }
        }
    }, [tutorialId, showOnce]);

    const start = useCallback(() => {
        setCurrentStep(0);
        setIsActive(true);
    }, []);

    const next = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(s => s + 1);
        }
    }, [currentStep, steps.length]);

    const prev = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(s => s - 1);
        }
    }, [currentStep]);

    const skip = useCallback(() => {
        setIsActive(false);

        if (showOnce) {
            const completed = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '[]');
            if (!completed.includes(tutorialId)) {
                completed.push(tutorialId);
                localStorage.setItem(ONBOARDING_KEY, JSON.stringify(completed));
            }
        }
    }, [tutorialId, showOnce]);

    const complete = useCallback(() => {
        setIsActive(false);

        if (showOnce) {
            const completed = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '[]');
            if (!completed.includes(tutorialId)) {
                completed.push(tutorialId);
                localStorage.setItem(ONBOARDING_KEY, JSON.stringify(completed));
            }
        }

        onComplete?.();
    }, [tutorialId, showOnce, onComplete]);

    const reset = useCallback(() => {
        const completed = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '[]');
        const filtered = completed.filter((id: string) => id !== tutorialId);
        localStorage.setItem(ONBOARDING_KEY, JSON.stringify(filtered));
        setCurrentStep(0);
    }, [tutorialId]);

    const currentStepData = steps[currentStep] || null;

    return {
        isActive,
        currentStep: currentStep + 1,
        totalSteps: steps.length,
        currentStepData,
        start,
        next,
        prev,
        skip,
        complete,
        reset,
    };
};
