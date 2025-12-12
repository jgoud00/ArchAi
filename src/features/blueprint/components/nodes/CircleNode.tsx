import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

/**
 * Circle Node - Represents circular rooms or elements
 */
const CircleNode = memo(({ data, selected }: NodeProps) => {
    const radius = (data.radius as number) || 75;
    const label = (data.label as string) || 'Circle';

    return (
        <div
            className="relative flex items-center justify-center"
            style={{
                width: radius * 2,
                height: radius * 2,
            }}
        >
            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary" />
            <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-primary" />
            <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-primary" />

            <div
                className={`absolute inset-0 rounded-full border-2 transition-colors ${selected
                        ? 'border-primary bg-primary/10'
                        : 'border-muted-foreground bg-card/50'
                    }`}
                style={{
                    boxShadow: selected ? '0 0 0 2px hsl(var(--primary))' : 'none',
                }}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-foreground select-none">
                        {label}
                    </span>
                </div>
            </div>
        </div>
    );
});

CircleNode.displayName = 'CircleNode';
export default CircleNode;
