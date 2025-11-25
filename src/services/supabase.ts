import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create Supabase client with fallback values (will show error if not configured)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== '')
}

// Database helper types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string
          owner_id: string
          status: 'active' | 'completed' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          owner_id: string
          status?: 'active' | 'completed' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          owner_id?: string
          status?: 'active' | 'completed' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
      scans: {
        Row: {
          id: string
          project_id: string
          name: string
          url: string
          type: 'image' | 'video'
          uploaded_by: string
          uploaded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          url: string
          type: 'image' | 'video'
          uploaded_by: string
          uploaded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          url?: string
          type?: 'image' | 'video'
          uploaded_by?: string
          uploaded_at?: string
          created_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          email: string
          role: 'owner' | 'editor' | 'viewer'
          joined_at: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          email: string
          role: 'owner' | 'editor' | 'viewer'
          joined_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          email?: string
          role?: 'owner' | 'editor' | 'viewer'
          joined_at?: string
          created_at?: string
        }
      }
    }
  }
}
