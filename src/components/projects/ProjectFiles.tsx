import { format } from 'date-fns'
import { Plus, Upload, Trash2, Image as ImageIcon } from 'lucide-react'
import { Scan } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { memo } from 'react'

interface ProjectFilesProps {
    scans: Scan[]
    isOwner: boolean
    isMember: boolean
    onUpload: () => void
    onPreview: (scan: Scan) => void
    onDelete: (scan: Scan) => void
}

export const ProjectFiles = memo(({
    scans,
    isOwner,
    isMember,
    onUpload,
    onPreview,
    onDelete,
}: ProjectFilesProps) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Project Scans</h2>
                {(isOwner || isMember) && (
                    <Button onClick={onUpload}>
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Scan
                    </Button>
                )}
            </div>

            {scans.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No scans yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Upload your first scan to get started
                        </p>
                        {(isOwner || isMember) && (
                            <Button onClick={onUpload}>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Scan
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {scans.map((scan) => (
                        <Card key={scan.id} className="overflow-hidden">
                            <div
                                className="relative aspect-video bg-muted cursor-pointer"
                                onClick={() => onPreview(scan)}
                            >
                                {scan.type === 'image' ? (
                                    <img
                                        src={scan.url}
                                        alt={scan.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <video
                                        src={scan.url}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                {isOwner && (
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            if (confirm('Are you sure you want to delete this scan?')) {
                                                onDelete(scan)
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <CardContent className="p-3">
                                <p className="text-sm font-medium truncate">{scan.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {format(scan.uploadedAt, 'MMM dd, yyyy')}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
})

ProjectFiles.displayName = 'ProjectFiles'
