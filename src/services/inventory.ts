import { supabase } from './supabase'
import { InventoryItem } from '../types'

export const getProjectInventory = async (projectId: string): Promise<InventoryItem[]> => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false })

  if (error || !data) {
    return []
  }

  return data.map((item) => ({
    id: item.id,
    projectId: item.project_id,
    itemName: item.item_name,
    quantity: parseFloat(item.quantity || '0'),
    unit: item.unit,
    category: item.category || undefined,
    updatedAt: new Date(item.updated_at),
  }))
}

export const getInventoryItem = async (itemId: string): Promise<InventoryItem | null> => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('id', itemId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    projectId: data.project_id,
    itemName: data.item_name,
    quantity: parseFloat(data.quantity || '0'),
    unit: data.unit,
    category: data.category || undefined,
    updatedAt: new Date(data.updated_at),
  }
}

export const createInventoryItem = async (
  projectId: string,
  itemName: string,
  quantity: number,
  unit: string,
  category?: string
): Promise<string> => {
  const { data, error } = await supabase
    .from('inventory')
    .insert({
      project_id: projectId,
      item_name: itemName,
      quantity,
      unit,
      category: category || null,
    })
    .select()
    .single()

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create inventory item')
  }

  return data.id
}

export const updateInventoryItem = async (
  itemId: string,
  updates: Partial<Pick<InventoryItem, 'itemName' | 'quantity' | 'unit' | 'category'>>
): Promise<void> => {
  const updateData: any = {}

  if (updates.itemName !== undefined) updateData.item_name = updates.itemName
  if (updates.quantity !== undefined) updateData.quantity = updates.quantity
  if (updates.unit !== undefined) updateData.unit = updates.unit
  if (updates.category !== undefined) updateData.category = updates.category || null

  const { error } = await supabase
    .from('inventory')
    .update(updateData)
    .eq('id', itemId)

  if (error) {
    throw new Error(error.message)
  }
}

export const deleteInventoryItem = async (itemId: string): Promise<void> => {
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', itemId)

  if (error) {
    throw new Error(error.message)
  }
}

