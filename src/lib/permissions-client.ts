'use client'

import { createClient } from '@/utils/supabase/client'
import { UserRole } from '@/types'

// Client-side permission helpers for use in client components
export function usePermissions() {
  const supabase = createClient()
  
  const checkRole = async (requiredRoles: UserRole[]): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_banned')
      .eq('id', user.id)
      .single()
    
    return !!profile && !profile.is_banned && requiredRoles.includes(profile.role as UserRole)
  }
  
  return {
    checkRole,
    isModerator: () => checkRole(['MODERATOR', 'STREAMER', 'ADMIN']),
    isStreamer: () => checkRole(['STREAMER', 'ADMIN']),
    isAdmin: () => checkRole(['ADMIN']),
    hasAdminPrivileges: () => checkRole(['ADMIN']),
    isAuthenticated: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return !!user
    }
  }
}

