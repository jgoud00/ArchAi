import { memo, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import { Node } from '@xyflow/react';
import { X } from 'lucide-react';

interface Blueprint3DPreviewProps {
    nodes: Node[];
    show3D: boolean;
    onClose?: () => void;
}

/**
 * 3D Room Component - Converts 2D room node to 3D box
 */
const Room3D = memo(({ node }: { node: Node }) => {
    const width = (node.style?.width as number) || 150;
    const height = (node.style?.height as number) || 150;
    const wallHeight = 3; // 3 meters high

    // Convert 2D position to 3D (scale down for better view)
    const x = node.position.x / 50;
    const z = node.position.y / 50;
    const w = width / 50;
    const d = height / 50;

    return (
        <group position={[x, wallHeight / 2, z]}>
            {/* Floor */}
            <mesh position={[0, -wallHeight / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[w, d]} />
                <meshStandardMaterial color="#e0e0e0" />
            </mesh>

            {/* Walls */}
            {/* Front wall */}
            <mesh position={[0, 0, d / 2]}>
                <boxGeometry args={[w, wallHeight, 0.1]} />
                <meshStandardMaterial color="#b0b0b0" transparent opacity={0.7} />
            </mesh>

            {/* Back wall */}
            <mesh position={[0, 0, -d / 2]}>
                <boxGeometry args={[w, wallHeight, 0.1]} />
                <meshStandardMaterial color="#b0b0b0" transparent opacity={0.7} />
            </mesh>

            {/* Left wall */}
            <mesh position={[-w / 2, 0, 0]}>
                <boxGeometry args={[0.1, wallHeight, d]} />
                <meshStandardMaterial color="#b0b0b0" transparent opacity={0.7} />
            </mesh>

            {/* Right wall */}
            <mesh position={[w / 2, 0, 0]}>
                <boxGeometry args={[0.1, wallHeight, d]} />
                <meshStandardMaterial color="#b0b0b0" transparent opacity={0.7} />
            </mesh>

            {/* Label */}
            <mesh position={[0, wallHeight + 0.5, 0]}>
                <sphereGeometry args={[0.2]} />
                <meshStandardMaterial color="#3b82f6" />
            </mesh>
        </group>
    );
});
Room3D.displayName = 'Room3D';

/**
 * 3D Wall Component
 */
const Wall3D = memo(({ node }: { node: Node }) => {
    const width = (node.style?.width as number) || 100;
    const wallHeight = 3;
    const wallThickness = 0.2;

    const x = node.position.x / 50;
    const z = node.position.y / 50;
    const w = width / 50;

    return (
        <mesh position={[x, wallHeight / 2, z]}>
            <boxGeometry args={[w, wallHeight, wallThickness]} />
            <meshStandardMaterial color="#8b4513" />
        </mesh>
    );
});
Wall3D.displayName = 'Wall3D';

/**
 * 3D Door Component
 */
const Door3D = memo(({ node }: { node: Node }) => {
    const doorWidth = 1;
    const doorHeight = 2.1;
    const doorThickness = 0.05;

    const x = node.position.x / 50;
    const z = node.position.y / 50;

    return (
        <group position={[x, doorHeight / 2, z]}>
            {/* Door frame */}
            <mesh>
                <boxGeometry args={[doorWidth, doorHeight, doorThickness]} />
                <meshStandardMaterial color="#6b4423" />
            </mesh>

            {/* Door handle */}
            <mesh position={[doorWidth / 3, 0, doorThickness / 2 + 0.05]}>
                <sphereGeometry args={[0.05]} />
                <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
    );
});
Door3D.displayName = 'Door3D';

/**
 * 3D Window Component
 */
const Window3D = memo(({ node }: { node: Node }) => {
    const windowWidth = 1.2;
    const windowHeight = 1.5;
    const windowThickness = 0.05;

    const x = node.position.x / 50;
    const z = node.position.y / 50;

    return (
        <mesh position={[x, 2, z]}>
            <boxGeometry args={[windowWidth, windowHeight, windowThickness]} />
            <meshStandardMaterial color="#87ceeb" transparent opacity={0.5} />
        </mesh>
    );
});
Window3D.displayName = 'Window3D';

/**
 * 3D Furniture Component
 */
const Furniture3D = memo(({ node }: { node: Node }) => {
    const x = node.position.x / 50;
    const z = node.position.y / 50;

    return (
        <group position={[x, 0.5, z]}>
            <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#8b7355" />
            </mesh>
        </group>
    );
});
Furniture3D.displayName = 'Furniture3D';

/**
 * 3D Scene Component
 */
const Scene3D = memo(({ nodes }: { nodes: Node[] }) => {
    return (
        <>
            {/* Ambient lighting */}
            <ambientLight intensity={0.5} />

            {/* Directional lights */}
            <directionalLight position={[10, 10, 10]} intensity={0.8} castShadow />
            <directionalLight position={[-10, 10, -10]} intensity={0.3} />

            {/* Point light for better depth */}
            <pointLight position={[0, 5, 0]} intensity={0.5} />

            {/* Ground grid */}
            <Grid
                args={[50, 50]}
                cellColor="#6f6f6f"
                sectionColor="#3f3f3f"
                fadeDistance={30}
                fadeStrength={1}
                position={[0, -0.01, 0]}
            />

            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#2a2a2a" />
            </mesh>

            {/* Render nodes based on type */}
            {nodes.map((node) => {
                switch (node.type) {
                    case 'room':
                        return <Room3D key={node.id} node={node} />;
                    case 'wall':
                        return <Wall3D key={node.id} node={node} />;
                    case 'door':
                        return <Door3D key={node.id} node={node} />;
                    case 'window':
                        return <Window3D key={node.id} node={node} />;
                    case 'furniture':
                        return <Furniture3D key={node.id} node={node} />;
                    default:
                        return null;
                }
            })}
        </>
    );
});
Scene3D.displayName = 'Scene3D';

/**
 * Blueprint 3D Preview Component
 * Converts 2D blueprint nodes into 3D visualization
 */
export const Blueprint3DPreview = memo(({ nodes, show3D, onClose }: Blueprint3DPreviewProps) => {
    // Handle Escape key to close 3D view
    useEffect(() => {
        if (!show3D || !onClose) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [show3D, onClose]);

    if (!show3D) return null;

    return (
        <div className="absolute inset-0 z-50 bg-background">
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[10, 8, 10]} fov={60} />
                <Suspense fallback={null}>
                    <Scene3D nodes={nodes} />
                </Suspense>
                <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    minDistance={5}
                    maxDistance={50}
                />
            </Canvas>

            {/* Close button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 glass-dark p-2 rounded-lg hover:bg-destructive/10 transition-colors group"
                    aria-label="Close 3D preview"
                >
                    <X className="h-5 w-5 group-hover:text-destructive" />
                </button>
            )}

            {/* 3D View Info */}
            <div className="absolute top-4 left-4 glass-dark p-4 rounded-lg max-w-xs">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <span>3D Preview Mode</span>
                </h3>
                <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Mouse drag to rotate camera</p>
                    <p>• Scroll to zoom in/out</p>
                    <p>• Right-click drag to pan</p>
                    <p className="text-primary pt-2">Press Escape or click X to exit</p>
                </div>
            </div>

            {/* Node count */}
            <div className="absolute bottom-4 right-4 glass-dark px-3 py-2 rounded-lg text-xs">
                <span className="text-muted-foreground">3D Objects:</span>
                <span className="ml-2 font-semibold text-primary">{nodes.length}</span>
            </div>
        </div>
    );
});
Blueprint3DPreview.displayName = 'Blueprint3DPreview';
