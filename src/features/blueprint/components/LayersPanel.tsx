import { Eye, EyeOff, Lock, Unlock, Trash2, Plus, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useBlueprintStore, Layer } from '@/features/blueprint/store/blueprintStore';
import { cn } from '@/utils/cn';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';

export const LayersPanel = () => {
    const {
        layers,
        activeLayerId,
        addLayer,
        toggleLayerVisibility,
        toggleLayerLock,
        setActiveLayer,
        deleteLayer
    } = useBlueprintStore();

    const [newLayerName, setNewLayerName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddLayer = () => {
        if (newLayerName.trim()) {
            addLayer(newLayerName.trim());
            setNewLayerName('');
            setIsAdding(false);
        }
    };

    return (
        <div className="w-64 border-l border-border bg-background/50 backdrop-blur-sm p-4 flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Layers
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setIsAdding(!isAdding)}>
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            {isAdding && (
                <div className="flex gap-2 mb-2">
                    <Input
                        value={newLayerName}
                        onChange={(e) => setNewLayerName(e.target.value)}
                        placeholder="Layer name"
                        className="h-8 text-xs"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleAddLayer()}
                    />
                    <Button size="sm" onClick={handleAddLayer} className="h-8">Add</Button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-1">
                {layers.map((layer: Layer) => (
                    <div
                        key={layer.id}
                        className={cn(
                            "flex items-center gap-2 p-2 rounded-md border transition-colors cursor-pointer group",
                            activeLayerId === layer.id
                                ? "bg-primary/10 border-primary/20"
                                : "bg-card border-transparent hover:bg-accent"
                        )}
                        onClick={() => setActiveLayer(layer.id)}
                    >
                        <div className="flex-1 truncate text-sm font-medium">
                            {layer.name}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                                className="p-1 hover:bg-background rounded"
                                title={layer.visible ? "Hide" : "Show"}
                            >
                                {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-muted-foreground" />}
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }}
                                className="p-1 hover:bg-background rounded"
                                title={layer.locked ? "Unlock" : "Lock"}
                            >
                                {layer.locked ? <Lock className="w-3 h-3 text-red-500" /> : <Unlock className="w-3 h-3 text-muted-foreground" />}
                            </button>

                            {layer.id !== 'default' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                                    className="p-1 hover:bg-destructive/10 hover:text-destructive rounded"
                                    title="Delete"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
