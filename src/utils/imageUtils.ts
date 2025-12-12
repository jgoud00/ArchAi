/**
 * preloadImage - Preload an image in the background
 */
export function preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * preloadImages - Preload multiple images
 */
export function preloadImages(srcs: string[]): Promise<PromiseSettledResult<void>[]> {
    return Promise.allSettled(srcs.map(preloadImage));
}
