import { memo } from 'react';
import { Project } from '@/types';
import { ProjectCard } from '@/components/ProjectCard';
import { CardGrid } from '@/components/layout/CardGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { Folder, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ProjectsGridProps {
    projects: Project[];
    onCreateProject: () => void;
}

/**
 * ProjectsGrid - Grid display of projects with empty state
 */
export const ProjectsGrid = memo(({ projects, onCreateProject }: ProjectsGridProps) => {
    if (projects.length === 0) {
        return (
            <EmptyState
                icon={<Folder className="h-8 w-8 text-primary" />}
                title="No projects yet"
                description="Start your journey by creating your first construction project. AI-powered tools await."
                action={
                    <Button onClick={onCreateProject} className="btn-primary-enhanced">
                        <Plus className="h-4 w-4 mr-2" /> Create Project
                    </Button>
                }
            />
        );
    }

    return (
        <CardGrid cols={2}>
            {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
            ))}
        </CardGrid>
    );
});

ProjectsGrid.displayName = 'ProjectsGrid';
