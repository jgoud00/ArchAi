import { format } from 'date-fns'
import { UserPlus, X } from 'lucide-react'
import { TeamMember } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { memo } from 'react'

interface ProjectMembersProps {
    team: TeamMember[]
    isOwner: boolean
    onInvite: () => void
    onRemoveMember: (memberId: string) => void
}

export const ProjectMembers = memo(({
    team,
    isOwner,
    onInvite,
    onRemoveMember,
}: ProjectMembersProps) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Team Members</h2>
                {isOwner && (
                    <Button onClick={onInvite}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Member
                    </Button>
                )}
            </div>

            <div className="space-y-2">
                {team.map((member) => (
                    <Card key={member.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="font-medium">{member.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                                        {member.role}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        Joined {format(member.joinedAt, 'MMM dd, yyyy')}
                                    </span>
                                </div>
                            </div>
                            {isOwner && member.role !== 'owner' && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        if (confirm('Remove this member from the project?')) {
                                            onRemoveMember(member.id)
                                        }
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
})

ProjectMembers.displayName = 'ProjectMembers'
