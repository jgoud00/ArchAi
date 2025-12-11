import { useBlueprintStore } from '@/store/blueprintStore';
import { Button } from '@/components/ui/Button';
import { Group, Ungroup } from 'lucide-react';

/**
 * Group manager for node grouping/ungrouping
 */
export const GroupManager = () => {
    const { nodes, selectedNodeIds, setNodes, setSelectedNodes } = useBlueprintStore();

    if (selectedNodeIds.length === 0) return null;

    const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));

    // Check if all selected nodes are in the same group
    const groupIds = selectedNodes
        .map(n => (n.data as any).groupId)
        .filter(Boolean);
    const allInSameGroup = groupIds.length > 0 && groupIds.every(id => id === groupIds[0]);

    const handleGroup = () => {
        if (selectedNodeIds.length < 2) return;

        const groupId = `group-${Date.now()}`;
        const updated = nodes.map(node => {
            if (selectedNodeIds.includes(node.id)) {
                return {
                    ...node,
                    data: { ...node.data, groupId }
                };
            }
            return node;
        });
        setNodes(updated);
    };

    const handleUngroup = () => {
        const updated = nodes.map(node => {
            if (selectedNodeIds.includes(node.id) && (node.data as any).groupId) {
                const { groupId, ...restData } = node.data as any;
                return { ...node, data: restData };
            }
            return node;
        });
        setNodes(updated);
    };

    // Auto-select group members when one is selected
    const handleSelectGroup = () => {
        if (selectedNodes.length !== 1) return;

        const groupId = (selectedNodes[0].data as any).groupId;
        if (!groupId) return;

        const groupNodeIds = nodes
            .filter(n => (n.data as any).groupId === groupId)
            .map(n => n.id);

        setSelectedNodes(groupNodeIds);
    };

    const hasGroups = selectedNodes.some(n => (n.data as any).groupId);

    return (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 glass-dark p-2 rounded-lg flex gap-2 z-50">
            {selectedNodeIds.length >= 2 && !allInSameGroup && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGroup}
                    className="h-8 px-3 gap-2"
                    title="Group Selection (Ctrl+G)"
                >
                    <Group className="h-4 w-4" />
                    <span className="text-xs">Group</span>
                </Button>
            )}

            {hasGroups && (
                <>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleUngroup}
                        className="h-8 px-3 gap-2"
                        title="Ungroup Selection (Ctrl+Shift+G)"
                    >
                        <Ungroup className="h-4 w-4" />
                        <span className="text-xs">Ungroup</span>
                    </Button>

                    {selectedNodes.length === 1 && (selectedNodes[0].data as any).groupId && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSelectGroup}
                            className="h-8 px-3 gap-2"
                            title="Select Group"
                        >
                            <Group className="h-4 w-4" />
                            <span className="text-xs">Select Group</span>
                        </Button>
                    )}
                </>
            )}
        </div>
    );
};
