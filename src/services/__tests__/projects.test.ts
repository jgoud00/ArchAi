/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Unit tests for projects service
 * Note: Using 'any' for Supabase mock types is acceptable in test files
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createProject, getUserProjects, deleteProject } from '../projects'
import { supabase } from '../supabase'

// Mock Supabase
vi.mock('../supabase', () => ({
    supabase: {
        from: vi.fn(),
        auth: {
            getUser: vi.fn(),
        },
    },
}))

describe('Projects Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('createProject', () => {
        it('should create a new project successfully', async () => {
            const mockProjectData = {
                id: 'test-project-id',
                name: 'Test Project',
                description: 'Test Description',
                owner_id: 'user-123',
            }

            const mockFrom = vi.fn().mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: mockProjectData,
                            error: null,
                        }),
                    }),
                }),
            })

            vi.mocked(supabase.from).mockImplementation(mockFrom as any)

            const result = await createProject('Test Project', 'Test Description', 'user-123')

            expect(result).toBe('test-project-id')
            expect(mockFrom).toHaveBeenCalledWith('projects')
        })

        it('should throw error when creation fails', async () => {
            const mockFrom = vi.fn().mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: { message: 'Database error' },
                        }),
                    }),
                }),
            })

            vi.mocked(supabase.from).mockImplementation(mockFrom as any)

            await expect(
                createProject('Test', 'Description', 'user-123')
            ).rejects.toThrow()
        })
    })

    describe('getUserProjects', () => {
        it('should retrieve user projects successfully', async () => {
            const mockProjects = [
                {
                    id: '1',
                    name: 'Project 1',
                    description: 'Desc 1',
                    owner_id: 'user-123',
                    status: 'active',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ]

            const mockFrom = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue({
                            data: mockProjects,
                            error: null,
                        }),
                    }),
                }),
            })

            vi.mocked(supabase.from).mockImplementation(mockFrom as any)

            const result = await getUserProjects('user-123')

            expect(result).toHaveLength(1)
            expect(result[0].id).toBe('1')
        })
    })

    describe('deleteProject', () => {
        it('should delete project successfully', async () => {
            const mockFrom = vi.fn().mockReturnValue({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        error: null,
                    }),
                }),
            })

            vi.mocked(supabase.from).mockImplementation(mockFrom as any)

            await expect(deleteProject('project-123')).resolves.not.toThrow()
        })
    })
})
