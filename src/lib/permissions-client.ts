'use client'

import { createClient } from '@/utils/supabase/client'
import { UserRole } from '@/types'

// Helper function to add timeout to async operations
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Permission check timed out')), timeoutMs)
    ) as Promise<T>
  ])
}

// Client-side permission helpers for use in client components
export function usePermissions() {
  const supabase = createClient()
  
  const checkRole = async (requiredRoles: UserRole[]): Promise<boolean> => {
    try {
      const getUserPromise = supabase.auth.getUser()
      const { data: { user } } = await withTimeout(getUserPromise, 5000)
      if (!user) return false
      
      const profilePromise = supabase
        .from('profiles')
        .select('role, is_banned')
        .eq('id', user.id)
        .single()
      
      const { data: profile, error } = await withTimeout(profilePromise, 5000)
      
      if (error || !profile) return false
      
      return !profile.is_banned && requiredRoles.includes(profile.role as UserRole)
    } catch (error) {
      console.error('Error checking role:', error)
      return false
    }
  }
  
  return {
    checkRole,
    isModerator: () => checkRole(['MODERATOR', 'STREAMER', 'ADMIN']),
    isStreamer: () => checkRole(['STREAMER', 'ADMIN']),
    isAdmin: () => checkRole(['ADMIN']),
    hasAdminPrivileges: () => checkRole(['ADMIN']),
    isAuthenticated: async () => {
      try {
        const getUserPromise = supabase.auth.getUser()
        const { data: { user } } = await withTimeout(getUserPromise, 5000)
        return !!user
      } catch (error) {
        console.error('Error checking authentication:', error)
        return false
      }
    }
  }
}

