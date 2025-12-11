import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/utils/cn';

interface WallNodeData {
    label?: string;
    thickness?: number; // in inches
    length?: number; // calculated from node width
}

const WallNode = ({ data, selected }: { data: WallNodeData; selected: boolean }) => {
    const thickness = data.thickness || 6; // Default 6 inches

    return (
        <div className={cn(
            "relative group transition-colors",
            selected ? "ring-2 ring-primary ring-offset-2" : ""
        )}>
            {/* Wall representation - thick line */}
            <div
                className={cn(
                    "bg-foreground/80 rounded-sm",
                    selected && "bg-primary"
                )}
                style={{
                    width: '100%',
                    height: `${thickness * 2}px`, // Convert inches to rough pixel representation
                    minWidth: '50px',
                }}
            >
                {/* Label */}
                {data.label && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap bg-background/90 px-2 py-0.5 rounded border border-border">
                        {data.label}
                    </div>
                )}

                {/* Thickness indicator */}
                {selected && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                        {thickness}"
                    </div>
                )}
            </div>

            {/* Connection handles */}
            <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-primary" />
            <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-primary" />
        </div>
    );
};

export default memo(WallNode);
