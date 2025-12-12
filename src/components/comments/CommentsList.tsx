import { useEffect, useState, useCallback } from 'react'
import { MessageSquare } from 'lucide-react'
import { IssueComment, getIssueComments } from '@/features/projects/services/issueComments'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/hooks/useToast'
import { logger } from '@/utils/logger'

interface CommentsListProps {
    issueId: string
}

export const CommentsList = ({ issueId }: CommentsListProps) => {
    const { showToast } = useToast()
    const [comments, setComments] = useState<IssueComment[]>([])
    const [loading, setLoading] = useState(true)

    const loadComments = useCallback(async () => {
        try {
            setLoading(true)
            const data = await getIssueComments(issueId)
            setComments(data)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load comments'
            showToast(message, 'error')
            logger.error('Failed to load issue comments', err, { issueId })
        } finally {
            setLoading(false)
        }
    }, [issueId, showToast])

    useEffect(() => {
        loadComments()
    }, [loadComments])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Spinner size="md" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No comments yet. Start the discussion!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onCommentUpdated={loadComments}
                        />
                    ))
                )}
            </div>

            <div className="border-t border-border pt-4">
                <CommentForm issueId={issueId} onCommentAdded={loadComments} />
            </div>
        </div>
    )
}
