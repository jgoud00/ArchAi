import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from './ui/Button'
import { Project } from '@/types'
import { memo } from 'react'

interface ProjectCardProps {
  project: Project
}

export const ProjectCard: React.FC<ProjectCardProps> = memo(({ project }) => {
  const navigate = useNavigate()

  // Mock progress based on status for visualization
  const progress = project.status === 'completed' ? 100 :
    project.status === 'archived' ? 100 :
      Math.floor(Math.random() * 60) + 20 // Random 20-80% for active

  const statusColors = {
    active: 'bg-primary/30 text-primary',
    completed: 'bg-green-600/30 text-green-300',
    archived: 'bg-muted/30 text-muted-foreground'
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border p-5 rounded-xl space-y-3 transition-all duration-300 hover:shadow-primary/20 hover:shadow-md group">
      <div className="flex justify-between items-start">
        <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{project.name}</h4>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${statusColors[project.status] || statusColors.active
            }`}
        >
          {project.status}
        </span>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2 min-h-[2.5em]">
          {project.description || 'No description provided.'}
        </p>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t border-border">
        <span>Last Update: {format(new Date(project.updatedAt || project.createdAt), 'MMM dd, yyyy')}</span>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:bg-primary/20 hover:text-primary p-0 h-auto font-normal"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/projects/${project.id}`)
          }}
        >
          View <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  )
})

ProjectCard.displayName = 'ProjectCard'
