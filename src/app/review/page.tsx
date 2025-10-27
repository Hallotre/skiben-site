import RoleGuard from '@/components/auth/RoleGuard'
import ReviewInterface from '@/components/review/ReviewInterface'
import { UserRole } from '@/types'

export default function ReviewPage() {
  return (
    <RoleGuard requiredRoles={['STREAMER']}>
      <ReviewInterface />
    </RoleGuard>
  )
}

