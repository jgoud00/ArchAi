import { memo, useState } from 'react';
import { NodeResizer } from '@xyflow/react';
import { cn } from '@/utils/cn';

const AnnotationNode = ({ data, selected }: { data: any, selected: boolean }) => {
    const [text, setText] = useState(data.text || 'Add note...');

    return (
        <>
            <NodeResizer
                minWidth={100}
                minHeight={50}
                isVisible={selected}
                lineClassName="border-yellow-500"
                handleClassName="h-3 w-3 bg-yellow-500 border-2 border-white rounded"
            />

            <div className={cn(
                "h-full w-full relative group bg-yellow-100 border border-yellow-300 rounded shadow-sm overflow-hidden flex flex-col",
                selected && "ring-2 ring-yellow-500 ring-offset-2"
            )}>
                <div className="h-4 bg-yellow-200 w-full cursor-move shrink-0" />
                <textarea
                    className="w-full h-full bg-transparent resize-none p-2 text-sm text-yellow-900 focus:outline-none font-handwriting"
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        data.text = e.target.value; // Mutate data directly for simplicity in this context
                    }}
                    placeholder="Type your note here..."
                />
            </div>
        </>
    );
};

export default memo(AnnotationNode);
