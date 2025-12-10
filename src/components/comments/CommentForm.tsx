import { useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import { createIssueComment } from '@/services/issueComments'
import { logger } from '@/utils/logger'

interface CommentFormProps {
    issueId: string
    onCommentAdded: () => void
}

export const CommentForm = ({ issueId, onCommentAdded }: CommentFormProps) => {
    const { user } = useAuthStore()
    const { showToast } = useToast()
    const [content, setContent] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim() || !user?.uid) return

        try {
            setSubmitting(true)
            await createIssueComment(issueId, user.uid, content.trim())
            setContent('')
            showToast('Comment added successfully', 'success')
            onCommentAdded()
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to add comment'
            showToast(message, 'error')
            logger.error('Failed to create issue comment', err, { issueId })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-start gap-3">
                {user?.avatar ? (
                    <img
                        src={user.avatar}
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                )}
                <div className="flex-1">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Add a comment..."
                        disabled={submitting}
                        className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={!content.trim() || submitting} size="sm">
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
            </div>
        </form>
    )
}
