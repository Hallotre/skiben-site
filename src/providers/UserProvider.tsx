'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Profile, UserRole } from '@/types'
import { User } from '@supabase/supabase-js'

interface UserContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  checkRole: (requiredRoles: UserRole[]) => boolean
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  checkRole: () => false,
})

export const useUser = () => useContext(UserContext)

export default function UserProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }
      return data
    } catch (error) {
      console.error('Error:', error)
      return null
    }
  }

  const refreshProfile = async () => {
    if (!user) return

    const profileData = await fetchProfile(user.id)
    setProfile(profileData)
  }

  useEffect(() => {
    let mounted = true

    const initUser = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        
        if (mounted) {
          setUser(currentUser)
          if (currentUser) {
            const profileData = await fetchProfile(currentUser.id)
            if (mounted) {
              setProfile(profileData)
            }
          }
        }
      } catch (error) {
        console.error('Error initializing user:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (session?.user) {
        setUser(session.user)
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const profileData = await fetchProfile(session.user.id)
          if (mounted) {
            setProfile(profileData)
          }
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      
      if (event === 'INITIAL_SESSION') {
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const checkRole = (requiredRoles: UserRole[]) => {
    if (!profile || profile.is_banned) return false
    return requiredRoles.includes(profile.role)
  }

  return (
    <UserContext.Provider value={{ user, profile, loading, refreshProfile, checkRole }}>
      {children}
    </UserContext.Provider>
  )
}

