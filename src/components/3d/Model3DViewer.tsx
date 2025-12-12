import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PerspectiveCamera, ContactShadows, Grid } from '@react-three/drei';
import { Suspense, memo, useState } from 'react';
import { Upload, RotateCcw, Grid3x3, Sun } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Model3DViewerProps {
    modelUrl?: string;
    onUpload?: (file: File) => void;
}

/**
 * Model component - Loads and displays 3D model
 */
const Model = memo(({ url }: { url: string }) => {
    const { scene } = useGLTF(url);
    return <primitive object={scene} scale={1.5} />;
});

Model.displayName = 'Model';

/**
 * Loading placeholder
 */
const Loader = () => (
    <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#3b82f6" wireframe />
    </mesh>
);

/**
 * Model3DViewer - Professional 3D model viewer for uploaded models
 */
export const Model3DViewer = memo(({ modelUrl, onUpload }: Model3DViewerProps) => {
    const [showGrid, setShowGrid] = useState(true);
    const [lighting, setLighting] = useState<'bright' | 'normal' | 'dark'>('normal');
    const [autoRotate, setAutoRotate] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onUpload) {
            onUpload(file);
        }
    };

    const lightingIntensity = {
        bright: 1.5,
        normal: 1,
        dark: 0.5,
    };

    return (
        <div className="w-full h-full relative bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-lg overflow-hidden">
            {/* Canvas */}
            <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
                <PerspectiveCamera makeDefault position={[5, 5, 5]} />

                {/* Lighting */}
                <ambientLight intensity={0.3 * lightingIntensity[lighting]} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={lightingIntensity[lighting]}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                />
                <pointLight position={[-10, 10, -10]} intensity={0.3 * lightingIntensity[lighting]} />

                {/* Environment */}
                <Suspense fallback={null}>
                    <Environment preset="city" />
                </Suspense>

                {/* Grid */}
                {showGrid && (
                    <Grid
                        args={[20, 20]}
                        cellSize={0.5}
                        cellThickness={0.5}
                        cellColor="#94a3b8"
                        sectionSize={2}
                        sectionThickness={1}
                        sectionColor="#475569"
                        fadeDistance={25}
                        fadeStrength={1}
                        infiniteGrid
                    />
                )}

                {/* Contact Shadows */}
                <ContactShadows
                    position={[0, -0.5, 0]}
                    opacity={0.4}
                    scale={10}
                    blur={2}
                    far={4}
                />

                {/* 3D Model */}
                {modelUrl && (
                    <Suspense fallback={<Loader />}>
                        <Model url={modelUrl} />
                    </Suspense>
                )}

                {/* Placeholder if no model */}
                {!modelUrl && (
                    <mesh>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color="#3b82f6" />
                    </mesh>
                )}

                {/* Controls */}
                <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    autoRotate={autoRotate}
                    autoRotateSpeed={1}
                    minDistance={2}
                    maxDistance={20}
                />
            </Canvas>

            {/* Toolbar */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setShowGrid(!showGrid)}
                    title="Toggle Grid"
                    className="glass-dark"
                >
                    <Grid3x3 className="h-4 w-4" />
                </Button>

                <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setAutoRotate(!autoRotate)}
                    title="Auto Rotate"
                    className="glass-dark"
                >
                    <RotateCcw className={`h-4 w-4 ${autoRotate ? 'text-blue-400' : ''}`} />
                </Button>

                <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => {
                        const modes: Array<'bright' | 'normal' | 'dark'> = ['bright', 'normal', 'dark'];
                        const currentIndex = modes.indexOf(lighting);
                        setLighting(modes[(currentIndex + 1) % modes.length]);
                    }}
                    title="Toggle Lighting"
                    className="glass-dark"
                >
                    <Sun className="h-4 w-4" />
                </Button>
            </div>

            {/* Upload Button */}
            {!modelUrl && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <label className="glass-dark px-6 py-4 rounded-lg cursor-pointer pointer-events-auto hover:bg-accent/50 transition-colors">
                        <input
                            type="file"
                            accept=".glb,.gltf"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm font-medium">Upload 3D Model</span>
                            <span className="text-xs text-muted-foreground">.glb or .gltf</span>
                        </div>
                    </label>
                </div>
            )}

            {/* Controls Info */}
            <div className="absolute bottom-4 left-4 glass-dark px-3 py-2 rounded text-xs text-white">
                <p>🖱️ Left Click + Drag: Rotate</p>
                <p>🖱️ Right Click + Drag: Pan</p>
                <p>🔍 Scroll: Zoom</p>
            </div>
        </div>
    );
});

Model3DViewer.displayName = 'Model3DViewer';
