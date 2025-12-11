# CAD-like Blueprint System Implementation Plan

**Project**: ArchAi  
**Feature**: Professional CAD-like Blueprint Editor  
**Status**: Planning Phase  
**Priority**: High

---

## 🎯 Overview

Transform the current Blueprint Sketcher into a professional CAD system with precision placement, measurements, snap-to-grid, and drawing tools comparable to AutoCAD/SketchUp.

---

## 📊 Current State Analysis

### ✅ Existing Features:
- React Flow canvas integration
- Node types: Room, Shape, Furniture, Annotation
- Basic drag-and-drop from sidebar
- Layers system via Zustand
- Undo/Redo with Zundo
- Save/Load blueprints to Supabase
- Minimap and controls
- HTML2Canvas screenshot export

### ❌ Missing CAD Features:
- **Precision placement** - Cannot place objects at exact X, Y coordinates
- **Snap to grid** - No grid snapping functionality
- **Measurements** - No dimension lines or rulers
- **Precise drawing tools** - No line/rectangle/circle with dimension inputs
- **Zoom to fit** - No auto-fitting to canvas
- **CAD keyboard shortcuts** - Missing industry-standard shortcuts
- **Object properties panel** - Cannot edit X, Y, W, H precisely
- **Object snapping** - No magnetic snapping to other objects
- **Guides/Rulers** - No measurement guides or rulers

---

## 🚀 Proposed CAD Features

### 1. Precision Placement System
- **Coordinate Input Panel**: X, Y numeric inputs for exact positioning
- **Size Controls**: Width, Height inputs for shapes/rooms
- **Real-time Display**: Show coordinates on hover
- **Properties Panel**: Edit selected object dimensions

### 2. Grid & Snapping
- **Configurable Grid**: 1ft, 5ft, 1m, custom sizes
- **Snap Toggle**: Enable/disable with keyboard shortcut
- **Visual Grid Overlay**: Translucent grid lines
- **Magnetic Snapping**: Snap to nearby objects
- **Angular Snapping**: 0°, 45°, 90°, 180° rotation angles

### 3. Measurement Tools
- **Dimension Lines**: Auto-calculate distances between objects
- **Ruler Tool**: Click-and-drag measurement
- **Area Calculation**: Display room square footage/meters
- **Perimeter Display**: Show total perimeter
- **Scale System**: 1:100, 1:50, 1:20, custom scales

### 4. Drawing Tools
- **Line Tool**: Draw lines with exact length input
- **Rectangle Tool**: Create with W×H inputs
- **Circle Tool**: Draw with radius/diameter input
- **Wall Tool**: Specialized wall drawing with thickness
- **Door/Window**: Quick placement tools
- **Polyline**: Multi-point line drawing

### 5. Object Properties Panel
- **Position**: X, Y coordinates (editable)
- **Size**: W, H dimensions (editable)
- **Rotation**: Angle in degrees
- **Layer**: Assign to layer
- **Appearance**: Fill color, stroke, opacity
- **Lock/Unlock**: Prevent accidental edits
- **Z-Index**: Layer ordering

### 6. CAD Keyboard Shortcuts
```
L     - Line tool
R     - Rectangle
C     - Circle
W     - Wall tool
Esc   - Cancel/Deselect
Del   - Delete selected
Ctrl+Z - Undo
Ctrl+Y - Redo
Space+Drag - Pan canvas
Ctrl+A - Select all
G     - Toggle grid
S     - Toggle snap
Ctrl+D - Duplicate
Ctrl+G - Group
Ctrl+Shift+G - Ungroup
```

### 7. Professional Features
- **Multiple Selection**: Shift+Click for multi-select
- **Group/Ungroup**: Combine objects
- **Alignment Tools**: Left, center, right, top, middle, bottom
- **Distribution**: Evenly space objects
- **Copy/Paste**: With smart offset
- **Mirror/Flip**: Horizontal/vertical
- **Export**: DXF, SVG, PNG with scale

---

## 📅 Implementation Phases

### Phase 1: Core CAD Foundation (Week 1)

**Components to Create:**
- `PropertiesPanel.tsx` - Display/edit selected object properties
- `GridSystem.tsx` - Visual grid overlay with configurable size
- `CoordinateDisplay.tsx` - Show cursor coordinates

