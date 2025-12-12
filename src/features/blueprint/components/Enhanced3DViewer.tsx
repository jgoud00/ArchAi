import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { Suspense, memo, useMemo } from 'react';
import { Node } from '@xyflow/react';
import * as THREE from 'three';

interface Enhanced3DViewerProps {
    nodes: Node[];
    showGrid?: boolean;
    cameraPosition?: [number, number, number];
    wallHeight?: number;
}

/**
 * Blueprint to 3D - Converts 2D blueprint nodes to 3D meshes
 */
const BlueprintMesh = memo(({ nodes, wallHeight = 3 }: { nodes: Node[]; wallHeight: number }) => {
    const meshes = useMemo(() => {
        return nodes.map((node) => {
            const width = (node.style?.width as number) || 100;
            const height = (node.style?.height as number) || 100;
            const x = node.position.x / 50; // Scale down for 3D
            const z = node.position.y / 50;
            const color = (node.style?.backgroundColor as string) || '#e2e8f0';

            return {
                id: node.id,
                position: [x, wallHeight / 2, z] as [number, number, number],
                args: [width / 50, wallHeight, height / 50] as [number, number, number],
                color,
                type: node.type,
            };
        });
    }, [nodes, wallHeight]);

    return (
        <group>
            {meshes.map((mesh) => (
                <mesh key={mesh.id} position={mesh.position} castShadow receiveShadow>
                    <boxGeometry args={mesh.args} />
                    <meshStandardMaterial
                        color={mesh.color}
                        transparent
                        opacity={0.8}
                        roughness={0.5}
                        metalness={0.1}
                    />
                    {/* Outline */}
                    <lineSegments>
                        <edgesGeometry args={[new THREE.BoxGeometry(...mesh.args)]} />
                        <lineBasicMaterial color="#334155" linewidth={2} />
                    </lineSegments>
                </mesh>
            ))}
        </group>
    );
});

BlueprintMesh.displayName = 'BlueprintMesh';

/**
 * Floor plane
 */
const Floor = memo(() => (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.8} metalness={0.2} />
    </mesh>
));

Floor.displayName = 'Floor';

/**
 * Loading component
 */
const Loader = () => (
    <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#3b82f6" wireframe />
    </mesh>
);

/**
 * Enhanced3DViewer - Complete 3D visualization of blueprints
 */
export const Enhanced3DViewer = memo(({
    nodes,
    showGrid = true,
    cameraPosition = [15, 15, 15],
    wallHeight = 3,
}: Enhanced3DViewerProps) => {
    return (
        <div className="w-full h-full bg-gradient-to-b from-sky-100 to-sky-50 dark:from-slate-900 dark:to-slate-800 rounded-lg overflow-hidden">
            <Canvas shadows>
                {/* Camera */}
                <PerspectiveCamera makeDefault position={cameraPosition} />

                {/* Lights */}
                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                />
                <pointLight position={[-10, 10, -10]} intensity={0.5} />

                {/* Environment */}
                <Suspense fallback={<Loader />}>
                    <Environment preset="city" />
                </Suspense>

                {/* Grid */}
                {showGrid && (
                    <Grid
                        args={[100, 100]}
                        cellSize={1}
                        cellThickness={0.5}
                        cellColor="#94a3b8"
                        sectionSize={5}
                        sectionThickness={1}
                        sectionColor="#475569"
                        fadeDistance={50}
                        fadeStrength={1}
                        infiniteGrid
                    />
                )}

                {/* Floor */}
                <Floor />

                {/* Contact Shadows */}
                <ContactShadows
                    position={[0, 0.01, 0]}
                    opacity={0.4}
                    scale={100}
                    blur={2}
                    far={10}
                />

                {/* Blueprint 3D Meshes */}
                <Suspense fallback={<Loader />}>
                    <BlueprintMesh nodes={nodes} wallHeight={wallHeight} />
                </Suspense>

                {/* Controls */}
                <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    minDistance={5}
                    maxDistance={50}
                    maxPolarAngle={Math.PI / 2 - 0.1}
                />
            </Canvas>

            {/* Controls Info */}
            <div className="absolute bottom-4 left-4 glass-dark px-3 py-2 rounded text-xs text-white">
                <p>🖱️ Left Click + Drag: Rotate</p>
                <p>🖱️ Right Click + Drag: Pan</p>
                <p>🔍 Scroll: Zoom</p>
            </div>
        </div>
    );
});

Enhanced3DViewer.displayName = 'Enhanced3DViewer';
