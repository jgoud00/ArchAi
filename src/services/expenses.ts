import { supabase } from './supabase'
import { Expense } from '../types'
import { getProjectBudget, createOrUpdateBudget } from './budgets'

export const getProjectExpenses = async (projectId: string): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('project_id', projectId)
    .order('date', { ascending: false })

  if (error || !data) {
    return []
  }

  return data.map((expense) => ({
    id: expense.id,
    projectId: expense.project_id,
    type: expense.type,
    name: expense.name,
    amount: parseFloat(expense.amount || '0'),
    date: new Date(expense.date),
    createdAt: new Date(expense.created_at),
    updatedAt: new Date(expense.created_at), // Fallback to created_at
  }))
}

export const getExpense = async (expenseId: string): Promise<Expense | null> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', expenseId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    projectId: data.project_id,
    type: data.type,
    name: data.name,
    amount: parseFloat(data.amount || '0'),
    date: new Date(data.date),
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.created_at), // Fallback to created_at
  }
}

export const createExpense = async (
  projectId: string,
  type: 'material' | 'labour',
  name: string,
  amount: number,
  date: Date
): Promise<string> => {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      project_id: projectId,
      type,
      name,
      amount,
      date: date.toISOString().split('T')[0],
    })
    .select()
    .single()

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create expense')
  }

  // Update actual cost in budget
  const expenses = await getProjectExpenses(projectId)
  const totalActual = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const budget = await getProjectBudget(projectId)
  await createOrUpdateBudget(projectId, budget?.estimatedCost || 0, totalActual)

  return data.id
}

export const updateExpense = async (
  expenseId: string,
  updates: Partial<Pick<Expense, 'type' | 'name' | 'amount' | 'date'>>
): Promise<void> => {
  const updateData: Record<string, unknown> = {}

  if (updates.type !== undefined) updateData.type = updates.type
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.amount !== undefined) updateData.amount = updates.amount
  if (updates.date !== undefined) updateData.date = updates.date.toISOString().split('T')[0]

  const { error } = await supabase
    .from('expenses')
    .update(updateData)
    .eq('id', expenseId)

  if (error) {
    throw new Error(error.message)
  }

  // Update actual cost in budget
  const { data: expense } = await supabase
    .from('expenses')
    .select('project_id')
    .eq('id', expenseId)
    .single()

  if (expense) {
    const expenses = await getProjectExpenses(expense.project_id)
    const totalActual = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const budget = await getProjectBudget(expense.project_id)
    await createOrUpdateBudget(expense.project_id, budget?.estimatedCost || 0, totalActual)
  }
}

export const deleteExpense = async (expenseId: string): Promise<void> => {
  // Get expense to update budget
  const { data: expense } = await supabase
    .from('expenses')
    .select('project_id')
    .eq('id', expenseId)
    .single()

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)

  if (error) {
    throw new Error(error.message)
  }

  // Update actual cost in budget
  if (expense) {
    const expenses = await getProjectExpenses(expense.project_id)
    const totalActual = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const budget = await getProjectBudget(expense.project_id)
    await createOrUpdateBudget(expense.project_id, budget?.estimatedCost || 0, totalActual)
  }
}