**Modifications:**
- `BlueprintSketcher.tsx` - Add keyboard event listeners
- `blueprintStore.ts` - Add grid settings, selected tool state

**Features:**
- ✅ Grid overlay with toggle
- ✅ Snap-to-grid functionality
- ✅ Properties panel (X, Y, W, H inputs)
- ✅ Basic keyboard shortcuts (G, Esc, Del)
- ✅ Coordinate tracking on hover

---

### Phase 2: Precision Tools (Week 2)

**Components to Create:**
- `MeasurementTool.tsx` - Dimension lines and ruler
- `DrawingToolbar.tsx` - Tool selection (line, rect, circle)
- `SnapIndicator.tsx` - Visual feedback for snapping

**Utilities:**
- `snapEngine.ts` - Snapping algorithms
- `measurementHelpers.ts` - Distance/area calculations

**Features:**
- ✅ Dimension lines between objects
- ✅ Ruler tool for measurements
- ✅ Drawing tools with dimension inputs
- ✅ Snap-to-objects (magnetic)
- ✅ Scale configuration

---

### Phase 3: Advanced Features (Week 3)

**Components to Create:**
- `AlignmentTools.tsx` - Align/distribute controls
- `GroupManager.tsx` - Group/ungroup functionality
- `TransformControls.tsx` - Rotation, mirror, flip

**Hooks:**
- `useCADShortcuts.ts` - Comprehensive keyboard mappings
- `useMultiSelect.ts` - Multi-selection logic

**Features:**
- ✅ Align selected objects
- ✅ Distribute evenly
- ✅ Group/Ungroup
- ✅ Mirror/Flip tools
- ✅ Full CAD keyboard shortcuts
- ✅ Copy/paste with offset

---

### Phase 4: Export & Polish (Week 4)

**Components to Create:**
- `ExportDialog.tsx` - Export options UI
- `LayerManager.tsx` - Enhanced layer controls
- `CADHelpPanel.tsx` - Keyboard shortcut reference

**Utilities:**
- `exportHelpers.ts` - SVG/DXF/PNG export
- `printLayout.ts` - Print preparation

**Features:**
- ✅ Export to SVG
- ✅ Export to PNG (with scale)
- ✅ Export to DXF (basic)
- ✅ Print layout
- ✅ Enhanced layer visibility/locking
- ✅ Help panel with shortcuts

---

## 🗂️ File Structure

```
src/
├── components/
│   └── blueprint/
│       ├── PropertiesPanel.tsx         [NEW]
│       ├── GridSystem.tsx               [NEW]
│       ├── CoordinateDisplay.tsx        [NEW]
│       ├── MeasurementTool.tsx          [NEW]
│       ├── DrawingToolbar.tsx           [NEW]
│       ├── SnapIndicator.tsx            [NEW]
│       ├── AlignmentTools.tsx           [NEW]
│       ├── GroupManager.tsx             [NEW]
│       ├── TransformControls.tsx        [NEW]
│       ├── ExportDialog.tsx             [NEW]
│       ├── LayerManager.tsx             [NEW]
│       ├── CADHelpPanel.tsx             [NEW]
│       ├── Sidebar.tsx                  [MODIFY]
│       ├── LayersPanel.tsx              [ENHANCE]
│       └── nodes/
│           ├── RoomNode.tsx             [ENHANCE]
│           ├── ShapeNode.tsx            [ENHANCE]
│           ├── WallNode.tsx             [NEW]
│           ├── DoorNode.tsx             [NEW]
│           └── WindowNode.tsx           [NEW]
├── hooks/
│   ├── useCADShortcuts.ts               [NEW]
│   ├── useSnapToGrid.ts                 [NEW]
│   ├── useMeasurement.ts                [NEW]
│   └── useMultiSelect.ts                [NEW]
├── utils/
│   ├── cadHelpers.ts                    [NEW]
│   ├── snapEngine.ts                    [NEW]
│   ├── measurementHelpers.ts            [NEW]
│   ├── exportHelpers.ts                 [NEW]
│   └── printLayout.ts                   [NEW]
├── store/
│   └── blueprintStore.ts                [ENHANCE]
└── pages/
    └── projects/
        └── BlueprintSketcher.tsx        [MAJOR ENHANCE]
```

---

## 🔧 Technical Requirements

