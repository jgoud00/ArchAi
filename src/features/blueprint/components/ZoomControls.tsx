import { memo, useState, useCallback } from 'react';
import { useReactFlow, useViewport } from '@xyflow/react';
import {
    ZoomIn,
    ZoomOut,
    Maximize2,
    ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

const ZOOM_PRESETS = [
    { label: '50%', value: 0.5 },
    { label: '75%', value: 0.75 },
    { label: '100%', value: 1 },
    { label: '150%', value: 1.5 },
    { label: '200%', value: 2 },
];

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

/**
 * ZoomControls - Enhanced zoom controls with level indicator and presets
 * 
 * Features:
 * - Current zoom level display
 * - Quick zoom preset buttons
 * - Fit to view button
 * - Zoom in/out buttons
 */
export const ZoomControls = memo(() => {
    const { fitView, setViewport } = useReactFlow();
    const viewport = useViewport();
    const [showPresets, setShowPresets] = useState(false);

    const currentZoom = Math.round(viewport.zoom * 100);

    const handleZoomIn = useCallback(() => {
        const newZoom = Math.min(viewport.zoom + ZOOM_STEP, MAX_ZOOM);
        setViewport({ x: viewport.x, y: viewport.y, zoom: newZoom }, { duration: 200 });
    }, [viewport, setViewport]);

    const handleZoomOut = useCallback(() => {
        const newZoom = Math.max(viewport.zoom - ZOOM_STEP, MIN_ZOOM);
        setViewport({ x: viewport.x, y: viewport.y, zoom: newZoom }, { duration: 200 });
    }, [viewport, setViewport]);

    const handlePresetClick = useCallback((zoom: number) => {
        setViewport({ x: viewport.x, y: viewport.y, zoom }, { duration: 300 });
        setShowPresets(false);
    }, [viewport, setViewport]);

    const handleFitView = useCallback(() => {
        fitView({ padding: 0.2, duration: 300 });
    }, [fitView]);

    return (
        <div className="flex items-center gap-1 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-1 shadow-lg">
            {/* Zoom Out */}
            <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                disabled={viewport.zoom <= MIN_ZOOM}
                className="h-8 w-8"
                title="Zoom Out (Ctrl+-)"
            >
                <ZoomOut className="h-4 w-4" />
            </Button>

            {/* Zoom Level Indicator with Presets */}
            <div className="relative">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPresets(!showPresets)}
                    className="h-8 px-2 min-w-[60px] font-mono text-xs"
                >
                    {currentZoom}%
                    <ChevronDown className="h-3 w-3 ml-1" />
                </Button>

                {showPresets && (
                    <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg py-1 z-50 min-w-[80px]">
                        {ZOOM_PRESETS.map((preset) => (
                            <button
                                key={preset.value}
                                onClick={() => handlePresetClick(preset.value)}
                                className={cn(
                                    "w-full px-3 py-1.5 text-xs text-left hover:bg-muted transition-colors",
                                    Math.abs(viewport.zoom - preset.value) < 0.01 && "bg-primary/10 text-primary"
                                )}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Zoom In */}
            <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                disabled={viewport.zoom >= MAX_ZOOM}
                className="h-8 w-8"
                title="Zoom In (Ctrl++)"
            >
                <ZoomIn className="h-4 w-4" />
            </Button>

            {/* Separator */}
            <div className="h-6 w-px bg-border mx-1" />

            {/* Fit View */}
            <Button
                variant="ghost"
                size="icon"
                onClick={handleFitView}
                className="h-8 w-8"
                title="Fit to View (F)"
            >
                <Maximize2 className="h-4 w-4" />
            </Button>
        </div>
    );
});

ZoomControls.displayName = 'ZoomControls';
