import { DragEvent } from 'react';
import { Square, DoorOpen, Maximize2, Armchair, Circle, Triangle, Type, Bed, Monitor, Table, Bath } from 'lucide-react';
import { cn } from '@/utils/cn';

export const Sidebar = () => {
    const onDragStart = (event: DragEvent, nodeType: string, label: string, data?: any) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/reactflow-label', label);
        if (data) {
            event.dataTransfer.setData('application/reactflow-data', JSON.stringify(data));
        }
        event.dataTransfer.effectAllowed = 'move';
    };

    const DraggableItem = ({ type, label, icon: Icon, data }: { type: string, label: string, icon: any, data?: any }) => (
        <div
            className={cn(
                "flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 cursor-grab active:cursor-grabbing transition-colors shadow-sm",
                "hover-lift"
            )}
            onDragStart={(event) => onDragStart(event, type, label, data)}
            draggable
        >
            <div className="p-2 rounded-md bg-primary/10 text-primary">
                <Icon className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">{label}</span>
        </div>
    );

    return (
        <aside className="w-64 border-r border-border bg-background/50 backdrop-blur-sm p-4 flex flex-col gap-6 h-full overflow-y-auto">
            <div>
                <h3 className="font-semibold mb-1">Elements</h3>
                <p className="text-xs text-muted-foreground">Drag items to the canvas</p>
            </div>

            <div className="space-y-4">
                <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Structural</h4>
                    <div className="space-y-2">
                        <DraggableItem type="room" label="Room" icon={Square} />
                        <DraggableItem type="wall" label="Wall" icon={Maximize2} />
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Shapes</h4>
                    <div className="space-y-2">
                        <DraggableItem type="shape" label="Rectangle" icon={Square} data={{ shape: 'rectangle' }} />
                        <DraggableItem type="shape" label="Circle" icon={Circle} data={{ shape: 'circle' }} />
                        <DraggableItem type="shape" label="Triangle" icon={Triangle} data={{ shape: 'triangle' }} />
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Furniture</h4>
                    <div className="space-y-2">
                        <DraggableItem type="furniture" label="Armchair" icon={Armchair} data={{ furnitureType: 'armchair' }} />
                        <DraggableItem type="furniture" label="Bed" icon={Bed} data={{ furnitureType: 'bed' }} />
                        <DraggableItem type="furniture" label="Table" icon={Table} data={{ furnitureType: 'table' }} />
                        <DraggableItem type="furniture" label="Monitor" icon={Monitor} data={{ furnitureType: 'monitor' }} />
                        <DraggableItem type="furniture" label="Bath" icon={Bath} data={{ furnitureType: 'bath' }} />
                        <DraggableItem type="furniture" label="Door" icon={DoorOpen} data={{ furnitureType: 'door' }} />
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Annotations</h4>
                    <div className="space-y-2">
                        <DraggableItem type="annotation" label="Note" icon={Type} />
                    </div>
                </div>
            </div>
        </aside>
    );
};
