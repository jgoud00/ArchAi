/**
 * Budget Management Service
 * 
 * Handles project budget tracking, updates, and alert generation.
 */

import { supabase } from '@/services/supabase'
import { Budget, BudgetAlert } from '@/types'

/**
 * Retrieves the budget details for a specific project.
 * 
 * @param projectId - The unique identifier of the project.
 * @returns A promise that resolves to the budget object. Returns a default budget with zero values if none exists.
 */
export const getProjectBudget = async (projectId: string): Promise<Budget | null> => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('project_id', projectId)
    .single()

  if (error || !data) {
    // Return default budget if none exists
    return {
      projectId,
      estimatedCost: 0,
      actualCost: 0,
      alertThreshold: 0,
      updatedAt: new Date(),
    }
  }

  return {
    projectId: data.project_id,
    estimatedCost: parseFloat(data.estimated_cost || '0'),
    actualCost: parseFloat(data.actual_cost || '0'),
    alertThreshold: parseFloat(data.alert_threshold || '0'),
    updatedAt: new Date(data.updated_at),
  }
}

/**
 * Creates or updates the budget for a project.
 * 
 * @param projectId - The unique identifier of the project.
 * @param estimatedCost - The total estimated cost for the project.
 * @param actualCost - The current actual cost incurred.
 * @param alertThreshold - Optional percentage threshold for budget alerts (e.g., 80 for 80%).
 * @returns A promise that resolves when the budget is updated.
 * @throws Will throw an error if the database operation fails.
 */
export const createOrUpdateBudget = async (
  projectId: string,
  estimatedCost: number,
  actualCost: number,
  alertThreshold?: number
): Promise<void> => {
  const { error } = await supabase
    .from('budgets')
    .upsert({
      project_id: projectId,
      estimated_cost: estimatedCost,
      actual_cost: actualCost,
      alert_threshold: alertThreshold,
    }, {
      onConflict: 'project_id',
    })

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Updates the budget alert threshold for a project.
 * 
 * @param projectId - The unique identifier of the project.
 * @param threshold - The new percentage threshold for alerts.
 * @returns A promise that resolves when the threshold is updated.
 * @throws Will throw an error if the database operation fails.
 */
export const updateBudgetThreshold = async (
  projectId: string,
  threshold: number
): Promise<void> => {
  const { error } = await supabase
    .from('budgets')
    .update({ alert_threshold: threshold })
    .eq('project_id', projectId)

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Retrieves a list of budget alerts for all projects.
 * 
 * An alert is generated if the actual cost exceeds the defined threshold percentage of the estimated cost.
 * 
 * @returns A promise that resolves to an array of budget alerts.
 */
export const getBudgetAlerts = async (): Promise<BudgetAlert[]> => {
  const { data, error } = await supabase
    .from('budgets')
    .select(`
      project_id,
      estimated_cost,
      actual_cost,
      alert_threshold,
      projects!inner(name)
    `)

  if (error || !data) {
    return []
  }

  const alerts: BudgetAlert[] = []

  for (const budget of data) {
    const estimatedCost = parseFloat(budget.estimated_cost || '0')
    const actualCost = parseFloat(budget.actual_cost || '0')
    const threshold = parseFloat(budget.alert_threshold || '0')

    if (estimatedCost > 0 && threshold > 0) {
      const thresholdAmount = (estimatedCost * threshold) / 100
      if (actualCost > thresholdAmount) {
        // Handle both array and object cases from Supabase join
        const projectData = budget.projects as unknown as { name: string } | { name: string }[]
        const projectName = Array.isArray(projectData)
          ? projectData[0]?.name
          : projectData?.name
        alerts.push({
          projectId: budget.project_id,
          projectName: projectName || 'Unknown Project',
          estimatedCost,
          actualCost,
          threshold,
          exceededBy: actualCost - thresholdAmount,
          exceededByPercent: ((actualCost - thresholdAmount) / estimatedCost) * 100,
        })
      }
    }
  }

  return alerts
}

/**
 * Updates the estimated cost for a project's budget.
 * 
 * @param projectId - The unique identifier of the project.
 * @param estimatedCost - The new estimated cost.
 * @returns A promise that resolves when the estimated cost is updated.
 * @throws Will throw an error if the database operation fails.
 */
export const updateBudgetEstimatedCost = async (
  projectId: string,
  estimatedCost: number
): Promise<void> => {
  const { error } = await supabase
    .from('budgets')
    .upsert({
      project_id: projectId,
      estimated_cost: estimatedCost,
    }, {
      onConflict: 'project_id',
    })

  if (error) {
    throw new Error(error.message)
  }
}

