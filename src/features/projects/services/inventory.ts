import { supabase } from '@/services/supabase'
import { InventoryItem } from '@/types'

/**
 * Retrieves all inventory items for a specific project.
 * 
 * @param projectId - The UUID of the project.
 * @returns A Promise resolving to an array of InventoryItem objects.
 */
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

/**
 * Retrieves a single inventory item by its ID.
 * 
 * @param itemId - The UUID of the inventory item.
 * @returns A Promise resolving to the InventoryItem object or null if not found.
 */
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

/**
 * Creates a new inventory item.
 * 
 * @param projectId - The UUID of the project.
 * @param itemName - The name of the item.
 * @param quantity - The initial quantity.
 * @param unit - The unit of measurement (e.g., 'kg', 'pcs').
 * @param category - Optional category for the item.
 * @returns A Promise resolving to the newly created item's ID.
 * @throws Error if creation fails.
 */
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

/**
 * Updates an inventory item.
 * 
 * @param itemId - The UUID of the item to update.
 * @param updates - Partial object containing fields to update.
 * @returns A Promise resolving when the update is complete.
 * @throws Error if the update fails.
 */
export const updateInventoryItem = async (
  itemId: string,
  updates: Partial<Pick<InventoryItem, 'itemName' | 'quantity' | 'unit' | 'category'>>
): Promise<void> => {
  const updateData: {
    item_name?: string
    quantity?: number
    unit?: string
    category?: string | null
  } = {}

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

/**
 * Deletes an inventory item.
 * 
 * @param itemId - The UUID of the item to delete.
 * @returns A Promise resolving when the deletion is complete.
 * @throws Error if the deletion fails.
 */
export const deleteInventoryItem = async (itemId: string): Promise<void> => {
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', itemId)

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Retrieves inventory items that are running low on stock.
 * 
 * @param userId - The unique identifier of the user.
 * @param threshold - The quantity threshold (default: 10).
 * @returns A promise that resolves to an array of low-stock inventory items.
 */
export const getLowStockItems = async (
  userId: string,
  threshold: number = 10
): Promise<InventoryItem[]> => {
  //Get all projects the user owns or is a member of
  const { data: projects, error: projectsError } = await supabase
    .from('team_members')
    .select('project_id')
    .eq('user_id', userId)

  if (projectsError) {
    throw new Error(projectsError.message || 'Failed to load projects')
  }

  const projectIds = projects?.map(p => p.project_id) || []

  // Add user's own projects
  const { data: ownProjects } = await supabase
    .from('projects')
    .select('id')
    .eq('owner_id', userId)

  if (ownProjects) {
    projectIds.push(...ownProjects.map(p => p.id))
  }

  if (projectIds.length === 0) return []

  // Get low stock items
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .in('project_id', projectIds)
    .lte('quantity', threshold)
    .order('quantity', { ascending: true })

  if (error) {
    throw new Error(error.message || 'Failed to load low stock items')
  }

  if (!data) return []

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

