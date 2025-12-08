import { z } from 'zod'

/**
 * Validation Schemas for ArchitectAI
 * 
 * Comprehensive Zod schemas for all forms and user inputs
 * Provides type-safe validation with clear error messages
 */

// ==================== AUTH SCHEMAS ====================

export const loginSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
})

export const signupSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    displayName: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters')
        .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
})

export const passwordResetSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email address')
})

export const newPasswordSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

// ==================== PROJECT SCHEMAS ====================

export const projectSchema = z.object({
    name: z.string()
        .min(3, 'Project name must be at least 3 characters')
        .max(100, 'Project name must be less than 100 characters'),
    description: z.string()
        .max(500, 'Description must be less than 500 characters'),
    status: z.enum(['active', 'completed', 'archived'], {
        errorMap: () => ({ message: 'Invalid status' })
    }).optional()
})

export const projectUpdateSchema = z.object({
    name: z.string()
        .min(3, 'Project name must be at least 3 characters')
        .max(100, 'Project name must be less than 100 characters')
        .optional(),
    description: z.string()
        .max(500, 'Description must be less than 500 characters')
        .optional(),
    status: z.enum(['active', 'completed', 'archived']).optional()
})

// ==================== ISSUE SCHEMAS ====================

export const issueSchema = z.object({
    title: z.string()
        .min(5, 'Title must be at least 5 characters')
        .max(200, 'Title must be less than 200 characters'),
    description: z.string()
        .max(1000, 'Description must be less than 1000 characters')
        .optional(),
    priority: z.enum(['low', 'medium', 'high'], {
        errorMap: () => ({ message: 'Priority must be low, medium, or high' })
    }),
    photoFile: z.instanceof(File)
        .optional()
        .refine(
            (file) => !file || file.size <= 5 * 1024 * 1024,
            'Photo must be less than 5MB'
        )
        .refine(
            (file) => !file || file.type.startsWith('image/'),
            'File must be an image'
        )
})

export const issueUpdateSchema = z.object({
    title: z.string()
        .min(5, 'Title must be at least 5 characters')
        .max(200, 'Title must be less than 200 characters')
        .optional(),
    description: z.string()
        .max(1000, 'Description must be less than 1000 characters')
        .optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
    photoFile: z.instanceof(File)
        .optional()
        .refine(
            (file) => !file || file.size <= 5 * 1024 * 1024,
            'Photo must be less than 5MB'
        )
        .refine(
            (file) => !file || file.type.startsWith('image/'),
            'File must be an image'
        )
})

// ==================== BUDGET SCHEMAS ====================

export const budgetSchema = z.object({
    category: z.string()
        .min(2, 'Category must be at least 2 characters')
        .max(50, 'Category must be less than 50 characters'),
    allocated: z.number()
        .positive('Budget must be a positive number')
        .max(1000000000, 'Budget is too large'),
    description: z.string()
        .max(200, 'Description must be less than 200 characters')
        .optional()
})

export const expenseSchema = z.object({
    category: z.string()
        .min(2, 'Category is required'),
    amount: z.number()
        .positive('Amount must be a positive number')
        .max(1000000000, 'Amount is too large'),
    description: z.string()
        .min(3, 'Description must be at least 3 characters')
        .max(200, 'Description must be less than 200 characters'),
    date: z.date().or(z.string()),
    receipt: z.instanceof(File)
        .optional()
        .refine(
            (file) => !file || file.size <= 10 * 1024 * 1024,
            'Receipt must be less than 10MB'
        )
        .refine(
            (file) => !file || ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type),
            'Receipt must be an image or PDF'
        )
})

// ==================== TASK SCHEMAS ====================

export const taskSchema = z.object({
    taskName: z.string()
        .min(3, 'Task name must be at least 3 characters')
        .max(100, 'Task name must be less than 100 characters'),
    startDate: z.date().or(z.string()),
    endDate: z.date().or(z.string()),
    status: z.enum(['pending', 'in_progress', 'completed']).optional(),
    assignedTo: z.string().optional()
}).refine((data) => {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    return end >= start
}, {
    message: 'End date must be after start date',
    path: ['endDate']
})

// ==================== FILE UPLOAD SCHEMAS ====================

