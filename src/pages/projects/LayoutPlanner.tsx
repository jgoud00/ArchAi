import { useState, useCallback, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Node,
    Edge,
    ReactFlowProvider,
    Panel,
    useReactFlow,
    BackgroundVariant,
    OnNodesChange,
    OnEdgesChange,
    applyNodeChanges,
    applyEdgeChanges,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from '@/components/ui/Button'
import { Save, Undo, Redo, ArrowLeft, MousePointer2, PenTool } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/services/supabase'
import RoomNode from '@/components/blueprint/nodes/RoomNode'
import ShapeNode from '@/components/blueprint/nodes/ShapeNode'
import FurnitureNode from '@/components/blueprint/nodes/FurnitureNode'
import AnnotationNode from '@/components/blueprint/nodes/AnnotationNode'
import { WallEdge } from '@/components/blueprint/edges/WallEdge'
import { useTemporalStore } from '@/store/temporalStore'
import { logger } from '@/utils/logger'
import html2canvas from 'html2canvas'


const nodeTypes = {
    room: RoomNode,
    shape: ShapeNode,
    furniture: FurnitureNode,
    annotation: AnnotationNode,
}

const edgeTypes = {
    wall: WallEdge,
}

const GRID_SIZE = 20

const snapToGrid = (x: number, y: number) => {
    return [
        Math.round(x / GRID_SIZE) * GRID_SIZE,
        Math.round(y / GRID_SIZE) * GRID_SIZE,
    ]
}

const LayoutPlannerContent = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { showToast } = useToast()
    const [nodes, setNodes] = useNodesState<Node>([])
    const [edges, setEdges] = useEdgesState<Edge>([])
    const [mode, setMode] = useState<'select' | 'draw'>('select')

    const { past, future, push, undo, redo, clear } = useTemporalStore((state) => state)
    const reactFlowWrapper = useRef<HTMLDivElement>(null)
    const { screenToFlowPosition } = useReactFlow()

    // Load initial data
    useEffect(() => {
        const loadLayout = async () => {
            if (!id) return
            const { data } = await supabase
                .from('blueprints')
                .select('json_url')
                .eq('project_id', id)
                .single()

            if (data?.json_url) {
                try {
                    const response = await fetch(data.json_url)
                    const flow = await response.json()

                    if (flow) {
                        setNodes(flow.nodes || [])
                        setEdges(flow.edges || [])
                        clear() // Clear history after loading
                    }
                } catch (e) {
                    console.error("Error loading layout", e)
                }
            }
        }
        loadLayout()
    }, [id, setNodes, setEdges, clear])

    // History helpers
    const saveToHistory = useCallback(() => {
        push({ nodes, edges })
    }, [nodes, edges, push])

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => {
            // Save history on drag start or selection change? 
            // Usually we want to save before a change happens.
            // But useNodesState handles changes internally.
            // For simplicity, let's save on drag start via onNodeDragStart prop
            setNodes((nds) => applyNodeChanges(changes, nds))
        },
        [setNodes]
    )

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => {
            setEdges((eds) => applyEdgeChanges(changes, eds))
        },
        [setEdges]
    )

    const onConnect = useCallback(
        (params: Connection) => {
            saveToHistory()
            setEdges((eds) => addEdge({ ...params, type: 'wall' }, eds))
        },
        [setEdges, saveToHistory],
    )

    const onNodeDragStart = useCallback(() => {
        saveToHistory()
    }, [saveToHistory])

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault()

            const type = event.dataTransfer.getData('application/reactflow')
            if (typeof type === 'undefined' || !type) {
                return
            }

            saveToHistory()

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            })

            const [snappedX, snappedY] = snapToGrid(position.x, position.y)

            const newNode: Node = {
                id: `${type}-${Date.now()}`,
                type,
                position: { x: snappedX, y: snappedY },
                data: { label: `${type} node` },
            }

            setNodes((nds) => nds.concat(newNode))
        },
        [screenToFlowPosition, setNodes, saveToHistory],
    )

    const handleUndo = () => {
        const previousState = undo({ nodes, edges })
        if (previousState) {
            setNodes(previousState.nodes)
            setEdges(previousState.edges)
        }
    }

    const handleRedo = () => {
        const nextState = redo({ nodes, edges })
        if (nextState) {
            setNodes(nextState.nodes)
            setEdges(nextState.edges)
        }
    }

    const handleSave = async () => {
        if (!id || !reactFlowWrapper.current) return

        try {
            // 1. Generate Thumbnail
            const canvas = await html2canvas(reactFlowWrapper.current, {
                backgroundColor: '#fff',
                width: 800,
                height: 600,
                scale: 1,
            })
            const dataUrl = canvas.toDataURL('image/png')

            const blob = await (await fetch(dataUrl)).blob()
            const file = new File([blob], 'thumbnail.png', { type: 'image/png' })

            const fileName = `${id}/${Date.now()}_thumb.png`
            await supabase.storage.from('blueprints').upload(fileName, file)
            const { data: thumbData } = supabase.storage.from('blueprints').getPublicUrl(fileName)

            // 2. Save Flow State
            const flow = { nodes, edges }
            const jsonBlob = new Blob([JSON.stringify(flow)], { type: 'application/json' })
            const jsonFile = new File([jsonBlob], 'layout.json', { type: 'application/json' })
            const jsonName = `${id}/${Date.now()}_layout.json`

            await supabase.storage.from('blueprints').upload(jsonName, jsonFile)
            const { data: jsonData } = supabase.storage.from('blueprints').getPublicUrl(jsonName)

            // 3. Update Database
            await supabase.from('blueprints').upsert({
                project_id: id,
                png_url: thumbData.publicUrl,
                json_url: jsonData.publicUrl,
            })

            showToast('Layout saved successfully', 'success')
        } catch (error) {
            logger.error('Failed to save layout', error, { projectId: id })
            showToast('Failed to save layout', 'error')
        }
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div className="h-6 w-px bg-border" />
                    <h1 className="font-semibold">Layout Planner</h1>
                    <div className="flex bg-muted rounded-md p-1">
                        <Button
                            variant={mode === 'select' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setMode('select')}
                            className="h-7 px-2"
                        >
                            <MousePointer2 className="h-4 w-4 mr-2" />
                            Select
                        </Button>
                        <Button
                            variant={mode === 'draw' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setMode('draw')}
                            className="h-7 px-2"
                        >
                            <PenTool className="h-4 w-4 mr-2" />
                            Draw Walls
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleUndo} disabled={past.length === 0}>
                        <Undo className="h-4 w-4 mr-2" />
                        Undo
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRedo} disabled={future.length === 0}>
                        <Redo className="h-4 w-4 mr-2" />
                        Redo
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Layout
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 border-r border-border bg-card p-4 overflow-y-auto">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium mb-3 text-muted-foreground">Rooms</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <div
                                    className="h-20 border border-border rounded bg-muted/50 flex items-center justify-center cursor-move hover:border-primary transition-colors"
                                    onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'room')}
                                    draggable
                                >
                                    <span className="text-xs">Square Room</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium mb-3 text-muted-foreground">Furniture</h3>
                            <div className="space-y-2">
                                <div
                                    className="p-2 border border-border rounded bg-muted/50 cursor-move hover:border-primary transition-colors"
                                    onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'furniture')}
                                    draggable
                                >
                                    <span className="text-xs">Table</span>
                                </div>
                                <div
                                    className="p-2 border border-border rounded bg-muted/50 cursor-move hover:border-primary transition-colors"
                                    onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'furniture')}
                                    draggable
                                >
                                    <span className="text-xs">Chair</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 h-full bg-muted/10" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeDragStart={onNodeDragStart}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        snapToGrid={true}
                        snapGrid={[GRID_SIZE, GRID_SIZE]}
                        fitView
                    >
                        <Background variant={BackgroundVariant.Lines} gap={GRID_SIZE} />
                        <Controls />
                        <MiniMap />
                        <Panel position="top-right" className="bg-card p-2 rounded-md border border-border shadow-sm">
                            <div className="text-xs text-muted-foreground">
                                {mode === 'draw' ? 'Draw Mode: Drag to connect nodes' : 'Select Mode: Drag nodes to move'}
                            </div>
                        </Panel>
                    </ReactFlow>
                </div>
            </div>
        </div>
    )
}

export default function LayoutPlanner() {
    return (
        <ReactFlowProvider>
            <LayoutPlannerContent />
        </ReactFlowProvider>
    )
}
