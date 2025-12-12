import { useCallback, useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Node,
  ReactFlowProvider,
  ReactFlowInstance,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Save, Download, RotateCcw, Undo, Redo, Box } from 'lucide-react';
import { getProjectBlueprint, saveBlueprint, saveBlueprintVersion } from '@/features/projects/services/blueprints';
import { getProject } from '@/features/projects/services/projects';
import { Project } from '@/types';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/utils/logger';
import { Sidebar } from '@/features/blueprint/components/Sidebar';
import { LayersPanel } from '@/features/blueprint/components/LayersPanel';
import { GridSystem } from '@/features/blueprint/components/GridSystem';
import { CoordinateDisplay } from '@/features/blueprint/components/CoordinateDisplay';
import { PropertiesPanel } from '@/features/blueprint/components/PropertiesPanel';
import { SnapIndicator } from '@/features/blueprint/components/SnapIndicator';
import { MeasurementTool, MeasurementOverlay } from '@/features/blueprint/components/MeasurementTool';
import { AlignmentTools } from '@/features/blueprint/components/AlignmentTools';
import { TransformControls } from '@/features/blueprint/components/TransformControls';
import { DrawingTool } from '@/features/blueprint/components/DrawingTool';
import { GroupManager } from '@/features/blueprint/components/GroupManager';
import { ExportDialog } from '@/features/blueprint/components/ExportDialog';
import { CADHelpPanel } from '@/features/blueprint/components/CADHelpPanel';
import { Blueprint3DPreview } from '@/features/blueprint/components/Blueprint3DPreview';
import RoomNode from '@/features/blueprint/components/nodes/RoomNode';
import ShapeNode from '@/features/blueprint/components/nodes/ShapeNode';
import FurnitureNode from '@/features/blueprint/components/nodes/FurnitureNode';
import AnnotationNode from '@/features/blueprint/components/nodes/AnnotationNode';
import WallNode from '@/features/blueprint/components/nodes/WallNode';
import DoorNode from '@/features/blueprint/components/nodes/DoorNode';
import WindowNode from '@/features/blueprint/components/nodes/WindowNode';
import CircleNode from '@/features/blueprint/components/nodes/CircleNode';
import PolygonNode from '@/features/blueprint/components/nodes/PolygonNode';
import ElectricalNode from '@/features/blueprint/components/nodes/ElectricalNode';
import StairsNode from '@/features/blueprint/components/nodes/StairsNode';
import ColumnNode from '@/features/blueprint/components/nodes/ColumnNode';
import ArcNode from '@/features/blueprint/components/nodes/ArcNode';
import PolylineNode from '@/features/blueprint/components/nodes/PolylineNode';
import BezierNode from '@/features/blueprint/components/nodes/BezierNode';
import RoundedRectNode from '@/features/blueprint/components/nodes/RoundedRectNode';
import html2canvas from 'html2canvas';
import { useCADShortcuts } from '@/hooks/useCADShortcuts';
import { useSnapToGrid } from '@/hooks/useSnapToGrid';
import { useMultiSelect } from '@/hooks/useMultiSelect';
import { useEnhancedCADShortcuts } from '@/hooks/useEnhancedCADShortcuts';
import { AdvancedEditTools } from '@/features/blueprint/components/AdvancedEditTools';
import { DimensionTool } from '@/features/blueprint/components/DimensionTool';
import { ZoomControls } from '@/features/blueprint/components/ZoomControls';
import { CollapsibleMinimap } from '@/features/blueprint/components/CollapsibleMinimap';
import { EnhancedDrawingToolbar } from '@/features/blueprint/components/EnhancedDrawingToolbar';

import { useBlueprintStore } from '@/features/blueprint/store/blueprintStore';
import { useStore } from 'zustand';

// Node Types Registration
const nodeTypes = {
  room: RoomNode,
  shape: ShapeNode,
  furniture: FurnitureNode,
  annotation: AnnotationNode,
  wall: WallNode,
  door: DoorNode,
  window: WindowNode,
  circle: CircleNode,
  polygon: PolygonNode,
  electrical: ElectricalNode,
  stairs: StairsNode,
  column: ColumnNode,
  arc: ArcNode,
  polyline: PolylineNode,
  bezier: BezierNode,
  roundedRect: RoundedRectNode,
};

const initialNodes: Node[] = [
  { id: '1', type: 'room', position: { x: 250, y: 50 }, data: { label: 'Living Room', layerId: 'default' }, style: { width: 200, height: 150 } },
];

