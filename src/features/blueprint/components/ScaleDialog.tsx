import { useState } from 'react';
import { useBlueprintStore } from '@/features/blueprint/store/blueprintStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';

interface ScaleDialogProps {
    open: boolean;
    onClose: () => void;
}

/**
 * Scale Dialog - Scale selected nodes by ratio
 */
export const ScaleDialog = ({ open, onClose }: ScaleDialogProps) => {
    const { selectedNodeIds, scaleNodes } = useBlueprintStore();
    const [uniformScale, setUniformScale] = useState(true);
    const [scaleRatio, setScaleRatio] = useState(1.5);
    const [scaleX, setScaleX] = useState(1.5);
    const [scaleY, setScaleY] = useState(1.5);

    const handleApply = () => {
        if (selectedNodeIds.length === 0) return;

        if (uniformScale) {
            scaleNodes(selectedNodeIds, scaleRatio, scaleRatio);
        } else {
            scaleNodes(selectedNodeIds, scaleX, scaleY);
        }

        onClose();
    };

    const handlePreset = (ratio: number) => {
        setScaleRatio(ratio);
        setScaleX(ratio);
        setScaleY(ratio);
    };

    return (
        <Modal isOpen={open} onClose={onClose} title="Scale Selection" className="sm:max-w-[400px]">

            <div className="space-y-4 py-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="uniform"
                        checked={uniformScale}
                        onCheckedChange={(checked: boolean) => setUniformScale(checked)}
                    />
                    <Label htmlFor="uniform" className="cursor-pointer">
                        Uniform Scale (Lock Aspect Ratio)
                    </Label>
                </div>

                {uniformScale ? (
                    <div className="space-y-2">
                        <Label htmlFor="scaleRatio">Scale Ratio</Label>
                        <Input
                            id="scaleRatio"
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="10"
                            value={scaleRatio}
                            onChange={(e) => setScaleRatio(parseFloat(e.target.value) || 1)}
                        />
                        <p className="text-xs text-muted-foreground">
                            1.0 = original size, 2.0 = double, 0.5 = half
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="scaleX">X Scale</Label>
                            <Input
                                id="scaleX"
                                type="number"
                                step="0.1"
                                min="0.1"
                                max="10"
                                value={scaleX}
                                onChange={(e) => setScaleX(parseFloat(e.target.value) || 1)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="scaleY">Y Scale</Label>
                            <Input
                                id="scaleY"
                                type="number"
                                step="0.1"
                                min="0.1"
                                max="10"
                                value={scaleY}
                                onChange={(e) => setScaleY(parseFloat(e.target.value) || 1)}
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Quick Presets</Label>
                    <div className="grid grid-cols-4 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreset(0.5)}
                            className="text-xs"
                        >
                            0.5x
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreset(1.5)}
                            className="text-xs"
                        >
                            1.5x
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreset(2.0)}
                            className="text-xs"
                        >
                            2.0x
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreset(3.0)}
                            className="text-xs"
                        >
                            3.0x
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg border p-3 bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                        {uniformScale
                            ? `Scale: ${scaleRatio}x (uniform)`
                            : `Scale: ${scaleX}x (H) × ${scaleY}x (V)`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Nodes will scale from their collective center point
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handleApply} disabled={selectedNodeIds.length === 0}>
                    Apply Scale
                </Button>
            </div>
        </Modal>
    );
};
