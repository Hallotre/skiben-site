'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import RoleGuard from '@/components/auth/RoleGuard'
import { usePathname } from 'next/navigation'

export default function ContestSubmissionsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const contestId = pathname.split('/')[3]
  
  // Redirect to main moderation page with contest and submissions tab
  useEffect(() => {
    if (contestId) {
      router.replace(`/moderation?contest=${contestId}&tab=submissions`)
    }
  }, [contestId, router])

  return (
    <RoleGuard requiredRoles={['STREAMER', 'ADMIN']}>
      <div>Redirecting...</div>
    </RoleGuard>
  )
}

