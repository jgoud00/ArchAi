import { useBlueprintStore } from '@/store/blueprintStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Settings, X } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * Properties panel for editing selected node properties
 */
export const PropertiesPanel = () => {
    const {
        nodes,
        selectedNodeIds,
        updateNodePosition,
        updateNodeSize,
        setSelectedNodes,
    } = useBlueprintStore();

    const [localX, setLocalX] = useState('0');
    const [localY, setLocalY] = useState('0');
    const [localWidth, setLocalWidth] = useState('0');
    const [localHeight, setLocalHeight] = useState('0');

    // Get the first selected node
    const selectedNode = selectedNodeIds.length > 0
        ? nodes.find(n => n.id === selectedNodeIds[0])
        : null;

    // Update local state when selection changes
    useEffect(() => {
        if (selectedNode) {
            setLocalX(selectedNode.position.x.toString());
            setLocalY(selectedNode.position.y.toString());
            setLocalWidth(((selectedNode.style?.width as number) || 0).toString());
            setLocalHeight(((selectedNode.style?.height as number) || 0).toString());
        }
    }, [selectedNode]);

    const handlePositionUpdate = () => {
        if (selectedNode) {
            const x = parseFloat(localX) || 0;
            const y = parseFloat(localY) || 0;
            updateNodePosition(selectedNode.id, x, y);
        }
    };

    const handleSizeUpdate = () => {
        if (selectedNode) {
            const width = parseFloat(localWidth) || 100;
            const height = parseFloat(localHeight) || 100;
            updateNodeSize(selectedNode.id, width, height);
        }
    };

    const handleClose = () => {
        setSelectedNodes([]);
    };

    if (!selectedNode) return null;

    return (
        <div className="w-64 border-l border-border bg-background/50 backdrop-blur-sm p-4 flex flex-col gap-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Properties
                </h3>
                <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <div className="space-y-4">
                {/* Node Info */}
                <div>
                    <Label className="text-xs text-muted-foreground">Node ID</Label>
                    <p className="text-xs font-mono truncate">{selectedNode.id}</p>
                </div>

                <div>
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <p className="text-sm capitalize">{selectedNode.type || 'default'}</p>
                </div>

                {/* Position */}
                <div className="space-y-2">
                    <Label className="text-sm font-semibold">Position</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-xs">X (px)</Label>
                            <Input
                                type="number"
                                value={localX}
                                onChange={(e) => setLocalX(e.target.value)}
                                onBlur={handlePositionUpdate}
                                onKeyDown={(e) => e.key === 'Enter' && handlePositionUpdate()}
                                className="h-8 text-xs"
                            />
                        </div>
                        <div>
                            <Label className="text-xs">Y (px)</Label>
                            <Input
                                type="number"
                                value={localY}
                                onChange={(e) => setLocalY(e.target.value)}
                                onBlur={handlePositionUpdate}
                                onKeyDown={(e) => e.key === 'Enter' && handlePositionUpdate()}
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>
                </div>

                {/* Size */}
                {(selectedNode.type === 'room' || selectedNode.type === 'shape') && (
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Size</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs">Width (px)</Label>
                                <Input
                                    type="number"
                                    value={localWidth}
                                    onChange={(e) => setLocalWidth(e.target.value)}
                                    onBlur={handleSizeUpdate}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSizeUpdate()}
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Height (px)</Label>
                                <Input
                                    type="number"
                                    value={localHeight}
                                    onChange={(e) => setLocalHeight(e.target.value)}
                                    onBlur={handleSizeUpdate}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSizeUpdate()}
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Data */}
                {selectedNode.data && (
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Data</Label>
                        {(selectedNode.data.label as string) && (
                            <div>
                                <Label className="text-xs text-muted-foreground">Label</Label>
                                <div className="text-sm py-2">{selectedNode.data.label as string}</div>
                            </div>
                        )}

                        {(selectedNode.data.layerId as string) && (
                            <div>
                                <Label className="text-xs text-muted-foreground">Layer</Label>
                                <div className="text-sm py-2">{selectedNode.data.layerId as string}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
