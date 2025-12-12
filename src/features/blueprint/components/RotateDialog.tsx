import { useState } from 'react';
import { useBlueprintStore } from '@/features/blueprint/store/blueprintStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface RotateDialogProps {
    open: boolean;
    onClose: () => void;
}

/**
 * Rotate Dialog - Rotate selected nodes by custom angle
 */
export const RotateDialog = ({ open, onClose }: RotateDialogProps) => {
    const { selectedNodeIds, rotateNodes } = useBlueprintStore();
    const [angle, setAngle] = useState(45);

    const handleApply = () => {
        if (selectedNodeIds.length === 0) return;
        rotateNodes(selectedNodeIds, angle);
        onClose();
    };

    const handlePreset = (presetAngle: number) => {
        setAngle(presetAngle);
    };

    return (
        <Modal isOpen={open} onClose={onClose} title="Rotate Selection" className="sm:max-w-[400px]">

            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="angle">Angle (degrees)</Label>
                    <Input
                        id="angle"
                        type="number"
                        value={angle}
                        onChange={(e) => setAngle(parseFloat(e.target.value) || 0)}
                        placeholder="Enter angle..."
                    />
                    <p className="text-xs text-muted-foreground">
                        Positive values = clockwise, negative = counter-clockwise
                    </p>
                </div>

                <div className="space-y-2">
                    <Label>Quick Presets</Label>
                    <div className="grid grid-cols-4 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreset(45)}
                            className="text-xs"
                        >
                            45°
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreset(90)}
                            className="text-xs"
                        >
                            90°
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreset(180)}
                            className="text-xs"
                        >
                            180°
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreset(-90)}
                            className="text-xs"
                        >
                            -90°
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg border p-3 bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                        <strong>Current Angle:</strong> {angle}°
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Nodes will rotate around their collective center point
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handleApply} disabled={selectedNodeIds.length === 0}>
                    Apply Rotation
                </Button>
            </div>
        </Modal>
    );
};
