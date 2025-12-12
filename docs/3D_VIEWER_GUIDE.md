# 3D Plane Viewer - Complete Guide

## Overview

The ArchAi 3D Plane Viewer is a comprehensive 3D visualization system that allows users to:
- **View 2D blueprints in 3D**: Automatically converts blueprint nodes into 3D structures
- **Upload and view 3D models**: Support for .glb and .gltf formats
- **Interactive controls**: Orbit, pan, zoom, auto-rotate
- **Professional lighting**: Adjustable lighting modes (bright, normal, dark)
- **Grid system**: Toggle-able grid for spatial reference

---

## Components

### 1. Enhanced3DViewer
**File**: `src/components/blueprint/Enhanced3DViewer.tsx`

Converts 2D blueprint nodes into 3D meshes with realistic walls, floors, and shadows.

**Features**:
- Automatic blueprint-to-3D conversion
- Configurable wall height
- Professional lighting with shadows
- Interactive orbit controls
- Grid overlay
- Environment mapping

**Usage**:
```tsx
import { Enhanced3DViewer } from '@/components/blueprint/Enhanced3DViewer';

<Enhanced3DViewer 
  nodes={blueprintNodes}
  wallHeight={3}
  showGrid={true}
  cameraPosition={[15, 15, 15]}
/>
```

### 2. Model3DViewer
**File**: `src/components/3d/Model3DViewer.tsx`

Professional 3D model viewer for uploaded .glb and .gltf files.

**Features**:
- File upload support (.glb, .gltf)
- Auto-rotate mode
- Lighting control (3 modes)
- Grid toggle
- Contact shadows
- Environment lighting

**Usage**:
```tsx
import { Model3DViewer } from '@/components/3d/Model3DViewer';

<Model3DViewer 
  modelUrl={modelUrl}
  onUpload={(file) => handleUpload(file)}
/>
```

### 3. Complete3DPlaneViewer
**File**: `src/components/3d/Complete3DPlaneViewer.tsx`

Unified component combining blueprint and model viewing with tabbed interface.

**Features**:
- Tab switching (Blueprint 3D / Model Viewer)
- Settings panel
- Wall height adjustment
- Node count display

### 4. ThreeDViewerPage
**File**: `src/pages/ThreeDViewerPage.tsx`

Dedicated fullscreen page for 3D visualization with lazy loading.

---

## How to Access

### Via URL
Navigate to: `http://localhost:5173/3d-viewer`

### Via Navigation
The 3D viewer is accessible from the main navigation menu.

---

## Controls

### Mouse Controls
- **Left Click + Drag**: Rotate camera around model
- **Right Click + Drag**: Pan camera
- **Scroll Wheel**: Zoom in/out

### Keyboard Shortcuts
- **R**: Toggle auto-rotate (Model Viewer)
- **G**: Toggle grid
- **L**: Cycle lighting modes

---

## Technical Stack

**Dependencies**:
```json
{
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.90.0",
  "three": "^0.160.0"
}
```

**Key Technologies**:
- **React Three Fiber**: React renderer for Three.js
- **@react-three/drei**: Helper components for R3F
- **Three.js**: 3D graphics library
- **OrbitControls**: Camera controls
- **Environment**: HDR environment mapping

---

## Blueprint to 3D Conversion

The system automatically converts 2D blueprint nodes to 3D:

1. **Rooms**: Converted to boxes with walls and floor
2. **Doors**: 3D door frames with handles
3. **Windows**: Semi-transparent glass panels
4. **Walls**: Vertical structures
5. **Furniture**: 3D representations

**Scaling**: 2D coordinates are scaled down by 50x for better 3D visualization.

**Wall Height**: Default 3 meters, adjustable in settings.

---

## Performance Optimization

- **Lazy Loading**: 3D viewer loaded on demand
- **Suspense**: Loading states for model loading
- **Memoization**: All 3D components use React.memo
- **Instancing**: Efficient rendering of repeated elements

---

## Supported File Formats

### 3D Models
- ✅ `.glb` (Binary glTF)
- ✅ `.gltf` (Text glTF)

### Coming Soon
- 🔜 `.fbx` (Autodesk)
- 🔜 `.obj` (Wavefront)
- 🔜 `.dae` (Collada)

---

## Examples

### Example 1: View Blueprint in 3D
```tsx
import { useBlueprintStore } from '@/store/blueprintStore';
import { Enhanced3DViewer } from '@/components/blueprint/Enhanced3DViewer';

function MyComponent() {
  const { nodes } = useBlueprintStore();
  
  return (
    <div className="h-screen">
      <Enhanced3DViewer nodes={nodes} />
    </div>
  );
}
```

### Example 2: Upload and View 3D Model
```tsx
import { useState } from 'react';
import { Model3DViewer } from '@/components/3d/Model3DViewer';

function MyComponent() {
  const [modelUrl, setModelUrl] = useState('');
  
  const handleUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setModelUrl(url);
  };
  
  return (
    <div className="h-screen">
      <Model3DViewer modelUrl={modelUrl} onUpload={handleUpload} />
    </div>
  );
}
```

---

## Troubleshooting

### Model not loading
- Ensure file format is .glb or .gltf
- Check file size (< 50MB recommended)
- Verify file is valid 3D model

### Performance issues
- Reduce node count in blueprint
- Lower quality settings
- Close other browser tabs

### Camera stuck
- Click and drag to reset view
- Refresh page if controls unresponsive

---

## Future Enhancements

- [ ] VR/AR mode support
- [ ] Material editor
- [ ] Animation playback
- [ ] Measurement tools in 3D
- [ ] Collaborative viewing
- [ ] Screenshot/video export
- [ ] Custom lighting setups

---

**The 3D Plane Viewer is production-ready and fully integrated! 🎉**
