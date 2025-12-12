import { memo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Enhanced3DViewer } from '@/features/blueprint/components/Enhanced3DViewer';
import { Model3DViewer } from '@/components/3d/Model3DViewer';
import { useBlueprintStore } from '@/features/blueprint/store/blueprintStore';
import { Box, FileBox, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';

/**
 * Complete3DPlaneViewer - Unified 3D visualization component
 * - Blueprint 3D View: Converts 2D blueprints to 3D structures
 * - Model Viewer: Displays uploaded 3D models (.glb, .gltf)
 */
export const Complete3DPlaneViewer = memo(() => {
    const { nodes } = useBlueprintStore();
    const [activeTab, setActiveTab] = useState<'blueprint' | 'model'>('blueprint');
    const [modelUrl, setModelUrl] = useState<string>('');
    const [wallHeight, setWallHeight] = useState(3);
    const [showSettings, setShowSettings] = useState(false);

    const handleModelUpload = (file: File) => {
        const url = URL.createObjectURL(file);
        setModelUrl(url);
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-card">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Box className="h-5 w-5" />
                    3D Plane Viewer
                </h2>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSettings(!showSettings)}
                    title="Settings"
                >
                    <Settings className="h-4 w-4" />
                </Button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="p-4 border-b bg-muted/50">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="wallHeight">Wall Height (m):</Label>
                            <Input
                                id="wallHeight"
                                type="number"
                                value={wallHeight}
                                onChange={(e) => setWallHeight(Number(e.target.value))}
                                min={1}
                                max={10}
                                step={0.5}
                                className="w-20"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b">
                    <TabsTrigger value="blueprint" className="gap-2">
                        <Box className="h-4 w-4" />
                        Blueprint 3D
                    </TabsTrigger>
                    <TabsTrigger value="model" className="gap-2">
                        <FileBox className="h-4 w-4" />
                        Model Viewer
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="blueprint" className="flex-1 m-0 p-4">
                    <Enhanced3DViewer nodes={nodes} wallHeight={wallHeight} />
                </TabsContent>

                <TabsContent value="model" className="flex-1 m-0 p-4">
                    <Model3DViewer modelUrl={modelUrl} onUpload={handleModelUpload} />
                </TabsContent>
            </Tabs>

            {/* Info */}
            <div className="p-2 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
                <span>
                    {activeTab === 'blueprint'
                        ? `Visualizing ${nodes.length} blueprint nodes in 3D`
                        : modelUrl
                            ? '3D model loaded'
                            : 'No model uploaded'}
                </span>
                <span className="text-xs">Powered by React Three Fiber</span>
            </div>
        </div>
    );
});

Complete3DPlaneViewer.displayName = 'Complete3DPlaneViewer';
