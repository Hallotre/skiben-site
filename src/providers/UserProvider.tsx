'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
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
  const initialSessionHandled = useRef(false)
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('Auth state change:', event, session?.user?.email)

      if (session?.user) {
        // Set user immediately from session
        setUser(session.user)
        
        // Fetch profile and then stop loading
        try {
          const profileData = await fetchProfile(session.user.id)
          if (mounted) {
            setProfile(profileData)
            console.log('Profile loaded:', profileData?.role)
          }
        } catch (err) {
          console.error('Profile fetch failed:', err)
        }
      } else {
        setUser(null)
        setProfile(null)
      }

      // Stop loading after processing (whether successful or not)
      if (mounted && !initialSessionHandled.current) {
        initialSessionHandled.current = true
        setLoading(false)
      }
    })

    // Fallback timeout - stop loading even if no auth event fires
    const timeout = setTimeout(() => {
      if (mounted && !initialSessionHandled.current) {
        console.log('Auth timeout - stopping loading')
        initialSessionHandled.current = true
        setLoading(false)
      }
    }, 3000)

    return () => {
      mounted = false
      clearTimeout(timeout)
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

