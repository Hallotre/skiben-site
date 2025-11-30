'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/providers/UserProvider'
import { UserRole } from '@/types'

interface RoleGuardProps {
  children: React.ReactNode
  requiredRoles: UserRole[]
  fallback?: React.ReactNode
}

export default function RoleGuard({ 
  children, 
  requiredRoles, 
  fallback = <div className="text-center py-8">Access denied. You don't have permission to view this page.</div> 
}: RoleGuardProps) {
  const router = useRouter()
  const { checkRole, loading } = useUser()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  
  useEffect(() => {
    if (loading) return

    const access = checkRole(requiredRoles)
    setHasAccess(access)

    if (!access) {
      // Redirect to home if no access
      router.push('/')
    }
  }, [loading, requiredRoles, checkRole, router])

  if (loading || hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (hasAccess === false) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
