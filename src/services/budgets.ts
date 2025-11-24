import { supabase } from './supabase'
import { Budget, BudgetAlert } from '../types'

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
        alerts.push({
          projectId: budget.project_id,
          projectName: budget.projects?.name || 'Unknown Project',
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

