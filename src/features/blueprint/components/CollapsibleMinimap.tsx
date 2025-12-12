import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { useReactFlow, useViewport, Node } from '@xyflow/react';
import { ChevronLeft, ChevronRight, Map, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface CollapsibleMinimapProps {
    nodes: Node[];
    className?: string;
}

const MINIMAP_WIDTH = 200;
const MINIMAP_HEIGHT = 150;
const PADDING = 20;

/**
 * CollapsibleMinimap - Full-canvas overview with collapse/expand
 * 
 * Features:
 * - Shows all nodes at scale
 * - Click to navigate
 * - Viewport indicator
 * - Collapsible panel
 */
export const CollapsibleMinimap = memo(({ nodes, className }: CollapsibleMinimapProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { setViewport, getViewport } = useReactFlow();
    const viewport = useViewport();

    // Calculate bounds of all nodes
    const getBounds = useCallback(() => {
        if (nodes.length === 0) {
            return { minX: 0, minY: 0, maxX: 1000, maxY: 800 };
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        nodes.forEach(node => {
            const width = (node.style?.width as number) || 100;
            const height = (node.style?.height as number) || 100;

            minX = Math.min(minX, node.position.x);
            minY = Math.min(minY, node.position.y);
            maxX = Math.max(maxX, node.position.x + width);
            maxY = Math.max(maxY, node.position.y + height);
        });

        // Add padding
        return {
            minX: minX - PADDING,
            minY: minY - PADDING,
            maxX: maxX + PADDING,
            maxY: maxY + PADDING,
        };
    }, [nodes]);

    // Draw minimap
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || isCollapsed) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bounds = getBounds();
        const boundsWidth = bounds.maxX - bounds.minX;
        const boundsHeight = bounds.maxY - bounds.minY;

        // Calculate scale to fit
        const scaleX = MINIMAP_WIDTH / boundsWidth;
        const scaleY = MINIMAP_HEIGHT / boundsHeight;
        const scale = Math.min(scaleX, scaleY) * 0.9;

        // Clear canvas
        ctx.clearRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

        // Background
        ctx.fillStyle = 'hsl(var(--card))';
        ctx.fillRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

        // Draw grid
        ctx.strokeStyle = 'hsl(var(--border))';
        ctx.lineWidth = 0.5;
        const gridSize = 20 * scale;
        for (let x = 0; x < MINIMAP_WIDTH; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, MINIMAP_HEIGHT);
            ctx.stroke();
        }
        for (let y = 0; y < MINIMAP_HEIGHT; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(MINIMAP_WIDTH, y);
            ctx.stroke();
        }

        // Offset to center content
        const offsetX = (MINIMAP_WIDTH - boundsWidth * scale) / 2 - bounds.minX * scale;
        const offsetY = (MINIMAP_HEIGHT - boundsHeight * scale) / 2 - bounds.minY * scale;

        // Draw nodes
        nodes.forEach(node => {
            const width = (node.style?.width as number) || 100;
            const height = (node.style?.height as number) || 100;

            const x = node.position.x * scale + offsetX;
            const y = node.position.y * scale + offsetY;
            const w = width * scale;
            const h = height * scale;

            // Node fill
            ctx.fillStyle = 'hsl(var(--primary) / 0.3)';
            ctx.fillRect(x, y, w, h);

            // Node border
            ctx.strokeStyle = 'hsl(var(--primary))';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, w, h);
        });

        // Draw viewport indicator
        const vp = getViewport();
        const vpX = (-vp.x / vp.zoom) * scale + offsetX;
        const vpY = (-vp.y / vp.zoom) * scale + offsetY;
        const vpW = (window.innerWidth / vp.zoom) * scale;
        const vpH = (window.innerHeight / vp.zoom) * scale;

        ctx.strokeStyle = 'hsl(var(--primary))';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 2]);
        ctx.strokeRect(vpX, vpY, vpW, vpH);
        ctx.setLineDash([]);

        // Viewport fill
        ctx.fillStyle = 'hsl(var(--primary) / 0.1)';
        ctx.fillRect(vpX, vpY, vpW, vpH);
    }, [nodes, viewport, isCollapsed, getBounds, getViewport]);

    // Handle click to navigate
    const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const bounds = getBounds();
        const boundsWidth = bounds.maxX - bounds.minX;
        const boundsHeight = bounds.maxY - bounds.minY;

        const scaleX = MINIMAP_WIDTH / boundsWidth;
        const scaleY = MINIMAP_HEIGHT / boundsHeight;
        const scale = Math.min(scaleX, scaleY) * 0.9;

        const offsetX = (MINIMAP_WIDTH - boundsWidth * scale) / 2 - bounds.minX * scale;
        const offsetY = (MINIMAP_HEIGHT - boundsHeight * scale) / 2 - bounds.minY * scale;

        // Convert click position to canvas coordinates
        const canvasX = (clickX - offsetX) / scale;
        const canvasY = (clickY - offsetY) / scale;

        // Center viewport on clicked position
        const vp = getViewport();
        setViewport(
            {
                x: -canvasX * vp.zoom + window.innerWidth / 2,
                y: -canvasY * vp.zoom + window.innerHeight / 2,
                zoom: vp.zoom,
            },
            { duration: 300 }
        );
    }, [getBounds, getViewport, setViewport]);

    return (
        <div className={cn(
            "absolute bottom-4 right-4 z-10 transition-all duration-300",
            className
        )}>
            <div className={cn(
                "bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden",
                "transition-all duration-300",
                isCollapsed ? "w-10" : "w-[220px]"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between p-2 border-b border-border">
                    {!isCollapsed && (
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Map className="h-3 w-3" />
                            Overview
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="h-6 w-6 ml-auto"
                    >
                        {isCollapsed ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </Button>
                </div>

                {/* Canvas */}
                {!isCollapsed && (
                    <div className="p-2">
                        <canvas
                            ref={canvasRef}
                            width={MINIMAP_WIDTH}
                            height={MINIMAP_HEIGHT}
                            onClick={handleClick}
                            className="cursor-crosshair rounded border border-border/50"
                            style={{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT }}
                        />
                        <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                            <span>{nodes.length} nodes</span>
                            <span className="flex items-center gap-1">
                                <Crosshair className="h-2.5 w-2.5" />
                                Click to navigate
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

CollapsibleMinimap.displayName = 'CollapsibleMinimap';
