import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei'
import { Upload, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useToast } from '@/hooks/useToast'
import { Spinner } from '@/components/ui/Spinner'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/store/authStore'

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

export const ModelViewer = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { showToast } = useToast()
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadModel = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      // Check if project has a 3D model
      const { data } = await supabase
        .from('blueprints')
        .select('json_url')
        .eq('project_id', id)
        .single()

      if (data?.json_url) {
        setModelUrl(data.json_url)
      }
    } catch (error) {
      console.error('Failed to load model:', error)
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

  useEffect(() => {
    if (id) {
      loadModel()
    }
  }, [id, loadModel])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !id || !user) return

    // Validate file type
    if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
      showToast('Please upload a .glb or .gltf file', 'error')
      return
    }

    setUploading(true)

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${id}/${Date.now()}.${fileExt}`
      const filePath = `blueprints/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('blueprints')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('blueprints')
        .getPublicUrl(filePath)

      // Update blueprint record
      const { error: updateError } = await supabase
        .from('blueprints')
        .upsert({
          project_id: id,
          json_url: urlData.publicUrl,
        })

      if (updateError) throw updateError

      setModelUrl(urlData.publicUrl)
      showToast('3D model uploaded successfully!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to upload model', 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">3D Model Viewer</h1>
            <p className="text-muted-foreground mt-1">View and manage 3D blueprints</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Model
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="h-[600px] w-full bg-muted">
            {modelUrl ? (
              <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Model url={modelUrl} />
                <OrbitControls />
              </Canvas>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">No 3D model uploaded</p>
                  <p className="text-sm">Upload a .glb or .gltf file to view it here</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

