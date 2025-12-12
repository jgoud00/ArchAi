import { memo, useState } from 'react';
import { Copy, Scissors, Grid3x3, FlipHorizontal, FlipVertical, Trash2, Rotate3d, Maximize2, ScissorsLineDashed } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useBlueprintStore } from '@/features/blueprint/store/blueprintStore';
import { useClipboardStore } from '@/store/clipboardStore';
import { Panel } from '@xyflow/react';
import { ArrayDialog } from './ArrayDialog';
import { RotateDialog } from './RotateDialog';
import { ScaleDialog } from './ScaleDialog';
import { TrimExtendDialog } from './TrimExtendDialog';

/**
 * Advanced Edit Toolbar - Copy, Paste, Array, Mirror, Rotate, Scale, Trim/Extend, Delete
 */
export const AdvancedEditTools = memo(() => {
    const { nodes, selectedNodeIds, addNode, setNodes, updateNodePosition } = useBlueprintStore();
    const { copyNodes, pasteNodes, copiedNodes } = useClipboardStore();

    // Dialog state
    const [arrayDialogOpen, setArrayDialogOpen] = useState(false);
    const [rotateDialogOpen, setRotateDialogOpen] = useState(false);
    const [scaleDialogOpen, setScaleDialogOpen] = useState(false);
    const [trimExtendDialogOpen, setTrimExtendDialogOpen] = useState(false);

    const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));
    const hasSelection = selectedNodes.length > 0;
    const hasClipboard = copiedNodes.length > 0;

    const handleCopy = () => {
        if (!hasSelection) return;
        copyNodes(selectedNodes);
    };

    const handleCut = () => {
        if (!hasSelection) return;
        copyNodes(selectedNodes);
        setNodes(nodes.filter(n => !selectedNodeIds.includes(n.id)));
    };

    const handlePaste = () => {
        const pastedNodes = pasteNodes();
        pastedNodes.forEach(node => addNode(node));
    };

    const handleDuplicate = () => {
        if (!hasSelection) return;
        const duplicated = selectedNodes.map(node => ({
            ...node,
            id: `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            position: {
                x: node.position.x + 20,
                y: node.position.y + 20,
            },
        }));
        duplicated.forEach(node => addNode(node));
    };

    const handleMirrorHorizontal = () => {
        if (!hasSelection) return;

        // Calculate center point
        const centerX = selectedNodes.reduce((sum, n) => sum + n.position.x, 0) / selectedNodes.length;

        selectedNodes.forEach(node => {
            const offsetX = node.position.x - centerX;
            const newX = centerX - offsetX;
            updateNodePosition(node.id, newX, node.position.y);
        });
    };

    const handleMirrorVertical = () => {
        if (!hasSelection) return;

        // Calculate center point
        const centerY = selectedNodes.reduce((sum, n) => sum + n.position.y, 0) / selectedNodes.length;

        selectedNodes.forEach(node => {
            const offsetY = node.position.y - centerY;
            const newY = centerY - offsetY;
            updateNodePosition(node.id, node.position.x, newY);
        });
    };

    const handleDelete = () => {
        if (!hasSelection) return;
        setNodes(nodes.filter(n => !selectedNodeIds.includes(n.id)));
    };

    return (
        <>
            <Panel position="bottom-center" className="glass-dark p-2 rounded-lg flex gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!hasSelection}
                    title="Copy (Ctrl+C)"
                >
                    <Copy className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCut}
                    disabled={!hasSelection}
                    title="Cut (Ctrl+X)"
                >
                    <Scissors className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePaste}
                    disabled={!hasClipboard}
                    title="Paste (Ctrl+V)"
                >
                    <Copy className="h-4 w-4 rotate-180" />
                </Button>

                <div className="w-px bg-border" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDuplicate}
                    disabled={!hasSelection}
                    title="Duplicate (Ctrl+D)"
                >
                    <Copy className="h-4 w-4" />
                    <Copy className="h-4 w-4 -ml-3 -mt-2" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setArrayDialogOpen(true)}
                    disabled={!hasSelection}
                    title="Array Pattern (A)"
                >
                    <Grid3x3 className="h-4 w-4" />
                </Button>

                <div className="w-px bg-border" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMirrorHorizontal}
                    disabled={!hasSelection}
                    title="Mirror Horizontal"
                >
                    <FlipHorizontal className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMirrorVertical}
                    disabled={!hasSelection}
                    title="Mirror Vertical"
                >
                    <FlipVertical className="h-4 w-4" />
                </Button>

                <div className="w-px bg-border" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRotateDialogOpen(true)}
                    disabled={!hasSelection}
                    title="Rotate (R)"
                >
                    <Rotate3d className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setScaleDialogOpen(true)}
                    disabled={!hasSelection}
                    title="Scale (S)"
                >
                    <Maximize2 className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTrimExtendDialogOpen(true)}
                    disabled={!hasSelection}
                    title="Trim/Extend (T)"
                >
                    <ScissorsLineDashed className="h-4 w-4" />
                </Button>

                <div className="w-px bg-border" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={!hasSelection}
                    title="Delete (Del)"
                    className="text-destructive hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </Panel>

            {/* Dialogs */}
            <ArrayDialog open={arrayDialogOpen} onClose={() => setArrayDialogOpen(false)} />
            <RotateDialog open={rotateDialogOpen} onClose={() => setRotateDialogOpen(false)} />
            <ScaleDialog open={scaleDialogOpen} onClose={() => setScaleDialogOpen(false)} />
            <TrimExtendDialog open={trimExtendDialogOpen} onClose={() => setTrimExtendDialogOpen(false)} />
        </>
    );
});

AdvancedEditTools.displayName = 'AdvancedEditTools';