export const fileUploadSchema = z.object({
    file: z.instanceof(File)
        .refine((file) => file.size > 0, 'File is required')
        .refine(
            (file) => file.size <= 10 * 1024 * 1024,
            'File must be less than 10MB'
        )
        .refine(
            (file) => {
                const allowedTypes = [
                    'application/pdf',
                    'image/jpeg',
                    'image/jpg',
                    'image/png',
                    'image/webp',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ]
                return allowedTypes.includes(file.type)
            },
            'Invalid file type. Allowed: PDF, Images, Word documents'
        ),
    name: z.string()
        .min(1, 'File name is required')
        .max(100, 'File name must be less than 100 characters')
        .optional()
})

export const avatarUploadSchema = z.object({
    file: z.instanceof(File)
        .refine((file) => file.size > 0, 'Avatar is required')
        .refine(
            (file) => file.size <= 5 * 1024 * 1024,
            'Avatar must be less than 5MB'
        )
        .refine(
            (file) => file.type.startsWith('image/'),
            'Avatar must be an image'
        )
        .refine(
            (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
            'Avatar must be JPEG, PNG, or WebP'
        )
})

export const blueprintUploadSchema = z.object({
    file: z.instanceof(File)
        .refine((file) => file.size > 0, 'Blueprint is required')
        .refine(
            (file) => file.size <= 20 * 1024 * 1024,
            'Blueprint must be less than 20MB'
        )
        .refine(
            (file) => {
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
                return allowedTypes.includes(file.type)
            },
            'Blueprint must be an image or PDF'
        ),
    name: z.string()
        .min(1, 'Blueprint name is required')
        .max(100, 'Blueprint name must be less than 100 characters')
})

// ==================== PROGRESS PHOTO SCHEMAS ====================

export const progressPhotoSchema = z.object({
    photo: z.instanceof(File)
        .refine((file) => file.size > 0, 'Photo is required')
        .refine(
            (file) => file.size <= 15 * 1024 * 1024,
            'Photo must be less than 15MB'
        )
        .refine(
            (file) => file.type.startsWith('image/'),
            'File must be an image'
        ),
    caption: z.string()
        .max(200, 'Caption must be less than 200 characters')
        .optional(),
    date: z.date().or(z.string()).optional()
})

// ==================== TEAM MEMBER SCHEMAS ====================

export const teamMemberSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    role: z.enum(['owner', 'editor', 'viewer'], {
        errorMap: () => ({ message: 'Role must be owner, editor, or viewer' })
    })
})

// ==================== INVENTORY SCHEMAS ====================

export const inventoryItemSchema = z.object({
    name: z.string()
        .min(2, 'Item name must be at least 2 characters')
        .max(100, 'Item name must be less than 100 characters'),
    category: z.string()
        .min(2, 'Category is required')
        .max(50, 'Category must be less than 50 characters'),
    quantity: z.number()
        .int('Quantity must be a whole number')
        .nonnegative('Quantity cannot be negative'),
    unit: z.string()
        .min(1, 'Unit is required')
        .max(20, 'Unit must be less than 20 characters'),
    costPerUnit: z.number()
        .nonnegative('Cost cannot be negative')
        .max(1000000, 'Cost is too large')
        .optional(),
    supplier: z.string()
        .max(100, 'Supplier name must be less than 100 characters')
        .optional()
})

// ==================== COMMENT SCHEMAS ====================

export const commentSchema = z.object({
    content: z.string()
        .min(1, 'Comment cannot be empty')
        .max(500, 'Comment must be less than 500 characters')
})

// ==================== PROFILE UPDATE SCHEMAS ====================

export const profileUpdateSchema = z.object({
    displayName: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters')
        .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
        .optional(),
    avatar: z.string().url('Invalid avatar URL').optional()
})

// ==================== TYPE EXPORTS ====================

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ProjectInput = z.infer<typeof projectSchema>
export type IssueInput = z.infer<typeof issueSchema>
export type BudgetInput = z.infer<typeof budgetSchema>
export type ExpenseInput = z.infer<typeof expenseSchema>
export type TaskInput = z.infer<typeof taskSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>
export type TeamMemberInput = z.infer<typeof teamMemberSchema>
export type InventoryItemInput = z.infer<typeof inventoryItemSchema>
export type CommentInput = z.infer<typeof commentSchema>
