import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { createInventoryItem } from '@/services/inventory'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useToast } from '@/hooks/useToast'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const inventorySchema = z.object({
  itemName: z.string().min(1, 'Item name is required'),
  quantity: z.number().min(0, 'Quantity must be 0 or greater'),
  unit: z.string().min(1, 'Unit is required'),
  category: z.string().optional(),
})

type InventoryFormData = z.infer<typeof inventorySchema>

export const NewInventoryItem = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      unit: 'pcs',
    },
  })

  const onSubmit = async (data: InventoryFormData) => {
    if (!id) return

    try {
      setLoading(true)
      await createInventoryItem(id, data.itemName, data.quantity, data.unit, data.category)
      showToast('Item added successfully', 'success')
      navigate(`/projects/${id}/inventory`)
    } catch (error: any) {
      showToast(error.message || 'Failed to add item', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/projects/${id}/inventory`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Inventory Item</h1>
          <p className="text-muted-foreground mt-1">Add a new item to the inventory</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Item Name *</label>
              <Input
                {...register('itemName')}
                placeholder="e.g., Concrete, Steel bars"
                className={errors.itemName ? 'border-destructive' : ''}
              />
              {errors.itemName && (
                <p className="text-sm text-destructive mt-1">{errors.itemName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Quantity *</label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('quantity', { valueAsNumber: true })}
                  placeholder="0"
                  className={errors.quantity ? 'border-destructive' : ''}
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Unit *</label>
                <Input
                  {...register('unit')}
                  placeholder="pcs, kg, m, etc."
                  className={errors.unit ? 'border-destructive' : ''}
                />
                {errors.unit && (
                  <p className="text-sm text-destructive mt-1">{errors.unit.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category (Optional)</label>
              <Input
                {...register('category')}
                placeholder="e.g., Materials, Tools, Equipment"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/projects/${id}/inventory`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                Add Item
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

