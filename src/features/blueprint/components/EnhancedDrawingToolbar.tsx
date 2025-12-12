import { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { useBlueprintStore, CADTool } from '@/features/blueprint/store/blueprintStore';
import { Button } from '@/components/ui/Button';
import {
    Minus,
    Square,
    Circle,
    Columns,
    DoorOpen,
    SquareSlash,
    Ruler,
    Hand,
    Grid3x3,
    Magnet,
    Check
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ToolConfig {
    id: CADTool;
    label: string;
    icon: React.ElementType;
    shortcut: string;
    description?: string;
}

/**
 * Enhanced Drawing toolbar with keyboard shortcut hints
 */
export const EnhancedDrawingToolbar = memo(() => {
    const {
        selectedTool,
        setSelectedTool,
        snapEnabled,
        toggleSnap,
        gridVisible,
        toggleGridVisible,
        gridSize
    } = useBlueprintStore();

    const [showSnapFeedback, setShowSnapFeedback] = useState(false);

    // Show feedback animation when snap is toggled
    useEffect(() => {
        if (showSnapFeedback) {
            const timer = setTimeout(() => setShowSnapFeedback(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [showSnapFeedback]);

    const handleSnapToggle = useCallback(() => {
        toggleSnap();
        setShowSnapFeedback(true);
    }, [toggleSnap]);

    // Tools with keyboard shortcuts and descriptions
    const tools = useMemo<ToolConfig[]>(() => [
        { id: 'select', label: 'Select', icon: Hand, shortcut: 'Esc', description: 'Select and move objects' },
        { id: 'line', label: 'Line', icon: Minus, shortcut: 'L', description: 'Draw straight lines' },
        { id: 'rectangle', label: 'Rectangle', icon: Square, shortcut: 'R', description: 'Draw rectangles' },
        { id: 'circle', label: 'Circle', icon: Circle, shortcut: 'C', description: 'Draw circles' },
        { id: 'wall', label: 'Wall', icon: Columns, shortcut: 'W', description: 'Draw walls' },
        { id: 'door', label: 'Door', icon: DoorOpen, shortcut: 'D', description: 'Add doors' },
        { id: 'window', label: 'Window', icon: SquareSlash, shortcut: 'N', description: 'Add windows' },
        { id: 'measure', label: 'Measure', icon: Ruler, shortcut: 'M', description: 'Measure distances' },
    ], []);

    const handleToolClick = useCallback((toolId: CADTool) => {
        setSelectedTool(toolId);
    }, [setSelectedTool]);

    return (
        <div className="h-14 border-b border-border bg-background/80 backdrop-blur-md px-6 flex items-center gap-6">
            {/* Drawing Tools with Shortcut Hints */}
            <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
                {tools.map((tool) => {
                    const Icon = tool.icon;
                    const isActive = selectedTool === tool.id;

                    return (
                        <div key={tool.id} className="relative group">
                            <Button
                                variant={isActive ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => handleToolClick(tool.id)}
                                className={cn(
                                    'h-9 px-3 gap-2 relative',
                                    isActive && 'bg-primary text-primary-foreground shadow-sm'
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="text-xs font-medium">{tool.label}</span>
                                {/* Keyboard Shortcut Badge */}
                                <span className={cn(
                                    "absolute -top-1 -right-1 h-4 min-w-[16px] px-1",
                                    "flex items-center justify-center",
                                    "text-[9px] font-bold rounded",
                                    "bg-muted text-muted-foreground",
                                    "border border-border/50",
                                    isActive && "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
                                )}>
                                    {tool.shortcut}
                                </span>
                            </Button>

                            {/* Tooltip on hover */}
                            <div className={cn(
                                "absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1.5",
                                "bg-popover text-popover-foreground text-xs rounded-md shadow-lg border border-border",
                                "opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50",
                                "whitespace-nowrap"
                            )}>
                                <div className="font-medium">{tool.label}</div>
                                <div className="text-muted-foreground text-[10px]">{tool.description}</div>
                                <div className="text-primary text-[10px] mt-0.5">Press {tool.shortcut}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Separator */}
            <div className="h-8 w-px bg-border" />

            {/* Grid & Snap Controls */}
            <div className="flex items-center gap-2 relative">
                {/* Grid Toggle */}
                <Button
                    variant={gridVisible ? 'default' : 'outline'}
                    size="sm"
                    onClick={toggleGridVisible}
                    className="h-9 px-3 gap-2"
                >
                    <Grid3x3 className="h-4 w-4" />
                    <span className="text-xs">Grid</span>
                    <span className="text-[9px] bg-muted/50 px-1 rounded">G</span>
                </Button>

                {/* Enhanced Snap Toggle */}
                <div className="relative">
                    <Button
                        variant={snapEnabled ? 'default' : 'outline'}
                        size="sm"
                        onClick={handleSnapToggle}
                        className={cn(
                            "h-9 px-3 gap-2 transition-all duration-200",
                            snapEnabled && "ring-2 ring-primary/30"
                        )}
                    >
                        <Magnet className={cn(
                            "h-4 w-4 transition-transform",
                            snapEnabled && "text-primary-foreground"
                        )} />
                        <span className="text-xs">Snap</span>
                        <span className="text-[9px] bg-muted/50 px-1 rounded">S</span>
                    </Button>

                    {/* Snap Feedback Toast */}
                    {showSnapFeedback && (
                        <div className={cn(
                            "absolute -bottom-10 left-1/2 -translate-x-1/2",
                            "flex items-center gap-1.5 px-3 py-1.5",
                            "bg-card text-xs font-medium rounded-full shadow-lg border border-border",
                            "animate-fade-in-up"
                        )}>
                            {snapEnabled ? (
                                <>
                                    <Check className="h-3 w-3 text-green-500" />
                                    <span>Snap ON ({gridSize}px)</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-muted-foreground">Snap OFF</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Separator */}
            <div className="h-8 w-px bg-border" />

            {/* Scale Selector */}
            <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Scale:</label>
                <select className="h-8 px-2 text-xs bg-background border border-border rounded cursor-pointer hover:border-primary/50 transition-colors">
                    <option>1:100</option>
                    <option>1:50</option>
                    <option>1:20</option>
                    <option>Custom</option>
                </select>
            </div>

            {/* Keyboard Help Hint */}
            <div className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                <span className="bg-muted px-1.5 py-0.5 rounded text-[10px]">?</span>
                <span>Help</span>
            </div>
        </div>
    );
});

EnhancedDrawingToolbar.displayName = 'EnhancedDrawingToolbar';
