import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

/**
 * Column Node - Structural columns
 */
const ColumnNode = memo(({ data, selected }: NodeProps) => {
    const columnType = (data.columnType as string) || 'square';
    const size = (data.size as number) || 40;
    const label = (data.label as string) || 'Column';

    return (
        <div className="relative">
            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary" />
            <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-primary" />
            <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-primary" />

            <div
                className={`border-2 transition-all ${selected
                        ? 'border-primary bg-primary/20'
                        : 'border-muted-foreground bg-muted/30'
                    }`}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: columnType === 'round' ? '50%' : '4px',
                }}
            >
                {/* Cross hatch pattern for column */}
                <svg width="100%" height="100%" className="absolute inset-0">
                    <defs>
                        <pattern
                            id="columnPattern"
                            x="0"
                            y="0"
                            width="8"
                            height="8"
                            patternUnits="userSpaceOnUse"
                        >
                            <line x1="0" y1="0" x2="8" y2="8" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground" />
                            <line x1="8" y1="0" x2="0" y2="8" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground" />
                        </pattern>
                    </defs>
                    <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="url(#columnPattern)"
                    />
                </svg>

                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-[10px] font-medium text-foreground bg-background px-2 py-0.5 rounded">
                        {label}
                    </span>
                </div>
            </div>
        </div>
    );
});

ColumnNode.displayName = 'ColumnNode';
export default ColumnNode;
