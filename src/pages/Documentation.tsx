import { useState, useCallback, useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { BookOpen } from 'lucide-react'
import { OverviewTab, TechnicalTab, DatabaseTab, WorkflowsTab } from '@/components/documentation'

/**
 * Documentation Page Component
 * 
 * Comprehensive documentation with four main tabs:
 * - OVERVIEW: Project identity, structure, features
 * - TECHNICAL: Tech stack, architecture, security
 * - DATABASE: Schema, entities, relationships
 * - WORKFLOWS: User workflows and data flows
 * 
 * Refactored to use extracted tab components for better maintainability.
 * Original: 1,061 lines → Refactored: ~80 lines
 */
export const Documentation = () => {
  const [activeTab, setActiveTab] = useState<string>('overview')

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
  }, [])

  const headerContent = useMemo(() => (
    <div className="flex items-center gap-3">
      <BookOpen className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-3xl font-bold">Documentation</h1>
        <p className="text-muted-foreground mt-1">
          Complete guide to ArchitectAI architecture, features, and workflows
        </p>
      </div>
    </div>
  ), [])

  const tabListContent = useMemo(() => (
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="overview">OVERVIEW</TabsTrigger>
      <TabsTrigger value="technical">TECHNICAL</TabsTrigger>
      <TabsTrigger value="database">DATABASE</TabsTrigger>
      <TabsTrigger value="workflows">WORKFLOWS</TabsTrigger>
    </TabsList>
  ), [])

  return (
    <ErrorBoundary>
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        {headerContent}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {tabListContent}

          <TabsContent value="overview" className="space-y-4 mt-6">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="technical" className="space-y-4 mt-6">
            <TechnicalTab />
          </TabsContent>

          <TabsContent value="database" className="space-y-4 mt-6">
            <DatabaseTab />
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4 mt-6">
            <WorkflowsTab />
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  )
}
