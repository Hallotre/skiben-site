import RoleGuard from '@/components/auth/RoleGuard'
import ContestSelector from '@/components/review/ContestSelector'
import { UserRole } from '@/types'

export default function ReviewPage() {
  return (
    <RoleGuard requiredRoles={['STREAMER']}>
      <ContestSelector />
    </RoleGuard>
  )
}

