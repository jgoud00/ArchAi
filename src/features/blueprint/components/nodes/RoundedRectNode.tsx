import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

/**
 * Rounded Rectangle Node - Rectangle with customizable corner radius
 */
const RoundedRectNode = memo(({ data, selected }: NodeProps) => {
    const width = (data.width as number) || 120;
    const height = (data.height as number) || 80;
    const borderRadius = (data.borderRadius as number) || 15;
    const label = (data.label as string) || 'Rounded Rect';

    return (
        <div className="relative">
            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary" />
            <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-primary" />
            <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-primary" />

            <div
                className={`border-2 transition-all flex items-center justify-center ${selected
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/50'
                        : 'border-muted-foreground/50 bg-card/50'
                    }`}
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    borderRadius: `${borderRadius}px`,
                }}
            >
                <span className="text-xs font-medium text-foreground select-none px-2 text-center">
                    {label}
                </span>
            </div>
        </div>
    );
});

RoundedRectNode.displayName = 'RoundedRectNode';
export default RoundedRectNode;
