import { useState } from 'react';
import { useBlueprintStore } from '@/features/blueprint/store/blueprintStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Label } from '@/components/ui/Label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { AlertCircle } from 'lucide-react';

interface TrimExtendDialogProps {
    open: boolean;
    onClose: () => void;
}

/**
 * Trim/Extend Dialog - Basic trim and extend operations
 * Note: Phase 2 implementation is basic, advanced features in Phase 3
 */
export const TrimExtendDialog = ({ open, onClose }: TrimExtendDialogProps) => {
    const { selectedNodeIds, trimNodes, extendNodes } = useBlueprintStore();
    const [mode, setMode] = useState<'trim' | 'extend'>('trim');

    const handleApply = () => {
        if (selectedNodeIds.length < 2) return;

        if (mode === 'trim') {
            trimNodes(selectedNodeIds);
        } else {
            extendNodes(selectedNodeIds);
        }

        onClose();
    };

    return (
        <Modal isOpen={open} onClose={onClose} title="Trim / Extend" className="sm:max-w-[450px]">

            <Tabs value={mode} onValueChange={(v) => setMode(v as 'trim' | 'extend')}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="trim">Trim</TabsTrigger>
                    <TabsTrigger value="extend">Extend</TabsTrigger>
                </TabsList>

                <TabsContent value="trim" className="space-y-4 pt-4">
                    <div className="rounded-lg border p-4 bg-muted/50 space-y-2">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div className="space-y-1">
                                <Label className="text-sm font-medium">Trim Tool Instructions</Label>
                                <p className="text-sm text-muted-foreground">
                                    1. Select the nodes you want to trim
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    2. Click Apply to trim overlapping portions
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    3. Works best with rectangular nodes
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border p-3 bg-yellow-500/10 border-yellow-500/20">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                            <strong>Note:</strong> Advanced trim operations with precise line intersections will be available in Phase 3.
                        </p>
                    </div>

                    {selectedNodeIds.length < 2 && (
                        <div className="rounded-lg border p-3 bg-destructive/10 border-destructive/20">
                            <p className="text-sm text-destructive">
                                Please select at least 2 nodes to use the trim tool.
                            </p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="extend" className="space-y-4 pt-4">
                    <div className="rounded-lg border p-4 bg-muted/50 space-y-2">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div className="space-y-1">
                                <Label className="text-sm font-medium">Extend Tool Instructions</Label>
                                <p className="text-sm text-muted-foreground">
                                    1. Select the nodes you want to extend
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    2. Select a boundary/reference node
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    3. Click Apply to extend to boundary
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border p-3 bg-yellow-500/10 border-yellow-500/20">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                            <strong>Note:</strong> Advanced extend operations will be available in Phase 3 with support for complex shapes and lines.
                        </p>
                    </div>

                    {selectedNodeIds.length < 2 && (
                        <div className="rounded-lg border p-3 bg-destructive/10 border-destructive/20">
                            <p className="text-sm text-destructive">
                                Please select at least 2 nodes to use the extend tool.
                            </p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    onClick={handleApply}
                    disabled={selectedNodeIds.length < 2}
                >
                    Apply {mode === 'trim' ? 'Trim' : 'Extend'}
                </Button>
            </div>
        </Modal>
    );
};
