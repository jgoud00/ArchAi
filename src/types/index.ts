export type UserRole = 'admin' | 'supervisor' | 'user'

export interface User {
  uid: string
  email: string
  displayName: string
  avatar?: string
  role: UserRole
  createdAt: Date
}

export interface Project {
  id: string
  name: string
  description: string
  ownerId: string
  status: 'active' | 'completed' | 'archived'
  createdAt: Date
  updatedAt: Date
  scanCount?: number
  memberCount?: number
  fileCount?: number
  commentCount?: number
}

export interface Scan {
  id: string
  name: string
  url: string
  type: 'image' | 'video'
  uploadedBy: string
  uploadedAt: Date
  projectId: string
}

export interface ProjectFile {
  id: string
  projectId: string
  name: string
  fileUrl: string
  fileType: string
  fileSize: number
  uploadedBy: string
  category?: string
  description?: string
  uploadedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface ProjectComment {
  id: string
  projectId: string
  userId: string
  content: string
  createdAt: Date
  updatedAt: Date
  user?: {
    displayName: string
    email: string
    avatar?: string
  }
}

export interface ProjectActivity {
  id: string
  projectId: string
  userId: string
  activityType: 
    | 'project_created'
    | 'project_updated'
    | 'project_deleted'
    | 'file_uploaded'
    | 'file_deleted'
    | 'member_added'
    | 'member_removed'
    | 'member_role_changed'
    | 'comment_added'
    | 'comment_updated'
    | 'comment_deleted'
    | 'scan_uploaded'
    | 'scan_deleted'
  description: string
  metadata?: Record<string, any>
  createdAt: Date
  user?: {
    displayName: string
    email: string
    avatar?: string
  }
}

export interface TeamMember {
  id: string
  userId: string
  email: string
  role: 'owner' | 'editor' | 'viewer'
  joinedAt: Date
  user?: {
    displayName: string
    avatar?: string
  }
}

export interface AuthStore {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  initializeAuth: () => Promise<void>
  // Role-based helpers
  userRole: UserRole | null
  isAdmin: () => boolean
  isSupervisor: () => boolean
  isUser: () => boolean
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean
}

export interface Issue {
  id: string
  projectId: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'in_progress' | 'resolved'
  photoUrl?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface ProgressPhoto {
  id: string
  projectId: string
  photoUrl: string
  caption?: string
  uploadedBy: string
  uploadedAt: Date
}

export interface Budget {
  projectId: string
  estimatedCost: number
  actualCost: number
  alertThreshold?: number
  updatedAt: Date
}

export interface BudgetAlert {
  projectId: string
  projectName: string
  estimatedCost: number
  actualCost: number
  threshold: number
  exceededBy: number
  exceededByPercent: number
}

export interface Expense {
  id: string
  projectId: string
  type: 'material' | 'labour'
  name: string
  amount: number
  date: Date
  createdAt: Date
}

export interface Document {
  id: string
  projectId: string
  name: string
  fileUrl: string
  fileType: string
  uploadedBy: string
  uploadedAt: Date
}

export interface Blueprint {
  projectId: string
  pngUrl?: string
  jsonUrl?: string
  updatedAt: Date
}

export interface InventoryItem {
  id: string
  projectId: string
  itemName: string
  quantity: number
  unit: string
  category?: string
  updatedAt: Date
}

export interface Task {
  id: string
  projectId: string
  taskName: string
  startDate: Date
  endDate: Date
  status: 'pending' | 'in_progress' | 'completed'
  createdAt: Date
  updatedAt: Date
}