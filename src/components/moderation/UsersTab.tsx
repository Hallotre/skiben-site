'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Profile, UserRole } from '@/types'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { User, Ban, Trash2, Shield, Star, Eye, MoreVertical, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function UsersTab() {
  const [users, setUsers] = useState<Profile[]>([])
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | UserRole>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
    fetchCurrentUser()
  }, [filter, searchQuery])

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

      if (searchQuery) {
        query = query.ilike('username', `%${searchQuery}%`)
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

  const isStreamer = currentUser?.role === 'STREAMER'
  const isModerator = currentUser?.role === 'MODERATOR'

  const handleBanToggle = async (userId: string, currentlyBanned: boolean) => {
    const targetUser = users.find(u => u.id === userId)
    
    // Check permissions based on role hierarchy
    if (!isAdmin) {
      if (targetUser?.role === 'ADMIN') {
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
    
    // Enforce role hierarchy - only ADMIN can change roles
    if (!isAdmin) {
      alert('Only admins can change user roles')
      return
    }
    
    // Additional protection for admin role assignment
    if (newRole === 'ADMIN' || targetUser?.role === 'ADMIN') {
      if (!confirm('Are you sure you want to change ADMIN role? This is a sensitive operation.')) {
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield className="h-4 w-4" />
      case 'STREAMER': return <Star className="h-4 w-4" />
      case 'MODERATOR': return <User className="h-4 w-4" />
      default: return <Eye className="h-4 w-4" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'STREAMER': return 'bg-pink-500/20 text-pink-400 border-pink-500/30'
      case 'MODERATOR': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
  }

  const isAdmin = currentUser?.role === 'ADMIN'

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <p className="mt-6 text-lg text-slate-400">
          Laster inn brukerdata...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Brukeradministrasjon</h2>
        <p className="text-slate-400 mt-2">
          Administrer brukerkontoer og rettigheter på plattformen
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="border-slate-800 bg-slate-900/50">
        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Søk etter brukere..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {(['ALL', 'VIEWER', 'MODERATOR', 'STREAMER', 'ADMIN'] as const).map((role) => (
              <Button
                key={role}
                variant={filter === role ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(role)}
                className={filter === role ? '' : 'border-slate-700'}
              >
                {role === 'ALL' && 'ALLE'}
                {role === 'VIEWER' && 'SEER'}
                {role === 'MODERATOR' && 'MODERATOR'}
                {role === 'STREAMER' && 'STREAMER'}
                {role === 'ADMIN' && 'ADMIN'}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Users Table */}
      {users.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50 text-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="p-4 rounded-full bg-slate-800">
              <User className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-400">Ingen brukere funnet</p>
          </div>
        </Card>
      ) : (
        <Card className="border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="font-semibold text-slate-300">Bruker</TableHead>
                  <TableHead className="font-semibold text-slate-300">Rolle</TableHead>
                  <TableHead className="font-semibold text-slate-300">Status</TableHead>
                  <TableHead className="font-semibold text-slate-300">Ble med</TableHead>
                  {isAdmin && <TableHead className="font-semibold text-right text-slate-300">Handlinger</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {user.avatar_url ? (
                            <AvatarImage src={user.avatar_url} alt={user.username} />
                          ) : (
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">{user.username}</p>
                          <p className="text-sm text-slate-400">{user.twitch_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="min-w-[120px] bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800">
                            <SelectItem value="VIEWER">
                              <span className="text-white">Seer</span>
                            </SelectItem>
                            <SelectItem value="MODERATOR">
                              <span className="text-white">Moderator</span>
                            </SelectItem>
                            <SelectItem value="STREAMER">
                              <span className="text-white">Streamer</span>
                            </SelectItem>
                            <SelectItem value="ADMIN">
                              <span className="text-white">Admin</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                          <div className="flex items-center gap-1.5">
                            {getRoleIcon(user.role)}
                            {user.role}
                          </div>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                        <Badge variant={user.is_banned ? 'destructive' : 'default'} className={user.is_banned ? '' : 'bg-green-500/20 text-green-400 border-green-500/30'}>
                          {user.is_banned ? (
                            <>
                              <Ban className="h-3 w-3 mr-1" />
                              Utestengt
                            </>
                          ) : (
                            'Aktiv'
                          )}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBanToggle(user.id, user.is_banned)}
                            className={user.is_banned ? 'border-green-600 text-green-500 hover:bg-green-500/10' : 'border-red-600 text-red-500 hover:bg-red-500/10'}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            {user.is_banned ? 'Opphev utestengelse' : 'Utesteng'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(user.id)}
                            className="border-red-600 text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
