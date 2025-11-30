'use client'

import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/providers/UserProvider'

interface LoginButtonProps {
  className?: string
}

export default function LoginButton({ className = '' }: LoginButtonProps) {
  const { user, loading } = useUser()
  const supabase = createClient()

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'twitch',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) console.error('Error signing in:', error)
  }

  if (loading) {
    return <Spinner size="sm" />
  }

  if (user) {
    return null
  }

  return (
    <Button 
      onClick={handleSignIn}
      className="bg-[#9146ff] hover:bg-[#772ce8] text-white shadow-md shadow-purple-500/20"
    >
      Sign in with Twitch
    </Button>
  )
}
