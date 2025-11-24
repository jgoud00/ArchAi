// Public API for Third-party Integrations
// This is a client-side API wrapper that uses Supabase RLS
// For server-side API, you would create Supabase Edge Functions

import { supabase } from '@/services/supabase'

export interface ApiKey {
  id: string
  key: string
  name: string
  userId: string
  createdAt: Date
  lastUsed?: Date
}

// Validate API key (in production, this would check against a database table)
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  // Placeholder: In production, check against api_keys table
  // For now, we'll use a simple validation
  // In real implementation, you'd query: SELECT * FROM api_keys WHERE key = $1
  return apiKey.length > 20
}

// Get projects (public API endpoint)
export const getProjectsApi = async (apiKey: string) => {
  if (!(await validateApiKey(apiKey))) {
    throw new Error('Invalid API key')
  }

  // Use service role or create a special RLS policy for API access
  // For now, this is a placeholder that would need proper implementation
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, description, status, created_at')

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Get inventory (public API endpoint)
export const getInventoryApi = async (apiKey: string, projectId?: string) => {
  if (!(await validateApiKey(apiKey))) {
    throw new Error('Invalid API key')
  }

  let query = supabase
    .from('inventory')
    .select('id, item_name, quantity, unit, category, updated_at')

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Get documents (public API endpoint)
export const getDocumentsApi = async (apiKey: string, projectId?: string) => {
  if (!(await validateApiKey(apiKey))) {
    throw new Error('Invalid API key')
  }

  let query = supabase
    .from('documents')
    .select('id, name, file_url, file_type, uploaded_at')

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data
}

