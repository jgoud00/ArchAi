import { format } from 'date-fns'
import { FileText, Settings as SettingsIcon, Calendar } from 'lucide-react'
import { Project } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { memo } from 'react'

interface ProjectHeaderProps {
    project: Project
    isOwner: boolean
    onGenerateReport: () => void
    onOpenSettings: () => void
}

export const ProjectHeader = memo(({
    project,
    isOwner,
    onGenerateReport,
    onOpenSettings,
}: ProjectHeaderProps) => {
    return (
        <div className="flex items-start justify-between">
            <div>
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <p className="text-muted-foreground mt-1">{project.description}</p>
                <div className="flex items-center gap-4 mt-4">
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Created {format(project.createdAt, 'MMM dd, yyyy')}</span>
                    </div>
                </div>
            </div>
            {isOwner && (
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onGenerateReport}>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Report
                    </Button>
                    <Button onClick={onOpenSettings}>
                        <SettingsIcon className="h-4 w-4 mr-2" />
                        Settings
                    </Button>
                </div>
            )}
        </div>
    )
})

ProjectHeader.displayName = 'ProjectHeader'
