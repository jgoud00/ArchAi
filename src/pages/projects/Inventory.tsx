import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react'
import { getProjectInventory, deleteInventoryItem } from '@/services/inventory'
import { getProject } from '@/services/projects'
import { InventoryItem, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/services/supabase'

interface InventoryCategory {
  id: string
  name: string
}

export const Inventory = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [project, setProject] = useState<Project | null>(null)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<InventoryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const [projectData, inventoryData] = await Promise.all([
        getProject(id),
        getProjectInventory(id),
      ])
      setProject(projectData)
      setInventory(inventoryData)

      // Fetch categories
      const { data: catData } = await supabase
        .from('inventory_categories')
        .select('*')
        .eq('project_id', id)

      if (catData) {
        setCategories(catData)
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load inventory'
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

  const handleDelete = async () => {
    if (!itemToDelete) return
    try {
      await deleteInventoryItem(itemToDelete.id)
      showToast('Item deleted successfully', 'success')
      setDeleteModalOpen(false)
      setItemToDelete(null)
      loadData()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete item'
      showToast(message, 'error')
    }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' ||
      (item.category === selectedCategory) // Note: We might need to map category_id to name or use category_id if we updated the type
    return matchesSearch && matchesCategory
  })

  // Group by category for display if no specific category selected, or just list if filtered
  const groupedByCategory = filteredInventory.reduce((acc, item) => {
    const category = item.category || 'Uncategorized'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {} as Record<string, InventoryItem[]>)

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
          <h1 className="text-3xl font-bold">{project?.name} - Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage project inventory and materials</p>
        </div>
        <Button onClick={() => navigate(`/projects/${id}/inventory/new`)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="flex gap-4 items-center bg-card p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
            {/* Fallback for existing string categories that might not be in the table yet if migration didn't run or sync */}
            {Object.keys(groupedByCategory).filter(c => !categories.find(cat => cat.name === c) && c !== 'Uncategorized').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {inventory.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No inventory items yet. Add your first item.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByCategory).map(([category, items]: [string, InventoryItem[]]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => navigate(`/projects/${id}/inventory/${item.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setItemToDelete(item)
                            setDeleteModalOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {Object.keys(groupedByCategory).length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No items match your search or filter.
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setItemToDelete(null)
        }}
        title="Delete Item"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this item? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false)
                setItemToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

