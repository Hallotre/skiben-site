import { createClient } from '@/utils/supabase/server'
import { UserRole } from '@/types'

// This file should only be used in Server Components
// For client components, use the functions from usePermissions() hook

export async function checkRole(requiredRoles: UserRole[]): Promise<boolean> {
  // This will be imported dynamically only in server components
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_banned')
    .eq('id', user.id)
    .single()
  
  if (!profile) return false
  
  const isBanned = profile.is_banned === true
  const hasRequiredRole = requiredRoles.includes(profile.role as UserRole)
  
  return !isBanned && hasRequiredRole
}

export async function getUserProfile() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return profile
}

export async function isModerator(): Promise<boolean> {
  return checkRole(['MODERATOR', 'STREAMER', 'ADMIN'])
}

export async function isStreamer(): Promise<boolean> {
  return checkRole(['STREAMER', 'ADMIN'])
}

export async function isAdmin(): Promise<boolean> {
  return checkRole(['ADMIN'])
}

export async function hasAdminPrivileges(): Promise<boolean> {
  return checkRole(['ADMIN'])
}

export async function isAuthenticated(): Promise<boolean> {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}
