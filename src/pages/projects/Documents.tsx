import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, FileText, Download, Trash2, Upload } from 'lucide-react'
import { getProjectDocuments, uploadDocument, deleteDocument } from '@/services/documents'
import { getProject } from '@/services/projects'
import { useAuthStore } from '@/store/authStore'
import { Document, Project } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import { format } from 'date-fns'

export const Documents = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { showToast } = useToast()

  const [project, setProject] = useState<Project | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [docFile, setDocFile] = useState<File | null>(null)

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const [projectData, documentsData] = await Promise.all([
        getProject(id),
        getProjectDocuments(id),
      ])
      setProject(projectData)
      setDocuments(documentsData)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load documents'
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id, loadData])

  const handleUpload = async () => {
    if (!id || !user || !docFile) return

    try {
      setUploading(true)
      await uploadDocument(id, docFile, user.uid)
      showToast('Document uploaded successfully', 'success')
      setUploadModalOpen(false)
      setDocFile(null)
      loadData()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to upload document'
      showToast(message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId: string) => {
    try {
      await deleteDocument(docId)
      showToast('Document deleted successfully', 'success')
      loadData()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete document'
      showToast(message, 'error')
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('image')) return '🖼️'
    if (fileType.includes('cad') || fileType.includes('dwg')) return '📐'
    return '📎'
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
          <h1 className="text-3xl font-bold">{project?.name} - Documents</h1>
          <p className="text-muted-foreground mt-1">Manage project documents and files</p>
        </div>
        <Button onClick={() => setUploadModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No documents yet. Upload your first document.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-2xl">{getFileIcon(doc.fileType)}</span>
                    <div className="flex-1">
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(doc.uploadedAt, 'MMM d, yyyy')} • {doc.fileType}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(doc.fileUrl, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false)
          setDocFile(null)
        }}
        title="Upload Document"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Document</label>
            <div className="border-2 border-dashed border-input rounded-lg p-4">
              <input
                type="file"
                onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                className="hidden"
                id="doc-upload"
              />
              <label
                htmlFor="doc-upload"
                className="cursor-pointer flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Upload className="h-4 w-4" />
                {docFile ? docFile.name : 'Click to upload document'}
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setUploadModalOpen(false)
                setDocFile(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!docFile || uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

