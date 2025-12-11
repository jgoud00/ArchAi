import { useCallback, useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  ReactFlowProvider,
  ReactFlowInstance,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Save, Download, RotateCcw, Undo, Redo } from 'lucide-react';
import { getProjectBlueprint, saveBlueprint, saveBlueprintVersion } from '@/services/blueprints';
import { getProject } from '@/services/projects';
import { Project } from '@/types';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/utils/logger';
import { Sidebar } from '@/components/blueprint/Sidebar';
import { LayersPanel } from '@/components/blueprint/LayersPanel';
import { GridSystem } from '@/components/blueprint/GridSystem';
import { CoordinateDisplay } from '@/components/blueprint/CoordinateDisplay';
import { PropertiesPanel } from '@/components/blueprint/PropertiesPanel';
import { DrawingToolbar } from '@/components/blueprint/DrawingToolbar';
import { SnapIndicator } from '@/components/blueprint/SnapIndicator';
import { MeasurementTool, MeasurementOverlay } from '@/components/blueprint/MeasurementTool';
import { AlignmentTools } from '@/components/blueprint/AlignmentTools';
import { TransformControls } from '@/components/blueprint/TransformControls';
import { DrawingTool } from '@/components/blueprint/DrawingTool';
import { GroupManager } from '@/components/blueprint/GroupManager';
import { ExportDialog } from '@/components/blueprint/ExportDialog';
import { CADHelpPanel } from '@/components/blueprint/CADHelpPanel';
import RoomNode from '@/components/blueprint/nodes/RoomNode';
import ShapeNode from '@/components/blueprint/nodes/ShapeNode';
import FurnitureNode from '@/components/blueprint/nodes/FurnitureNode';
import AnnotationNode from '@/components/blueprint/nodes/AnnotationNode';
import WallNode from '@/components/blueprint/nodes/WallNode';
import DoorNode from '@/components/blueprint/nodes/DoorNode';
import WindowNode from '@/components/blueprint/nodes/WindowNode';
import html2canvas from 'html2canvas';
import { useCADShortcuts } from '@/hooks/useCADShortcuts';
import { useSnapToGrid } from '@/hooks/useSnapToGrid';
import { useMultiSelect } from '@/hooks/useMultiSelect';

import { useBlueprintStore } from '@/store/blueprintStore';
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

  // CAD Hooks
  useCADShortcuts(() => setShowHelpPanel(true));
  const { snapPosition } = useSnapToGrid();
  const { toggleNodeSelection, handleKeyDown, handleKeyUp } = useMultiSelect();

  // Multi-select keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

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
        <DrawingToolbar />

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
                toggleNodeSelection(node.id, event.shiftKey);
              }}
              onPaneClick={() => setSelectedNodes([])}
            >
              <Controls />
              <MiniMap className="!bg-card !border-border" maskColor="rgba(0,0,0,0.1)" />
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

              <Panel position="top-right" className="glass-dark p-2 rounded-lg text-xs text-muted-foreground flex gap-4">
                <span>{nodes.length} nodes</span>
                <span>{edges.length} connections</span>
                <span>{layers.length} layers</span>
              </Panel>
            </ReactFlow>
          </div>

          {selectedNodeIds.length > 0 ? <PropertiesPanel /> : <LayersPanel />}
        </div>
      </div>

      {/* Dialogs */}
      {showExportDialog && <ExportDialog onClose={() => setShowExportDialog(false)} />}
      {showHelpPanel && <CADHelpPanel onClose={() => setShowHelpPanel(false)} />}
    </div>
  );
};

export const BlueprintSketcher = () => (
  <ReactFlowProvider>
    <BlueprintSketcherContent />
  </ReactFlowProvider>
);
