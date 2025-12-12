import { memo } from 'react';
import { Save, Clock } from 'lucide-react';
import { useAutoSaveStore } from '@/store/autoSaveStore';
import { formatDistanceToNow } from 'date-fns';

/**
 * AutoSaveIndicator - Shows auto-save status in toolbar
 */
export const AutoSaveIndicator = memo(() => {
    const { lastSaved, isDirty, isSaving } = useAutoSaveStore();

    if (isSaving) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Save className="h-4 w-4 animate-pulse" />
                <span>Saving...</span>
            </div>
        );
    }

    if (isDirty) {
        return (
            <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                <Clock className="h-4 w-4" />
                <span>Unsaved changes</span>
            </div>
        );
    }

    if (lastSaved) {
        return (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Save className="h-4 w-4" />
                <span>Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}</span>
            </div>
        );
    }

    return null;
});

AutoSaveIndicator.displayName = 'AutoSaveIndicator';
