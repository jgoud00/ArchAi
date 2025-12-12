import { Users, Image as ImageIcon } from 'lucide-react'
import { Project } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { memo } from 'react'

interface ProjectStatsProps {
    project: Project
    scansCount: number
    teamCount: number
}

export const ProjectStats = memo(({ project, scansCount, teamCount }: ProjectStatsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Scans</p>
                            <p className="text-2xl font-bold mt-1">{scansCount}</p>
                        </div>
                        <ImageIcon className="h-8 w-8 text-primary" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Team Members</p>
                            <p className="text-2xl font-bold mt-1">{teamCount}</p>
                        </div>
                        <Users className="h-8 w-8 text-primary" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                                {project.status}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
})

ProjectStats.displayName = 'ProjectStats'
