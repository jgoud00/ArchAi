/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Issues Service Tests
 * 
 * Unit tests for issues CRUD operations (any types acceptable for mocks)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { supabase } from '@/services/supabase'
import { getProjectIssues, createIssue, updateIssue, deleteIssue } from '../issues'

// Mock Supabase
vi.mock('@/services/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(),
            order: vi.fn().mockReturnThis(),
        })),
        storage: {
            from: vi.fn(() => ({
                upload: vi.fn(),
                getPublicUrl: vi.fn(),
                remove: vi.fn(),
            })),
        },
    },
}))

describe('Issues Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getProjectIssues', () => {
        it('should fetch issues for a project', async () => {
            const mockIssues = [
                {
                    id: '123',
                    projectId: 'proj-1',
                    title: 'Test Issue',
                    description: 'Test description',
                    priority: 'high',
                    status: 'open',
                },
            ]

            const mockResponse = { data: mockIssues, error: null }
            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue(mockResponse),
                    }),
                }),
            } as any)

            const result = await getProjectIssues('proj-1')

            expect(result).toEqual(mockIssues)
            expect(supabase.from).toHaveBeenCalledWith('issues')
        })

        it('should return empty array when no issues found', async () => {
            const mockResponse = { data: [], error: null }

            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue(mockResponse),
                    }),
                }),
            } as any)

            const result = await getProjectIssues('nonexistent-project')

            expect(result).toEqual([])
        })

        it('should throw error on database failure', async () => {
            const mockError = { message: 'Database error', code: '500' }

            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
                    }),
                }),
            } as any)

            await expect(getProjectIssues('proj-1')).rejects.toThrow('Database error')
        })
    })

    describe('createIssue', () => {
        it('should create a new issue without photo', async () => {
            const mockResponse = { data: { id: 'issue-123' }, error: null }

            vi.mocked(supabase.from).mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue(mockResponse),
                    }),
                }),
            } as any)

            const issueId = await createIssue(
                'proj-1',
                'New Issue',
                'Issue description',
                'high',
                'user-1'
            )

            expect(issueId).toBe('issue-123')
        })

        it('should throw error when creation fails', async () => {
            const mockError = { message: 'Creation failed' }

            vi.mocked(supabase.from).mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
                    }),
                }),
            } as any)

            await expect(
                createIssue('proj-1', 'New Issue', 'Description', 'high', 'user-1')
            ).rejects.toThrow('Creation failed')
        })
    })

    describe('updateIssue', () => {
        it('should update issue successfully', async () => {
            const mockResponse = { data: null, error: null }

            vi.mocked(supabase.from).mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue(mockResponse),
                }),
            } as any)

            await expect(
                updateIssue('issue-1', { title: 'Updated Title' })
            ).resolves.not.toThrow()
        })
    })

    describe('deleteIssue', () => {
        it('should delete issue successfully', async () => {
            const mockResponse = { data: null, error: null }

            vi.mocked(supabase.from).mockReturnValue({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue(mockResponse),
                    }),
                }),
            } as any)

            // Mock storage for photo deletion check
            vi.mocked(supabase.storage.from).mockReturnValue({
                remove: vi.fn().mockResolvedValue({ data: null, error: null }),
            } as any)

            await expect(deleteIssue('issue-1')).resolves.not.toThrow()
        })
    })
})
