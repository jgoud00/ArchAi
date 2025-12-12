import { memo } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { cn } from '@/utils/cn';
import { Armchair, Bed, DoorOpen, Bath, Monitor, Table } from 'lucide-react';

const icons: Record<string, React.ElementType> = {
    armchair: Armchair,
    bed: Bed,
    door: DoorOpen,
    bath: Bath,
    monitor: Monitor,
    table: Table,
};

interface FurnitureNodeData {
    furnitureType?: string;
}

const FurnitureNode = ({ data, selected }: { data: FurnitureNodeData, selected: boolean }) => {
    const type = data.furnitureType || 'armchair';
    const Icon = icons[type] || Armchair;

    return (
        <>
            <NodeResizer
                minWidth={30}
                minHeight={30}
                isVisible={selected}
                lineClassName="border-primary"
                handleClassName="h-3 w-3 bg-primary border-2 border-white rounded"
            />

            <div className={cn(
                "h-full w-full flex items-center justify-center relative group bg-background border border-border rounded-md shadow-sm",
                selected && "ring-2 ring-primary ring-offset-2 border-primary"
            )}>
                <Icon className="w-2/3 h-2/3 text-foreground" strokeWidth={1.5} />

                <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <Handle type="source" position={Position.Top} className="w-2 h-2 !bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <Handle type="target" position={Position.Bottom} className="w-2 h-2 !bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </>
    );
};

export default memo(FurnitureNode);
