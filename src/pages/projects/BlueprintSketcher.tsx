import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Save, Download, RotateCcw } from 'lucide-react'
import { getProjectBlueprint, saveBlueprint, loadBlueprintJson } from '@/services/blueprints'
import { getProject } from '@/services/projects'
import { useAuthStore } from '@/store/authStore'
import { Blueprint, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/hooks/useToast'

export const BlueprintSketcher = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { showToast } = useToast()
  
  const [project, setProject] = useState<Project | null>(null)
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingMode, setDrawingMode] = useState<'line' | 'rectangle'>('line')
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  useEffect(() => {
    if (canvasRef.current && blueprint?.pngUrl) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
        }
      }
      img.src = blueprint.pngUrl
    }
  }, [blueprint])

  const loadData = async () => {
    if (!id) return
    try {
      setLoading(true)
      const [projectData, blueprintData] = await Promise.all([
        getProject(id),
        getProjectBlueprint(id),
      ])
      setProject(projectData)
      setBlueprint(blueprintData)
    } catch (error: any) {
      showToast(error.message || 'Failed to load blueprint', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    setStartPos(getMousePos(e))
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const currentPos = getMousePos(e)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    if (blueprint?.pngUrl) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        drawShape(ctx, startPos, currentPos)
      }
      img.src = blueprint.pngUrl
    } else {
      drawShape(ctx, startPos, currentPos)
    }
  }

  const drawShape = (ctx: CanvasRenderingContext2D, start: { x: number; y: number }, end: { x: number; y: number }) => {
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    if (drawingMode === 'line') {
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    } else {
      ctx.strokeRect(
        Math.min(start.x, end.x),
        Math.min(start.y, end.y),
        Math.abs(end.x - start.x),
        Math.abs(end.y - start.y)
      )
    }
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
    setStartPos(null)
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (blueprint?.pngUrl) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
      }
      img.src = blueprint.pngUrl
    }
  }

  const handleSave = async () => {
    if (!id) return

    const canvas = canvasRef.current
    if (!canvas) return

    try {
      setSaving(true)
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('Failed to export blueprint', 'error')
          return
        }

        const jsonData = JSON.stringify({
          mode: drawingMode,
          timestamp: new Date().toISOString(),
        })

        await saveBlueprint(id, blob, jsonData)
        showToast('Blueprint saved successfully', 'success')
        loadData()
      }, 'image/png')
    } catch (error: any) {
      showToast(error.message || 'Failed to save blueprint', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `blueprint-${id}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project?.name} - Blueprint Sketcher</h1>
          <p className="text-muted-foreground mt-1">Draw and edit project blueprints</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClear}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Canvas</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={drawingMode === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDrawingMode('line')}
              >
                Line
              </Button>
              <Button
                variant={drawingMode === 'rectangle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDrawingMode('rectangle')}
              >
                Rectangle
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full h-auto cursor-crosshair bg-white"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

