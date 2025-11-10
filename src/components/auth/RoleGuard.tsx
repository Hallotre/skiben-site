'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/lib/permissions-client'
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
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { checkRole } = usePermissions()

  useEffect(() => {
    let isMounted = true
    const checkAccess = async () => {
      try {
        const access = await checkRole(requiredRoles)
        if (!isMounted) return
        
        setHasAccess(access)
        
        if (!access) {
          // Redirect to home if no access
          router.push('/')
        }
      } catch (error) {
        console.error('Error checking permissions:', error)
        if (isMounted) {
          setHasAccess(false)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    checkAccess()
    
    return () => {
      isMounted = false
    }
  }, [requiredRoles, router]) // Removed checkRole from dependencies to avoid infinite loops

  if (loading) {
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

