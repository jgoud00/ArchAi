import { useState, useEffect, useCallback, useRef } from 'react';

export const useFormAutoSave = <T,>({
    data,
    storageKey,
    debounceMs = 2000,
    onSave,
    enabled = true,
}: {
    data: T;
    storageKey: string;
    debounceMs?: number;
    onSave?: (data: T) => Promise<void>;
    enabled?: boolean;
}) => {
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const previousDataRef = useRef<string>(JSON.stringify(data));

    // Refs to keep 'save' function stable
    const dataRef = useRef(data);
    const onSaveRef = useRef(onSave);

    useEffect(() => {
        dataRef.current = data;
        onSaveRef.current = onSave;
    }, [data, onSave]);

    const save = useCallback(async () => {
        if (!enabled) return;
        const currentData = dataRef.current;
        try {
            setStatus('saving');
            setErrorMessage(null);
            localStorage.setItem(storageKey, JSON.stringify(currentData));
            if (onSaveRef.current) await onSaveRef.current(currentData);
            setLastSaved(new Date());
            setStatus('saved');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Save failed');
            setStatus('error');
        }
    }, [storageKey, enabled]);

    useEffect(() => {
        const currentData = JSON.stringify(data);
        if (currentData === previousDataRef.current) return;

        previousDataRef.current = currentData;
        if (!enabled) return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Only schedule if content changed
        timeoutRef.current = setTimeout(save, debounceMs);

        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, [data, debounceMs, save, enabled]);

    return { status, lastSaved, errorMessage, saveNow: save };
};
