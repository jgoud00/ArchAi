import { useState } from 'react';
import { useBlueprintStore } from '@/features/blueprint/store/blueprintStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

interface ArrayDialogProps {
    open: boolean;
    onClose: () => void;
}

/**
 * Array Dialog - Create linear or circular array patterns
 */
export const ArrayDialog = ({ open, onClose }: ArrayDialogProps) => {
    const { selectedNodeIds, arrayLinear, arrayCircular } = useBlueprintStore();
    const [mode, setMode] = useState<'linear' | 'circular'>('linear');

    // Linear array state
    const [rows, setRows] = useState(3);
    const [columns, setColumns] = useState(3);
    const [spacingX, setSpacingX] = useState(150);
    const [spacingY, setSpacingY] = useState(150);

    // Circular array state
    const [count, setCount] = useState(8);
    const [centerX, setCenterX] = useState(400);
    const [centerY, setCenterY] = useState(300);
    const [radius, setRadius] = useState(200);
    const [angleRange, setAngleRange] = useState(360);

    const handleApply = () => {
        if (selectedNodeIds.length === 0) return;

        if (mode === 'linear') {
            arrayLinear(selectedNodeIds, rows, columns, spacingX, spacingY);
        } else {
            arrayCircular(selectedNodeIds, count, centerX, centerY, radius, angleRange);
        }

        onClose();
    };

    return (
        <Modal isOpen={open} onClose={onClose} title="Array Pattern" className="sm:max-w-[500px]">

            <Tabs value={mode} onValueChange={(v) => setMode(v as 'linear' | 'circular')}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="linear">Linear Array</TabsTrigger>
                    <TabsTrigger value="circular">Circular Array</TabsTrigger>
                </TabsList>

                <TabsContent value="linear" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="rows">Rows</Label>
                            <Input
                                id="rows"
                                type="number"
                                min={1}
                                max={20}
                                value={rows}
                                onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="columns">Columns</Label>
                            <Input
                                id="columns"
                                type="number"
                                min={1}
                                max={20}
                                value={columns}
                                onChange={(e) => setColumns(Math.max(1, parseInt(e.target.value) || 1))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="spacingX">X Spacing (px)</Label>
                            <Input
                                id="spacingX"
                                type="number"
                                value={spacingX}
                                onChange={(e) => setSpacingX(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="spacingY">Y Spacing (px)</Label>
                            <Input
                                id="spacingY"
                                type="number"
                                value={spacingY}
                                onChange={(e) => setSpacingY(parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Total items: {rows * columns}
                    </p>
                </TabsContent>

                <TabsContent value="circular" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="count">Count</Label>
                            <Input
                                id="count"
                                type="number"
                                min={2}
                                max={50}
                                value={count}
                                onChange={(e) => setCount(Math.max(2, parseInt(e.target.value) || 2))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="radius">Radius (px)</Label>
                            <Input
                                id="radius"
                                type="number"
                                min={50}
                                value={radius}
                                onChange={(e) => setRadius(Math.max(50, parseInt(e.target.value) || 50))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="centerX">Center X (px)</Label>
                            <Input
                                id="centerX"
                                type="number"
                                value={centerX}
                                onChange={(e) => setCenterX(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="centerY">Center Y (px)</Label>
                            <Input
                                id="centerY"
                                type="number"
                                value={centerY}
                                onChange={(e) => setCenterY(parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="angleRange">Angle Range (degrees)</Label>
                        <Input
                            id="angleRange"
                            type="number"
                            min={0}
                            max={360}
                            value={angleRange}
                            onChange={(e) => setAngleRange(Math.min(360, Math.max(0, parseInt(e.target.value) || 0)))}
                        />
                        <p className="text-xs text-muted-foreground">
                            360° = full circle, 180° = semicircle
                        </p>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handleApply} disabled={selectedNodeIds.length === 0}>
                    Apply Array
                </Button>
            </div>
        </Modal>
    );
};
