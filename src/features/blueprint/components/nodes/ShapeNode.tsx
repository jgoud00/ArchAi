import { memo } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { cn } from '@/utils/cn';

interface ShapeNodeData {
    shape?: string;
    color?: string;
    label?: string;
}

const ShapeNode = ({ data, selected }: { data: ShapeNodeData, selected: boolean }) => {
    const shape = data.shape || 'rectangle';
    const color = data.color || '#3b82f6'; // Default primary blue

    return (
        <>
            <NodeResizer
                minWidth={50}
                minHeight={50}
                isVisible={selected}
                lineClassName="border-primary"
                handleClassName="h-3 w-3 bg-primary border-2 border-white rounded"
            />

            <div className={cn(
                "h-full w-full flex items-center justify-center relative group",
                selected && "ring-2 ring-primary ring-offset-2"
            )}>
                {shape === 'rectangle' && (
                    <div className="w-full h-full border-2 border-current rounded-md" style={{ borderColor: color, backgroundColor: `${color}20` }} />
                )}

                {shape === 'circle' && (
                    <div className="w-full h-full border-2 border-current rounded-full" style={{ borderColor: color, backgroundColor: `${color}20` }} />
                )}

                {shape === 'triangle' && (
                    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                        <path d="M50 5 L95 95 L5 95 Z" fill={`${color}20`} stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    </svg>
                )}

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {data.label && <span className="text-xs font-medium bg-background/80 px-1 rounded">{data.label}</span>}
                </div>

                <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <Handle type="source" position={Position.Top} className="w-2 h-2 !bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <Handle type="target" position={Position.Bottom} className="w-2 h-2 !bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </>
    );
};

export default memo(ShapeNode);
