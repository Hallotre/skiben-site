'use client'

import { createClient } from '@/utils/supabase/client'
import { UserRole } from '@/types'

// Helper function to add timeout to async operations
function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number = 5000): Promise<T> {
  const wrappedPromise = Promise.resolve(promise)
  return Promise.race([
    wrappedPromise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Permission check timed out')), timeoutMs)
    )
  ])
}

// Client-side permission helpers for use in client components
export function usePermissions() {
  const supabase = createClient()
  
  const checkRole = async (requiredRoles: UserRole[]): Promise<boolean> => {
    try {
      const userResponse = await withTimeout(
        supabase.auth.getUser(),
        5000
      ) as { data: { user: { id: string } | null } }
      const user = userResponse.data.user
      if (!user) return false
      
      const profileResponse = await withTimeout(
        supabase
          .from('profiles')
          .select('role, is_banned')
          .eq('id', user.id)
          .single(),
        5000
      ) as { data: { role: string; is_banned: boolean } | null; error: any }

      if (profileResponse.error || !profileResponse.data) return false

      const profile = profileResponse.data
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
        const userResponse = await withTimeout(
          supabase.auth.getUser(),
          5000
        ) as { data: { user: { id: string } | null } }
        return !!userResponse.data.user
      } catch (error) {
        console.error('Error checking authentication:', error)
        return false
      }
    }
  }
}