const BlueprintSketcherContent = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Zustand Store
  const {
    nodes,
    edges,
    layers,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setNodes,
    setEdges,
    selectedNodeIds,
    setSelectedNodes
  } = useBlueprintStore();

  const [project, setProject] = useState<Project | null>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [show3D, setShow3D] = useState(false);

  // CAD Hooks
  useCADShortcuts(() => setShowHelpPanel(true));
  useEnhancedCADShortcuts(); // Enhanced copy/paste/shortcuts
  const { snapPosition } = useSnapToGrid();
  const { handleNodeClick } = useMultiSelect();

  // Zundo History (Undo/Redo)
  // Subscribe to temporal state updates
  const pastStates = useStore(useBlueprintStore.temporal, (state) => state.pastStates);
  const futureStates = useStore(useBlueprintStore.temporal, (state) => state.futureStates);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [projectData, blueprintData] = await Promise.all([
        getProject(id),
        getProjectBlueprint(id),
      ]);
      setProject(projectData);

      if (blueprintData?.data) {
        const flow = JSON.parse(blueprintData.data);
        if (flow) {
          setNodes(flow.nodes || []);
          setEdges(flow.edges || []);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load blueprint';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showToast, setNodes, setEdges]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, loadData]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/reactflow-label');
      const dataString = event.dataTransfer.getData('application/reactflow-data');
      const extraData = dataString ? JSON.parse(dataString) : {};

      if (typeof type === 'undefined' || !type) {
        return;
      }

      let position = rfInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      }) || { x: 0, y: 0 };

      // Apply snap to grid
      position = snapPosition(position.x, position.y);

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `${label}`, ...extraData },
        style: type === 'room' ? { width: 150, height: 150 } : undefined,
      };

      addNode(newNode);
    },
    [rfInstance, addNode, snapPosition],
  );

  const handleSave = async () => {
    if (!id || !rfInstance) return;

    try {
      setSaving(true);

      const flow = rfInstance.toObject();
      const jsonData = JSON.stringify(flow);

      // Save version
      await saveBlueprintVersion(id, flow);

      const flowElement = document.querySelector('.react-flow__viewport') as HTMLElement;
      if (!flowElement) throw new Error('Canvas not found');

      const canvas = await html2canvas(flowElement as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        ignoreElements: (element) => element.classList.contains('react-flow__controls') || element.classList.contains('react-flow__minimap')
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('Failed to generate image', 'error');
          return;
        }
        await saveBlueprint(id, blob, jsonData);
        showToast('Blueprint saved successfully', 'success');
      }, 'image/png');

    } catch (error) {
      logger.error('Failed to save blueprint', error, { projectId: id })
      showToast('Failed to save blueprint', 'error')
    } finally {
      setSaving(false);
    }
  };

  // Filter nodes based on layer visibility
  const visibleNodes = nodes.filter(node => {
    const layerId = node.data.layerId as string || 'default';
    const layer = layers.find(l => l.id === layerId);
    return layer ? layer.visible : true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Toolbar */}
      <div className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 relative z-10">
        <div>
          <h1 className="text-xl font-bold">{project?.name} - CAD Editor</h1>
          <p className="text-xs text-muted-foreground">Professional Design Tool</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center bg-muted/30 rounded-lg p-1 mr-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => useBlueprintStore.temporal.getState().undo()}
              disabled={pastStates.length === 0}
              title="Undo"
              className="h-8 w-8"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => useBlueprintStore.temporal.getState().redo()}
              disabled={futureStates.length === 0}
              title="Redo"
              className="h-8 w-8"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={() => setNodes(initialNodes)}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            variant={show3D ? "default" : "outline"}
            size="sm"
            onClick={() => setShow3D(!show3D)}
            title="Toggle 3D Preview"
          >
            <Box className="h-4 w-4 mr-2" />
            {show3D ? '2D View' : '3D View'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="btn-primary-enhanced">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save & Version'}
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <EnhancedDrawingToolbar />

        <div className="flex-1 flex overflow-hidden">
          <Sidebar />

          <div className="flex-1 h-full bg-muted/10 relative" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={visibleNodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setRfInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              className="bg-background"
              nodesDraggable={true}
              nodesConnectable={true}
              onNodeClick={(event, node) => {
                handleNodeClick(node.id, event.shiftKey);
              }}
              onPaneClick={() => setSelectedNodes([])}
            >
              {/* Custom Controls - We use our own instead of ReactFlow's */}
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
              <GridSystem />
              <CoordinateDisplay />
              <SnapIndicator />
              <MeasurementOverlay />
              <MeasurementTool />
              <DrawingTool />
              <AlignmentTools />
              <TransformControls />
              <GroupManager />
              <AdvancedEditTools />
              <DimensionTool />

              <Panel position="top-right" className="glass-dark p-2 rounded-lg text-xs text-muted-foreground flex gap-4">
                <span>{nodes.length} nodes</span>
                <span>{edges.length} connections</span>
                <span>{layers.length} layers</span>
              </Panel>

              {/* Enhanced Zoom Controls */}
              <Panel position="bottom-left" className="!bg-transparent !shadow-none">
                <ZoomControls />
              </Panel>

              {/* Collapsible Minimap */}
              <CollapsibleMinimap nodes={nodes} />
            </ReactFlow>
          </div>

          {selectedNodeIds.length > 0 ? <PropertiesPanel /> : <LayersPanel />}
        </div>
      </div>

      {/* Dialogs */}
      {showExportDialog && <ExportDialog onClose={() => setShowExportDialog(false)} />}
      {showHelpPanel && <CADHelpPanel onClose={() => setShowHelpPanel(false)} />}

      {/* 3D Preview */}
      <Blueprint3DPreview nodes={nodes} show3D={show3D} onClose={() => setShow3D(false)} />
    </div>
  );
};

export const BlueprintSketcher = () => (
  <ReactFlowProvider>
    <BlueprintSketcherContent />
  </ReactFlowProvider>
);
