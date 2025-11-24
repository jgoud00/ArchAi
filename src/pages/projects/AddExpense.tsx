import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { createExpense } from '@/services/expenses'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useToast } from '@/hooks/useToast'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const expenseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['material', 'labour']),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

export const AddExpense = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      type: 'material',
      date: new Date().toISOString().split('T')[0],
    },
  })

  const onSubmit = async (data: ExpenseFormData) => {
    if (!id) return

    try {
      setLoading(true)
      await createExpense(id, data.type, data.name, data.amount, new Date(data.date))
      showToast('Expense added successfully', 'success')
      navigate(`/projects/${id}/budget`)
    } catch (error: any) {
      showToast(error.message || 'Failed to add expense', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/projects/${id}/budget`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Expense</h1>
          <p className="text-muted-foreground mt-1">Record a new expense for this project</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name *</label>
              <Input
                {...register('name')}
                placeholder="e.g., Concrete, Labor hours"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Type *</label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="material">Material</option>
                <option value="labour">Labour</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Amount *</label>
              <Input
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                placeholder="0.00"
                className={errors.amount ? 'border-destructive' : ''}
              />
              {errors.amount && (
                <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date *</label>
              <Input
                type="date"
                {...register('date')}
                className={errors.date ? 'border-destructive' : ''}
              />
              {errors.date && (
                <p className="text-sm text-destructive mt-1">{errors.date.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/projects/${id}/budget`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                Add Expense
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

