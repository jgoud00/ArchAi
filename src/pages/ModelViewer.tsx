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

export default function ModelViewer() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { showToast } = useToast()

  const [models, setModels] = useState<any[]>([])
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadModels = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('project_models')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setModels(data || [])
      if (data && data.length > 0) {
        setSelectedModel(data[0].url)
      }
    } catch (error) {
      console.error('Failed to load models:', error)
      showToast('Failed to load models', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

  useEffect(() => {
    if (id) {
      loadModels()
    }
  }, [id, loadModels])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !id || !user) return

    // Validate file type
    if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
      showToast('Please upload a .glb or .gltf file', 'error')
      return
    }

    // Validate file size (e.g., 50MB limit)
    const MAX_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      showToast('File size exceeds 50MB limit', 'error')
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

      // Determine version number
      const nextVersion = models.length + 1

      // Insert into project_models
      const { error: dbError } = await supabase
        .from('project_models')
        .insert({
          project_id: id,
          name: file.name,
          url: urlData.publicUrl,
          version: nextVersion,
          uploaded_by: user.uid
        })

      if (dbError) throw dbError

      showToast('3D model uploaded successfully!', 'success')
      await loadModels()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to upload model'
      showToast(message, 'error')
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
                Upload New Version
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-[600px] overflow-hidden">
            <CardContent className="p-0 h-full bg-muted relative">
              {selectedModel ? (
                <Canvas>
                  <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} />
                  <Model url={selectedModel} />
                  <OrbitControls />
                </Canvas>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <p className="text-lg font-medium mb-2">No 3D model selected</p>
                    <p className="text-sm">Upload a .glb or .gltf file to view it here</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Version History</h3>
              {models.length === 0 ? (
                <p className="text-sm text-muted-foreground">No versions uploaded yet.</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {models.map((model) => (
                    <div
                      key={model.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedModel === model.url
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-accent border-transparent'
                        }`}
                      onClick={() => setSelectedModel(model.url)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm truncate max-w-[150px]">{model.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Version {model.version} • {new Date(model.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {selectedModel === model.url && (
                          <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

