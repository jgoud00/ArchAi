import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from './ui/Button'

interface FileUploadProps {
  onUpload: (file: File, onProgress: (progress: number) => void) => Promise<void>
  accept?: Record<string, string[]>
  maxSize?: number
  className?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  accept = {
    'image/*': ['.jpg', '.jpeg', '.png'],
    'video/*': ['.mp4', '.mov'],
  },
  maxSize = 50 * 1024 * 1024, // 50MB
  className,
}) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setSelectedFile(file)
    setError(null)
  }, [])

  const onDropRejected = useCallback((rejectedFiles: any[]) => {
    const rejection = rejectedFiles[0]
    if (rejection.errors[0]?.code === 'file-too-large') {
      setError('File size must be less than 50MB')
    } else {
      setError('Invalid file type. Please upload images or videos.')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept,
    maxSize,
    maxFiles: 1,
    multiple: false,
  })

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      await onUpload(selectedFile, (prog) => setProgress(prog))
      setSelectedFile(null)
      setProgress(0)
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setError(null)
    setProgress(0)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            {isDragActive
              ? 'Drop the file here'
              : 'Drag & drop a file here, or click to select'}
          </p>
          <p className="text-xs text-muted-foreground">
            Images (.jpg, .png) or Videos (.mp4, .mov) up to 50MB
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-lg p-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            {!uploading && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {!uploading && (
            <div className="flex gap-2">
              <Button onClick={handleUpload} className="flex-1">
                Upload
              </Button>
              <Button variant="outline" onClick={handleRemove}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
