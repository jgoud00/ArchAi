import { Suspense, lazy } from 'react';
import { Spinner } from '@/components/ui/Spinner';

// Lazy load the 3D viewer for better performance
const Complete3DPlaneViewer = lazy(() =>
    import('@/components/3d/Complete3DPlaneViewer').then((m) => ({ default: m.Complete3DPlaneViewer }))
);

/**
 * 3DViewerPage - Dedicated page for 3D visualization
 */
export const ThreeDViewerPage = () => {
    return (
        <div className="h-screen flex flex-col">
            <Suspense
                fallback={
                    <div className="flex-1 flex items-center justify-center">
                        <Spinner size="lg" />
                        <span className="ml-3 text-muted-foreground">Loading 3D Viewer...</span>
                    </div>
                }
            >
                <Complete3DPlaneViewer />
            </Suspense>
        </div>
    );
};
