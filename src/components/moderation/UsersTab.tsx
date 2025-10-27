'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Profile, UserRole } from '@/types'
import { Box, Typography, Card, CardContent, CircularProgress, Table, TableHead, TableBody, TableRow, TableCell, Chip, Button, Select, MenuItem } from '@mui/material'
import { alpha } from '@mui/material/styles'
import PersonIcon from '@mui/icons-material/Person'
import BlockIcon from '@mui/icons-material/Block'
import DeleteIcon from '@mui/icons-material/Delete'

export default function UsersTab() {
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
    const targetUser = users.find(u => u.id === userId)
    if (targetUser && !isAdmin) {
      if (targetUser.role === 'ADMIN') {
        alert('Only admins can ban other admins')
        return
      }
    }

    try {
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
    const targetUser = users.find(u => u.id === userId)
    if (targetUser && !isAdmin) {
      if (targetUser.role === 'ADMIN' || newRole === 'ADMIN') {
        alert('Only admins can manage admin roles')
        return
      }
      if (newRole === 'STREAMER' && currentUser?.role !== 'ADMIN') {
        alert('Only admins can assign streamer role')
        return
      }
    }

    try {
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 3 }}>
          Loading users...
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          fontWeight={800} 
          gutterBottom
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          👥 User Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          Manage user accounts and permissions
        </Typography>
      </Box>

      {/* Filter */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {(['ALL', 'VIEWER', 'MODERATOR', 'STREAMER', 'ADMIN'] as const).map((role) => (
            <Chip
              key={role}
              label={role}
              onClick={() => setFilter(role)}
              clickable
              sx={{
                bgcolor: filter === role ? 'primary.main' : 'rgba(255, 255, 255, 0.05)',
                color: filter === role ? 'white' : 'text.secondary',
                fontWeight: filter === role ? 700 : 500,
                '&:hover': {
                  bgcolor: filter === role ? 'primary.dark' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Users List */}
      {users.length === 0 ? (
        <Card elevation={0} sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid', borderColor: 'divider', textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">No users found</Typography>
        </Card>
      ) : (
        <Card elevation={0} sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Joined</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.username}
                            style={{ width: 40, height: 40, borderRadius: '50%' }}
                          />
                        ) : (
                          <PersonIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                        )}
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{user.username}</Typography>
                          <Typography variant="caption" color="text.secondary">{user.twitch_id}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <Select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          size="small"
                          sx={{ 
                            minWidth: 120,
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                          }}
                          disabled={!isAdmin && user.role === 'ADMIN'}
                        >
                          <MenuItem value="VIEWER">Viewer</MenuItem>
                          <MenuItem value="MODERATOR">Moderator</MenuItem>
                          <MenuItem value="STREAMER">Streamer</MenuItem>
                          {isAdmin && <MenuItem value="ADMIN">Admin</MenuItem>}
                        </Select>
                      ) : (
                        <Chip 
                          label={user.role} 
                          size="small"
                          sx={{
                            bgcolor: alpha('#6366f1', 0.2),
                            color: '#6366f1',
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                          label={user.role} 
                          size="small"
                          sx={{
                            bgcolor: 
                              user.role === 'ADMIN' ? alpha('#a855f7', 0.2) :
                              user.role === 'STREAMER' ? alpha('#ec4899', 0.2) :
                              user.role === 'MODERATOR' ? alpha('#f59e0b', 0.2) :
                              alpha('#3b82f6', 0.2),
                            color: 
                              user.role === 'ADMIN' ? '#a855f7' :
                              user.role === 'STREAMER' ? '#ec4899' :
                              user.role === 'MODERATOR' ? '#f59e0b' :
                              '#3b82f6',
                            fontWeight: 600,
                          }}
                        />
                        <Chip 
                          label={user.is_banned ? 'Banned' : 'Active'} 
                          size="small"
                          icon={user.is_banned ? <BlockIcon /> : undefined}
                          sx={{
                            bgcolor: user.is_banned ? alpha('#ef4444', 0.2) : alpha('#22c55e', 0.2),
                            color: user.is_banned ? '#ef4444' : '#22c55e',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(user.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {isAdmin && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleBanToggle(user.id, user.is_banned)}
                            sx={{
                              bgcolor: user.is_banned ? '#22c55e' : '#ef4444',
                              '&:hover': {
                                bgcolor: user.is_banned ? '#16a34a' : '#dc2626',
                              },
                            }}
                            disabled={!isAdmin && user.role === 'ADMIN'}
                          >
                            {user.is_banned ? 'Unban' : 'Ban'}
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteUser(user.id)}
                            sx={{
                              borderColor: '#ef4444',
                              color: '#ef4444',
                              '&:hover': {
                                borderColor: '#dc2626',
                                bgcolor: alpha('#ef4444', 0.1),
                              },
                            }}
                          >
                            Delete
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Card>
      )}
    </Box>
  )
}

