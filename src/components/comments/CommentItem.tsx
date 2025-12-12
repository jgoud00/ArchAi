import { useState } from 'react'
import { format } from 'date-fns'
import { MoreVertical, Edit, Trash2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { IssueComment } from '@/features/projects/services/issueComments'
import { updateIssueComment, deleteIssueComment } from '@/features/projects/services/issueComments'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useToast } from '@/hooks/useToast'
import { logger } from '@/utils/logger'

interface CommentItemProps {
    comment: IssueComment
    onCommentUpdated: () => void
}

export const CommentItem = ({ comment, onCommentUpdated }: CommentItemProps) => {
    const { user } = useAuthStore()
    const { showToast } = useToast()
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(comment.content)
    const [showMenu, setShowMenu] = useState(false)
    const [updating, setUpdating] = useState(false)

    const isOwner = user?.uid === comment.userId

    const handleUpdate = async () => {
        if (!editContent.trim()) return

        try {
            setUpdating(true)
            await updateIssueComment(comment.id, editContent.trim())
            showToast('Comment updated', 'success')
            setIsEditing(false)
            onCommentUpdated()
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update comment'
            showToast(message, 'error')
            logger.error('Failed to update comment', err, { commentId: comment.id })
        } finally {
            setUpdating(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Delete this comment?')) return

        try {
            await deleteIssueComment(comment.id)
            showToast('Comment deleted', 'success')
            onCommentUpdated()
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete comment'
            showToast(message, 'error')
            logger.error('Failed to delete comment', err, { commentId: comment.id })
        }
    }

    return (
        <div className="flex gap-3 group">
            {comment.user?.avatar ? (
                <img
                    src={comment.user.avatar}
                    alt={comment.user.displayName}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                />
            ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">
                        {comment.user?.displayName.charAt(0).toUpperCase() || '?'}
                    </span>
                </div>
            )}

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comment.user?.displayName || 'Unknown'}</span>
                    <span className="text-xs text-muted-foreground">
                        {format(comment.createdAt, 'MMM d, yyyy h:mm a')}
                    </span>
                    {comment.createdAt.getTime() !== comment.updatedAt.getTime() && (
                        <span className="text-xs text-muted-foreground">(edited)</span>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-2">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            disabled={updating}
                            className="w-full min-h-[60px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                        />
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleUpdate} disabled={updating || !editContent.trim()}>
                                <Check className="w-4 h-4 mr-1" />
                                Save
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setIsEditing(false)
                                    setEditContent(comment.content)
                                }}
                                disabled={updating}
                            >
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
                )}
            </div>

            {isOwner && !isEditing && (
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>

                    {showMenu && (
                        <div className="absolute right-0 top-8 bg-card border border-border rounded-md shadow-lg py-1 min-w-[120px] z-10">
                            <button
                                onClick={() => {
                                    setIsEditing(true)
                                    setShowMenu(false)
                                }}
                                className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => {
                                    setShowMenu(false)
                                    handleDelete()
                                }}
                                className="w-full px-3 py-2 text-sm text-left hover:bg-muted text-destructive flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
