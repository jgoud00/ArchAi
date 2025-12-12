import {
    ComponentType,
    lazy,
    ReactNode,
} from 'react';

// ============================================
// LAZY COMPONENT WITH TIMEOUT
// ============================================

interface LazyWithTimeoutOptions {
    timeout?: number;
    fallback?: ReactNode;
    errorFallback?: ReactNode;
}

export function lazyWithTimeout<T extends ComponentType<unknown>>(
    importFn: () => Promise<{ default: T }>,
    options: LazyWithTimeoutOptions = {}
) {
    const { timeout = 10000 } = options;

    return lazy(() => {
        return Promise.race([
            importFn(),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Component load timed out')), timeout)
            ),
        ]);
    });
}

// ============================================
// PREFETCH UTILITIES
// ============================================

export function prefetchComponent(importFn: () => Promise<unknown>) {
    importFn().catch(() => { });
}

export function prefetchRoute(
    componentImport: () => Promise<unknown>,
    dataFetcher?: () => Promise<unknown>
) {
    prefetchComponent(componentImport);
    if (dataFetcher) dataFetcher().catch(() => { });
}

// ============================================
// REQUEST DEDUPLICATION
// ============================================

const pendingRequests = new Map<string, Promise<unknown>>();

export async function deduplicatedFetch<T>(
    key: string,
    fetcher: () => Promise<T>
): Promise<T> {
    const pending = pendingRequests.get(key);
    if (pending) return pending as Promise<T>;

    const promise = fetcher().finally(() => pendingRequests.delete(key));
    pendingRequests.set(key, promise);
    return promise;
}
