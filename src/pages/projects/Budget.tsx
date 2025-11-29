import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, DollarSign } from 'lucide-react'
import { getProjectBudget, createOrUpdateBudget } from '@/services/budgets'
import { getProjectExpenses } from '@/services/expenses'
import { getProject } from '@/services/projects'
import { Budget, Expense, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/hooks/useToast'
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export const BudgetPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [project, setProject] = useState<Project | null>(null)
  const [budget, setBudget] = useState<Budget | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [estimatedCost, setEstimatedCost] = useState('0')

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const [projectData, budgetData, expensesData] = await Promise.all([
        getProject(id),
        getProjectBudget(id),
        getProjectExpenses(id),
      ])
      setProject(projectData)
      setBudget(budgetData)
      setExpenses(expensesData)
      setEstimatedCost(budgetData?.estimatedCost.toString() || '0')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load budget'
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

  const handleUpdateBudget = async () => {
    if (!id || !budget) return

    try {
      await createOrUpdateBudget(id, parseFloat(estimatedCost) || 0, budget.actualCost)
      showToast('Budget updated successfully', 'success')
      setEditModalOpen(false)
      loadData()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update budget'
      showToast(message, 'error')
    }
  }

  const materialExpenses = expenses.filter(e => e.type === 'material')
  const labourExpenses = expenses.filter(e => e.type === 'labour')
  const materialTotal = materialExpenses.reduce((sum, e) => sum + e.amount, 0)
  const labourTotal = labourExpenses.reduce((sum, e) => sum + e.amount, 0)

  const chartData = [
    { name: 'Material', value: materialTotal },
    { name: 'Labour', value: labourTotal },
  ]

  const COLORS = ['#0088FE', '#00C49F']

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
          <h1 className="text-3xl font-bold">{project?.name} - Budget</h1>
          <p className="text-muted-foreground mt-1">Track project expenses and budget</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditModalOpen(true)}>
            Edit Budget
          </Button>
          <Button onClick={() => navigate(`/projects/${id}/budget/add-expense`)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Estimated Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                ${budget?.estimatedCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Actual Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                ${budget?.actualCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className={`text-2xl font-bold ${(budget?.estimatedCost || 0) - (budget?.actualCost || 0) < 0 ? 'text-destructive' : ''}`}>
                ${((budget?.estimatedCost || 0) - (budget?.actualCost || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: { name?: string; percent?: number }) => {
                    const name = props.name || ''
                    const percent = props.percent || 0
                    return `${name} ${(percent * 100).toFixed(0)}%`
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{expense.name}</p>
                    <p className="text-sm text-muted-foreground">{expense.type}</p>
                  </div>
                  <p className="font-bold">${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              ))}
              {expenses.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No expenses yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Budget"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Estimated Cost</label>
            <Input
              type="number"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBudget}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

