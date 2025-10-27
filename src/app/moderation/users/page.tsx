'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Profile, UserRole } from '@/types'
import RoleGuard from '@/components/auth/RoleGuard'
import DashboardLayout from '@/components/moderation/DashboardLayout'

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | UserRole>('ALL')
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
    fetchCurrentUser()
  }, [filter])

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setCurrentUser(profile)
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'ALL') {
        query = query.eq('role', filter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching users:', error)
        return
      }

      setUsers(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBanToggle = async (userId: string, currentlyBanned: boolean) => {
    try {
      // Check if trying to ban a protected role
      const targetUser = users.find(u => u.id === userId)
      if (targetUser && !isAdmin) {
        // Non-admins cannot ban admins
        if (targetUser.role === 'ADMIN') {
          alert('Only admins can ban other admins')
          return
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !currentlyBanned })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user:', error)
        return
      }

      fetchUsers()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Check if trying to change a protected role
      const targetUser = users.find(u => u.id === userId)
      if (targetUser && !isAdmin) {
        // Only admins can change admin roles
        if (targetUser.role === 'ADMIN' || newRole === 'ADMIN') {
          alert('Only admins can manage admin roles')
          return
        }
        // Streamers and moderators cannot promote to STREAMER
        if (newRole === 'STREAMER' && currentUser?.role !== 'ADMIN') {
          alert('Only admins can assign streamer role')
          return
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user role:', error)
        return
      }

      fetchUsers()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) {
        console.error('Error deleting user:', error)
        return
      }

      fetchUsers()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const isAdmin = currentUser?.role === 'ADMIN'
  const isStreamer = currentUser?.role === 'STREAMER'
  const canManageRoles = isAdmin // Only admins can manage roles

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard requiredRoles={['MODERATOR', 'STREAMER']}>
      <DashboardLayout>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-gray-300">Manage user accounts and permissions</p>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'VIEWER', 'MODERATOR', 'STREAMER', 'ADMIN'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setFilter(role)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === role
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Users List */}
          {users.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">User</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Joined</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {user.avatar_url && (
                            <img
                              src={user.avatar_url}
                              alt={user.username}
                              className="w-10 h-10 rounded-full"
                            />
                          )}
                          <div>
                            <div className="font-medium text-white">{user.username}</div>
                            <div className="text-sm text-gray-400">{user.twitch_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {canManageRoles ? (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="bg-dark-700 text-white rounded px-3 py-1 text-sm"
                            disabled={!isAdmin && user.role === 'ADMIN'}
                          >
                            <option value="VIEWER">Viewer</option>
                            <option value="MODERATOR">Moderator</option>
                            <option value="STREAMER">Streamer</option>
                            {isAdmin && <option value="ADMIN">Admin</option>}
                          </select>
                        ) : (
                          <span className="text-sm text-gray-300">{user.role}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 items-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'ADMIN'
                                ? 'bg-purple-900/20 text-purple-400'
                                : user.role === 'STREAMER'
                                ? 'bg-pink-900/20 text-pink-400'
                                : user.role === 'MODERATOR'
                                ? 'bg-orange-900/20 text-orange-400'
                                : 'bg-blue-900/20 text-blue-400'
                            }`}
                          >
                            {user.role}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.is_banned
                                ? 'bg-red-900/20 text-red-400'
                                : 'bg-green-900/20 text-green-400'
                            }`}
                          >
                            {user.is_banned ? 'Banned' : 'Active'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {canManageRoles && (
                            <button
                              onClick={() => handleBanToggle(user.id, user.is_banned)}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                user.is_banned
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-red-600 hover:bg-red-700 text-white'
                              }`}
                              disabled={!isAdmin && user.role === 'ADMIN'}
                            >
                              {user.is_banned ? 'Unban' : 'Ban'}
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="px-3 py-1 rounded text-sm font-medium transition-colors bg-red-800 hover:bg-red-900 text-white"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  )
}

