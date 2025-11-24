import { useEffect, useState } from 'react'
import { Shield, User, Users, AlertCircle } from 'lucide-react'
import { getAllUsers, updateUserRole } from '@/services/userManagement'
import { useAuthStore } from '@/store/authStore'
import { User as UserType, UserRole } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import { RoleGuard } from '@/components/RoleGuard'
import { format } from 'date-fns'

export const AdminPanel = () => {
  const { user, isAdmin } = useAuthStore()
  const { showToast } = useToast()
  
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [newRole, setNewRole] = useState<UserRole>('user')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isAdmin()) {
      loadUsers()
    }
  }, [isAdmin])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const usersData = await getAllUsers()
      setUsers(usersData)
    } catch (error: any) {
      showToast(error.message || 'Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEditRole = (userToEdit: UserType) => {
    setSelectedUser(userToEdit)
    setNewRole(userToEdit.role)
    setEditModalOpen(true)
  }

  const handleSaveRole = async () => {
    if (!selectedUser) return

    try {
      setSaving(true)
      await updateUserRole(selectedUser.uid, newRole)
      showToast('User role updated successfully', 'success')
      setEditModalOpen(false)
      setSelectedUser(null)
      loadUsers()
      
      // If updating own role, reload auth
      if (selectedUser.uid === user?.uid) {
        window.location.reload()
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update role', 'error')
    } finally {
      setSaving(false)
    }
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'default'
      case 'supervisor': return 'secondary'
      default: return 'outline'
    }
  }

  const roleCounts = {
    admin: users.filter(u => u.role === 'admin').length,
    supervisor: users.filter(u => u.role === 'supervisor').length,
    user: users.filter(u => u.role === 'user').length,
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">Manage users and roles</p>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{users.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{roleCounts.admin}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Supervisors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{roleCounts.supervisor}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Manage user roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((userItem) => (
                  <div
                    key={userItem.uid}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1">
                        <p className="font-medium">{userItem.displayName}</p>
                        <p className="text-sm text-muted-foreground">{userItem.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Joined {format(userItem.createdAt, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge variant={getRoleBadgeVariant(userItem.role)}>
                        {userItem.role}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRole(userItem)}
                      disabled={userItem.uid === user?.uid}
                    >
                      {userItem.uid === user?.uid ? 'Current User' : 'Edit Role'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Role Modal */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedUser(null)
          }}
          title="Edit User Role"
        >
          <div className="space-y-4">
            {selectedUser && (
              <>
                <div>
                  <p className="text-sm font-medium mb-1">User</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.displayName} ({selectedUser.email})
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="user">User</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {newRole === 'admin' && 'Full system access'}
                    {newRole === 'supervisor' && 'Can manage projects and oversee users'}
                    {newRole === 'user' && 'Standard user access'}
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditModalOpen(false)
                      setSelectedUser(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveRole} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      </div>
    </RoleGuard>
  )
}

