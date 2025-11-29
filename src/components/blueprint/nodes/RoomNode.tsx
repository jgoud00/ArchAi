import { memo } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { cn } from '@/utils/cn';

interface RoomNodeData {
    label?: string;
    width?: number;
    height?: number;
}

const RoomNode = ({ data, selected }: { data: RoomNodeData, selected: boolean }) => {
    return (
        <>
            <NodeResizer
                minWidth={100}
                minHeight={100}
                isVisible={selected}
                lineClassName="border-primary"
                handleClassName="h-3 w-3 bg-primary border-2 border-white rounded"
            />

            <div className={cn(
                "h-full w-full bg-background border-2 rounded-md flex items-center justify-center relative group transition-colors",
                selected ? "border-primary shadow-lg" : "border-foreground/50 hover:border-primary/50"
            )}>
                <div className="absolute inset-0 bg-primary/5 pointer-events-none" />

                <div className="text-center p-2">
                    <div className="font-bold text-sm">{data.label}</div>
                    <div className="text-xs text-muted-foreground">
                        {data.width ? `${Math.round(data.width)}px` : 'Auto'} x {data.height ? `${Math.round(data.height)}px` : 'Auto'}
                    </div>
                </div>

                <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-primary" />
                <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-primary" />
                <Handle type="source" position={Position.Top} className="w-2 h-2 !bg-primary" />
                <Handle type="target" position={Position.Bottom} className="w-2 h-2 !bg-primary" />
            </div>
        </>
    );
};

export default memo(RoomNode);
