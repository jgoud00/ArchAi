import { useBlueprintStore, CADTool } from '@/store/blueprintStore';
import { Button } from '@/components/ui/Button';
import { Minus, Square, Circle, Columns, DoorOpen, SquareSlash, Ruler, Hand, Grid3x3 } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Drawing toolbar for CAD tools
 */
export const DrawingToolbar = () => {
    const { selectedTool, setSelectedTool, snapEnabled, toggleSnap, gridVisible, toggleGridVisible } = useBlueprintStore();

    const tools: { id: CADTool; label: string; icon: React.ElementType; shortcut: string }[] = [
        { id: 'select', label: 'Select', icon: Hand, shortcut: 'Esc' },
        { id: 'line', label: 'Line', icon: Minus, shortcut: 'L' },
        { id: 'rectangle', label: 'Rectangle', icon: Square, shortcut: 'R' },
        { id: 'circle', label: 'Circle', icon: Circle, shortcut: 'C' },
        { id: 'wall', label: 'Wall', icon: Columns, shortcut: 'W' },
        { id: 'door', label: 'Door', icon: DoorOpen, shortcut: 'D' },
        { id: 'window', label: 'Window', icon: SquareSlash, shortcut: 'Win' },
        { id: 'measure', label: 'Measure', icon: Ruler, shortcut: 'M' },
    ];

    return (
        <div className="h-14 border-b border-border bg-background/80 backdrop-blur-md px-6 flex items-center gap-6">
            {/* Drawing Tools */}
            <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
                {tools.map((tool) => {
                    const Icon = tool.icon;
                    const isActive = selectedTool === tool.id;

                    return (
                        <Button
                            key={tool.id}
                            variant={isActive ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedTool(tool.id)}
                            className={cn(
                                'h-9 px-3 gap-2',
                                isActive && 'bg-primary text-primary-foreground shadow-sm'
                            )}
                            title={`${tool.label} (${tool.shortcut})`}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="text-xs font-medium">{tool.label}</span>
                        </Button>
                    );
                })}
            </div>

            {/* Separator */}
            <div className="h-8 w-px bg-border" />

            {/* Grid & Snap Controls */}
            <div className="flex items-center gap-2">
                <Button
                    variant={gridVisible ? 'default' : 'outline'}
                    size="sm"
                    onClick={toggleGridVisible}
                    className="h-9 px-3 gap-2"
                    title="Toggle Grid (G)"
                >
                    <Grid3x3 className="h-4 w-4" />
                    <span className="text-xs">Grid</span>
                </Button>

                <Button
                    variant={snapEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={toggleSnap}
                    className="h-9 px-3 gap-2"
                    title="Toggle Snap (S)"
                >
                    <span className="text-xs font-bold">⊞</span>
                    <span className="text-xs">Snap</span>
                </Button>
            </div>

            {/* Separator */}
            <div className="h-8 w-px bg-border" />

            {/* Scale Selector */}
            <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Scale:</label>
                <select className="h-8 px-2 text-xs bg-background border border-border rounded">
                    <option>1:100</option>
                    <option>1:50</option>
                    <option>1:20</option>
                    <option>Custom</option>
                </select>
            </div>
        </div>
    );
};
