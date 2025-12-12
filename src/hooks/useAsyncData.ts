import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAsyncDataOptions<T> {
    initialData?: T | null;
    timeout?: number;
    cacheKey?: string;
    cacheTTL?: number;
    immediate?: boolean;
    deps?: unknown[];
}

interface AsyncDataState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    isStale: boolean;
}

const cache = new Map<string, { data: unknown; timestamp: number }>();

export function useAsyncData<T>(
    fetcher: () => Promise<T>,
    options: UseAsyncDataOptions<T> = {}
) {
    const {
        initialData = null,
        timeout = 30000,
        cacheKey,
        cacheTTL = 60000,
        immediate = true,
        deps = [],
    } = options;

    const [state, setState] = useState<AsyncDataState<T>>({
        data: initialData,
        loading: immediate,
        error: null,
        isStale: false,
    });

    const abortRef = useRef<AbortController | null>(null);
    const mountedRef = useRef(true);

    const execute = useCallback(async (skipCache = false) => {
        if (cacheKey && !skipCache) {
            const cached = cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < cacheTTL) {
                setState({
                    data: cached.data as T,
                    loading: false,
                    error: null,
                    isStale: false,
                });
                return cached.data as T;
            }
        }

        if (abortRef.current) {
            abortRef.current.abort();
        }

        abortRef.current = new AbortController();
        const signal = abortRef.current.signal;

        setState(prev => ({ ...prev, loading: true, error: null }));

        const timeoutPromise = new Promise<never>((_, reject) => {
            const timeoutId = setTimeout(() => {
                if (!signal.aborted) {
                    reject(new Error('Request timed out'));
                }
            }, timeout);
            signal.addEventListener('abort', () => clearTimeout(timeoutId));
        });

        try {
            const data = await Promise.race([fetcher(), timeoutPromise]);
            if (signal.aborted || !mountedRef.current) return null;

            if (cacheKey) {
                cache.set(cacheKey, { data, timestamp: Date.now() });
            }

            setState({ data, loading: false, error: null, isStale: false });
            return data;
        } catch (err) {
            if (signal.aborted || !mountedRef.current) return null;
            const message = err instanceof Error ? err.message : 'An error occurred';
            setState(prev => ({ ...prev, loading: false, error: message, isStale: prev.data !== null }));
            return null;
        }
    }, [fetcher, timeout, cacheKey, cacheTTL]);

    const invalidateCache = useCallback(() => {
        if (cacheKey) cache.delete(cacheKey);
    }, [cacheKey]);

    const refetch = useCallback(() => execute(true), [execute]);

    useEffect(() => {
        if (immediate) execute();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
            if (abortRef.current) abortRef.current.abort();
        };
    }, []);

    return { ...state, execute, refetch, invalidateCache };
}

// Utilities exported alongside hook if related
export function clearAllCache() {
    cache.clear();
}

export function clearCacheByPrefix(prefix: string) {
    for (const key of cache.keys()) {
        if (key.startsWith(prefix)) cache.delete(key);
    }
}