### New Dependencies:
```json
{
  "@dnd-kit/core": "^6.1.0",           // Enhanced drag-drop
  "svg-to-dxf": "^1.0.0",              // DXF export
  "react-ruler": "^1.0.0"              // Ruler component
}
```

### Zustand Store Extensions:
```typescript
interface BlueprintState {
  // Existing...
  nodes: Node[]
  edges: Edge[]
  layers: Layer[]
  
  // New CAD state
  gridSize: number                      // in pixels (default: 20)
  snapEnabled: boolean                  // snap-to-grid toggle
  objectSnapEnabled: boolean            // snap-to-objects toggle
  selectedTool: CADTool                 // current drawing tool
  scale: string                         // e.g., '1:100'
  measurements: Measurement[]           // dimension lines
  selectedNodes: string[]               // multi-selection
  gridVisible: boolean                  // show/hide grid
  
  // New actions
  setGridSize: (size: number) => void
  toggleSnap: () => void
  setSelectedTool: (tool: CADTool) => void
  addMeasurement: (m: Measurement) => void
  // ...
}

type CADTool = 'select' | 'line' | 'rectangle' | 'circle' | 'wall' | 'door' | 'window' | 'measure'
```

---

## 👤 User Experience Flows

### Flow 1: Precision Placement
```
1. User selects a room node
2. Properties panel appears on right side
3. User enters X: 100, Y: 200 in input fields
4. Room snaps to exact (100, 200) position
5. Dimension lines show distance from origin
6. User enters W: 300, H: 200
7. Room resizes to exact dimensions
```

### Flow 2: Grid Drawing
```
1. User clicks grid toggle button (or presses G)
2. Grid overlay appears (e.g., 5ft spacing)
3. User drags new room from sidebar
4. As user drags, room snaps to grid intersections
5. Room size auto-rounds to grid multiples
6. Visual snap indicator shows snap point
```

### Flow 3: Measurement
```
1. User clicks Measure tool in toolbar
2. Cursor changes to crosshair
3. User clicks first point (e.g., wall start)
4. User clicks second point (wall end)
5. Dimension line appears with distance label
6. Line can be repositioned/deleted
7. Measurement persists in blueprint
```

### Flow 4: Drawing Wall
```
1. User presses W key or clicks Wall tool
2. User clicks start point
3. Toolbar shows: "Length: [input] ft, Thickness: [input] in"
4. User enters length: 15 ft
5. Wall extends to exact length
6. User clicks to place, Esc to cancel
```

---

## ✅ Success Criteria

- [ ] Objects can be placed at exact X, Y coordinates
- [ ] Grid snapping works smoothly at various grid sizes
- [ ] Measurements display accurate distances in ft/m
- [ ] All CAD keyboard shortcuts are functional
- [ ] Properties panel allows precise editing
- [ ] Drawing tools accept dimension inputs
- [ ] Export to SVG/PNG maintains scale
- [ ] Multi-select, align, and distribute work correctly
- [ ] Undo/Redo supports all CAD operations
- [ ] Professional CAD-like user experience
- [ ] Complete documentation and help panel

---

## 🚢 Deployment Strategy

1. **Phase 1 Implementation** (1 week)
   - Develop core foundation
   - User acceptance testing
   - Gather feedback

2. **Phase 2 Implementation** (1 week)
   - Add precision tools
   - Beta testing with power users
   - Iterate based on feedback

3. **Phase 3 Implementation** (1 week)
   - Advanced features
   - Performance optimization
   - Cross-browser testing

4. **Phase 4 Implementation** (1 week)
   - Export functionality
   - Final polish
   - Documentation

5. **Production Deployment**
   - Staged rollout to users
   - Monitor for issues
   - Collect user feedback

---

## 🎓 Training & Documentation

- Video tutorial: "Blueprint CAD Basics"
- Help panel with keyboard shortcuts (F1)
- Tooltips on all tools
- Sample blueprints/templates
- User guide in docs

---

## 🔮 Future Enhancements

- AI-assisted layout optimization
- 3D preview from 2D blueprint
- BIM integration
- Real-time collaboration
- Mobile/tablet support
- Advanced symbol library
- Custom templates
- Script automation (API)

---

**Next Steps**: Start Phase 1 implementation with PropertiesPanel and GridSystem components.
