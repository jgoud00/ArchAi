/**
 * Zod Validation Schemas
 * 
 * Centralized validation schemas for all data models
 */

import { z } from 'zod'

// ============================================================
// PROJECT SCHEMAS
// ============================================================

export const ProjectStatusSchema = z.enum(['active', 'archived', 'completed'])

export const CreateProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required').max(100, 'Project name too long'),
    description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
    ownerId: z.string().uuid('Invalid owner ID'),
})

export const UpdateProjectSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    status: ProjectStatusSchema.optional(),
})

// ============================================================
// BUDGET SCHEMAS
// ============================================================

export const BudgetSchema = z.object({
    name: z.string().min(1, 'Budget name is required').max(100),
    total_amount: z.number().positive('Budget amount must be positive'),
    project_id: z.string().uuid(),
})

export const ExpenseSchema = z.object({
    description: z.string().min(1, 'Description is required').max(200),
    amount: z.number().positive('Amount must be positive'),
    category: z.string().min(1, 'Category is required'),
    budget_id: z.string().uuid(),
    receipt_url: z.string().url().optional().nullable(),
})

// ============================================================
// ISSUE SCHEMAS
// ============================================================

export const IssuePrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])
export const IssueStatusSchema = z.enum(['open', 'in_progress', 'resolved', 'closed'])

export const CreateIssueSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().min(1, 'Description is required').max(2000),
    priority: IssuePrioritySchema,
    status: IssueStatusSchema.default('open'),
    project_id: z.string().uuid(),
    photo_url: z.string().url().optional().nullable(),
})

export const UpdateIssueSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    priority: IssuePrioritySchema.optional(),
    status: IssueStatusSchema.optional(),
    photo_url: z.string().url().optional().nullable(),
})

// ============================================================
// TASK SCHEMAS
// ============================================================

export const TaskStatusSchema = z.enum(['todo', 'in_progress', 'completed'])

export const CreateTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(1000).optional().nullable(),
    status: TaskStatusSchema.default('todo'),
    due_date: z.string().datetime().optional().nullable(),
    project_id: z.string().uuid(),
})

export const UpdateTaskSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional().nullable(),
    status: TaskStatusSchema.optional(),
    due_date: z.string().datetime().optional().nullable(),
})

// ============================================================
// INVENTORY SCHEMAS
// ============================================================

export const CreateInventoryItemSchema = z.object({
    name: z.string().min(1, 'Item name is required').max(100),
    quantity: z.number().int().nonnegative('Quantity cannot be negative'),
    unit: z.string().min(1, 'Unit is required').max(20),
    min_quantity: z.number().int().nonnegative('Minimum quantity cannot be negative').default(0),
    project_id: z.string().uuid(),
    location: z.string().max(100).optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
})

export const UpdateInventoryItemSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    quantity: z.number().int().nonnegative().optional(),
    unit: z.string().min(1).max(20).optional(),
    min_quantity: z.number().int().nonnegative().optional(),
    location: z.string().max(100).optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
})

// ============================================================
// COMMENT SCHEMAS
// ============================================================

export const CreateCommentSchema = z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
    issue_id: z.string().uuid(),
})

export const UpdateCommentSchema = z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
})

// ============================================================
// DOCUMENT SCHEMAS
// ============================================================

export const DocumentCategorySchema = z.enum(['contract', 'permit', 'blueprint', 'other'])

export const CreateDocumentSchema = z.object({
    name: z.string().min(1, 'Document name is required').max(200),
    category: DocumentCategorySchema,
    project_id: z.string().uuid(),
    description: z.string().max(500).optional().nullable(),
})

// ============================================================
// TEAM MEMBER SCHEMAS
// ============================================================

export const TeamMemberRoleSchema = z.enum(['owner', 'editor', 'viewer'])

export const AddTeamMemberSchema = z.object({
    project_id: z.string().uuid(),
    user_id: z.string().uuid(),
    email: z.string().email('Invalid email address'),
    role: TeamMemberRoleSchema,
})

export const UpdateTeamMemberRoleSchema = z.object({
    role: TeamMemberRoleSchema,
})

// ============================================================
// FILE UPLOAD SCHEMAS
// ============================================================

export const FileUploadSchema = z.object({
    file: z.instanceof(File),
    maxSize: z.number().positive().default(10 * 1024 * 1024), // 10MB default
    allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
})

// Validation helper
export function validateFileUpload(
    file: File,
    maxSize: number = 10 * 1024 * 1024,
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
): void {
    if (file.size > maxSize) {
        throw new Error(`File size must be less than ${maxSize / 1024 / 1024}MB`)
    }

    if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`)
    }
}

// ============================================================
// TYPE INFERENCE HELPERS
// ============================================================

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>
export type BudgetInput = z.infer<typeof BudgetSchema>
export type ExpenseInput = z.infer<typeof ExpenseSchema>
export type CreateIssueInput = z.infer<typeof CreateIssueSchema>
export type UpdateIssueInput = z.infer<typeof UpdateIssueSchema>
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>
export type CreateInventoryItemInput = z.infer<typeof CreateInventoryItemSchema>
export type UpdateInventoryItemInput = z.infer<typeof UpdateInventoryItemSchema>
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>
export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>
export type AddTeamMemberInput = z.infer<typeof AddTeamMemberSchema>
export type UpdateTeamMemberRoleInput = z.infer<typeof UpdateTeamMemberRoleSchema>
