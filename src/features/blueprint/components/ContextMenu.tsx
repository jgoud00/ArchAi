import { memo, useState, useEffect } from 'react';
import { Copy, Scissors, Trash2, Lock, Unlock, Eye, EyeOff, ArrowUp, ArrowDown, Group, Ungroup, Edit } from 'lucide-react';
import { useBlueprintStore } from '@/features/blueprint/store/blueprintStore';
import { useClipboardStore } from '@/store/clipboardStore';

interface ContextMenuProps {
    x: number;
    y: number;
    nodeId?: string;
    onClose: () => void;
}

/**
 * ContextMenu - Right-click context menu for blueprint nodes
 */
export const ContextMenu = memo(({ x, y, nodeId, onClose }: ContextMenuProps) => {
    const { nodes, setNodes, selectedNodeIds, setSelectedNodes, groupNodes, ungroupNodes } = useBlueprintStore();
    const { copyNodes } = useClipboardStore();
    const [position, setPosition] = useState({ x, y });

    const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));
    const targetNode = nodeId ? nodes.find(n => n.id === nodeId) : null;
    const isGrouped = targetNode?.data.groupId;

    useEffect(() => {
        // Adjust position if menu would go off-screen
        const menuWidth = 200;
        const menuHeight = 400;
        const adjustedX = x + menuWidth > window.innerWidth ? x - menuWidth : x;
        const adjustedY = y + menuHeight > window.innerHeight ? y - menuHeight : y;
        setPosition({ x: adjustedX, y: adjustedY });
    }, [x, y]);

    useEffect(() => {
        const handleClick = () => onClose();
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('click', handleClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    const handleCopy = () => {
        if (selectedNodes.length > 0) {
            copyNodes(selectedNodes);
        }
        onClose();
    };

    const handleCut = () => {
        if (selectedNodes.length > 0) {
            copyNodes(selectedNodes);
            setNodes(nodes.filter(n => !selectedNodeIds.includes(n.id)));
        }
        onClose();
    };

    const handleDelete = () => {
        setNodes(nodes.filter(n => !selectedNodeIds.includes(n.id)));
        setSelectedNodes([]);
        onClose();
    };

    const handleDuplicate = () => {
        if (selectedNodes.length > 0) {
            const duplicated = selectedNodes.map(node => ({
                ...node,
                id: `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                position: {
                    x: node.position.x + 20,
                    y: node.position.y + 20,
                },
            }));
            setNodes([...nodes, ...duplicated]);
        }
        onClose();
    };

    const handleLock = () => {
        const updatedNodes = nodes.map(node =>
            selectedNodeIds.includes(node.id)
                ? { ...node, data: { ...node.data, locked: true } }
                : node
        );
        setNodes(updatedNodes);
        onClose();
    };

    const handleUnlock = () => {
        const updatedNodes = nodes.map(node =>
            selectedNodeIds.includes(node.id)
                ? { ...node, data: { ...node.data, locked: false } }
                : node
        );
        setNodes(updatedNodes);
        onClose();
    };

    const handleHide = () => {
        const updatedNodes = nodes.map(node =>
            selectedNodeIds.includes(node.id)
                ? { ...node, hidden: true }
                : node
        );
        setNodes(updatedNodes);
        onClose();
    };

    const handleShow = () => {
        const updatedNodes = nodes.map(node =>
            selectedNodeIds.includes(node.id)
                ? { ...node, hidden: false }
                : node
        );
        setNodes(updatedNodes);
        onClose();
    };

    const handleBringToFront = () => {
        const updatedNodes = nodes.map(node =>
            selectedNodeIds.includes(node.id)
                ? { ...node, zIndex: 1000 }
                : node
        );
        setNodes(updatedNodes);
        onClose();
    };

    const handleSendToBack = () => {
        const updatedNodes = nodes.map(node =>
            selectedNodeIds.includes(node.id)
                ? { ...node, zIndex: 0 }
                : node
        );
        setNodes(updatedNodes);
        onClose();
    };

    const handleGroup = () => {
        if (selectedNodeIds.length >= 2) {
            groupNodes(selectedNodeIds);
        }
        onClose();
    };

    const handleUngroup = () => {
        if (isGrouped && targetNode?.data?.groupId) {
            ungroupNodes(targetNode.data.groupId as string);
        }
        onClose();
    };

    const MenuItem = ({ icon: Icon, label, onClick, disabled = false, divider = false }: any) => (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) onClick();
                }}
                disabled={disabled}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed ${disabled ? '' : 'cursor-pointer'
                    }`}
            >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
            </button>
            {divider && <div className="h-px bg-border my-1" />}
        </>
    );

    return (
        <div
            className="fixed z-[9999] glass-dark rounded-lg shadow-xl border border-border min-w-[200px] py-1 overflow-hidden"
            style={{ left: position.x, top: position.y }}
            onClick={(e) => e.stopPropagation()}
        >
            <MenuItem icon={Copy} label="Copy" onClick={handleCopy} disabled={selectedNodes.length === 0} />
            <MenuItem icon={Scissors} label="Cut" onClick={handleCut} disabled={selectedNodes.length === 0} />
            <MenuItem icon={Copy} label="Duplicate" onClick={handleDuplicate} disabled={selectedNodes.length === 0} divider />

            <MenuItem icon={Lock} label="Lock" onClick={handleLock} disabled={selectedNodes.length === 0} />
            <MenuItem icon={Unlock} label="Unlock" onClick={handleUnlock} disabled={selectedNodes.length === 0} divider />

            <MenuItem icon={Eye} label="Hide" onClick={handleHide} disabled={selectedNodes.length === 0} />
            <MenuItem icon={EyeOff} label="Show" onClick={handleShow} disabled={selectedNodes.length === 0} divider />

            <MenuItem icon={ArrowUp} label="Bring to Front" onClick={handleBringToFront} disabled={selectedNodes.length === 0} />
            <MenuItem icon={ArrowDown} label="Send to Back" onClick={handleSendToBack} disabled={selectedNodes.length === 0} divider />

            <MenuItem icon={Group} label="Group" onClick={handleGroup} disabled={selectedNodeIds.length < 2} />
            <MenuItem icon={Ungroup} label="Ungroup" onClick={handleUngroup} disabled={!isGrouped} divider />

            <MenuItem icon={Edit} label="Properties" onClick={onClose} disabled={selectedNodes.length === 0} />
            <MenuItem icon={Trash2} label="Delete" onClick={handleDelete} disabled={selectedNodes.length === 0} />
        </div>
    );
});

ContextMenu.displayName = 'ContextMenu';
