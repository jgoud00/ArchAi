import { useState, useEffect, useRef, memo, ImgHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    /** Image source URL */
    src: string;
    /** Alt text (required for accessibility) */
    alt: string;
    /** Width for aspect ratio (prevents CLS) */
    width?: number;
    /** Height for aspect ratio (prevents CLS) */
    height?: number;
    /** Priority loading for above-the-fold images */
    priority?: boolean;
    /** Lazy load (default: true) */
    lazy?: boolean;
    /** Blur placeholder color */
    placeholderColor?: string;
    /** Show loading skeleton */
    showSkeleton?: boolean;
    /** Object fit */
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    /** Callback on load */
    onLoad?: () => void;
    /** Callback on error */
    onError?: () => void;
    /** Fallback image on error */
    fallbackSrc?: string;
}

/**
 * OptimizedImage - Image component with lazy loading, CLS prevention, and error handling
 * 
 * Features:
 * - Lazy loading with IntersectionObserver
 * - Priority loading for critical images
 * - Width/height to prevent layout shift
 * - Loading skeleton
 * - Error fallback
 * - Blur-up placeholder
 */
export const OptimizedImage = memo(({
    src,
    alt,
    width,
    height,
    priority = false,
    lazy = true,
    placeholderColor = 'hsl(var(--muted))',
    showSkeleton = true,
    objectFit = 'cover',
    onLoad,
    onError,
    fallbackSrc,
    className,
    style,
    ...props
}: OptimizedImageProps) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [inView, setInView] = useState(priority);
    const imgRef = useRef<HTMLImageElement>(null);
    const placeholderRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (priority || !lazy) {
            setInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '200px', // Load 200px before entering viewport
                threshold: 0,
            }
        );

        if (placeholderRef.current) {
            observer.observe(placeholderRef.current);
        }

        return () => observer.disconnect();
    }, [priority, lazy]);

    // Preload priority images
    useEffect(() => {
        if (priority && src) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);

            return () => {
                document.head.removeChild(link);
            };
        }
    }, [priority, src]);

    const handleLoad = () => {
        setLoaded(true);
        setError(false);
        onLoad?.();
    };

    const handleError = () => {
        setError(true);
        setLoaded(true);
        onError?.();
    };

    const aspectRatio = width && height ? width / height : undefined;

    const containerStyle = {
        aspectRatio: aspectRatio ? `${width} / ${height}` : undefined,
        backgroundColor: !loaded && showSkeleton ? placeholderColor : undefined,
        ...style,
    };

    const imgSrc = error && fallbackSrc ? fallbackSrc : src;

    return (
        <div
            ref={placeholderRef}
            className={cn(
                "relative overflow-hidden",
                !loaded && showSkeleton && "animate-pulse",
                className
            )}
            style={containerStyle}
        >
            {inView && (
                <img
                    ref={imgRef}
                    src={imgSrc}
                    alt={alt}
                    width={width}
                    height={height}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding={priority ? 'sync' : 'async'}
                    fetchPriority={priority ? 'high' : 'auto'}
                    onLoad={handleLoad}
                    onError={handleError}
                    className={cn(
                        "transition-opacity duration-300",
                        !loaded && "opacity-0",
                        loaded && "opacity-100",
                        objectFit === 'cover' && "object-cover",
                        objectFit === 'contain' && "object-contain",
                        objectFit === 'fill' && "object-fill",
                        objectFit === 'none' && "object-none",
                        objectFit === 'scale-down' && "object-scale-down",
                        "w-full h-full"
                    )}
                    {...props}
                />
            )}

            {/* Error state */}
            {error && !fallbackSrc && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm">
                    Failed to load
                </div>
            )}
        </div>
    );
});

OptimizedImage.displayName = 'OptimizedImage';



// ============================================
// BACKGROUND IMAGE WITH LAZY LOADING
// ============================================

interface LazyBackgroundProps {
    /** Image URL */
    src: string;
    /** Children content */
    children?: React.ReactNode;
    /** Additional class names */
    className?: string;
    /** Placeholder color */
    placeholderColor?: string;
}

/**
 * LazyBackground - Div with lazy-loaded background image
 */
export const LazyBackground = memo(({
    src,
    children,
    className,
    placeholderColor = 'hsl(var(--muted))',
}: LazyBackgroundProps) => {
    const [loaded, setLoaded] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    const img = new Image();
                    img.onload = () => setLoaded(true);
                    img.src = src;
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [src]);

    return (
        <div
            ref={ref}
            className={cn(
                "transition-colors duration-300",
                className
            )}
            style={{
                backgroundColor: !loaded ? placeholderColor : undefined,
                backgroundImage: loaded ? `url(${src})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {children}
        </div>
    );
});

LazyBackground.displayName = 'LazyBackground';
