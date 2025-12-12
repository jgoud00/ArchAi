import { useRef, useEffect } from 'react';

interface WorkerMessage {
    type: string;
    data: any;
}

/**
 * useWebWorker - Hook to use web worker for heavy calculations
 */
export const useWebWorker = (workerPath: string) => {
    const workerRef = useRef<Worker | null>(null);
    const callbacksRef = useRef<Map<string, (result: any) => void>>(new Map());

    useEffect(() => {
        // Create worker
        workerRef.current = new Worker(new URL(workerPath, import.meta.url), {
            type: 'module',
        });

        // Handle messages from worker
        workerRef.current.onmessage = (e: MessageEvent) => {
            const { type, result } = e.data;
            const callback = callbacksRef.current.get(type);
            if (callback) {
                callback(result);
                callbacksRef.current.delete(type);
            }
        };

        // Cleanup on unmount
        return () => {
            workerRef.current?.terminate();
        };
    }, [workerPath]);

    const postMessage = (message: WorkerMessage, callback?: (result: any) => void) => {
        if (!workerRef.current) return;

        if (callback) {
            callbacksRef.current.set(message.type, callback);
        }

        workerRef.current.postMessage(message);
    };

    return { postMessage };
};
