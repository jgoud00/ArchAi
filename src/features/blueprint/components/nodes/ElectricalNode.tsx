import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Zap } from 'lucide-react';

/**
 * Electrical Outlet Node
 */
const ElectricalNode = memo(({ data, selected }: NodeProps) => {
    const type = (data.electricalType as string) || 'outlet';
    const label = (data.label as string) || type.charAt(0).toUpperCase() + type.slice(1);

    return (
        <div className="relative">
            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-yellow-500" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-yellow-500" />

            <div
                className={`p-3 rounded-lg border-2 transition-all ${selected
                        ? 'border-yellow-500 bg-yellow-500/20 shadow-lg shadow-yellow-500/50'
                        : 'border-yellow-600/50 bg-yellow-600/10'
                    }`}
            >
                <div className="flex flex-col items-center gap-1">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span className="text-[10px] font-medium text-foreground whitespace-nowrap">
                        {label}
                    </span>
                </div>
            </div>
        </div>
    );
});

ElectricalNode.displayName = 'ElectricalNode';
export default ElectricalNode;
