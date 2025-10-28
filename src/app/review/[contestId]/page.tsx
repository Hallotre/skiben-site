import RoleGuard from '@/components/auth/RoleGuard'
import ReviewInterface from '@/components/review/ReviewInterface'
import { UserRole } from '@/types'

interface ReviewContestPageProps {
  params: Promise<{
    contestId: string
  }>
}

export default async function ReviewContestPage({ params }: ReviewContestPageProps) {
  const { contestId } = await params
  
  return (
    <RoleGuard requiredRoles={['STREAMER']}>
      <ReviewInterface contestId={contestId} />
    </RoleGuard>
  )
}
