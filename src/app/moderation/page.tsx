import RoleGuard from '@/components/auth/RoleGuard'
import DashboardLayout from '@/components/moderation/DashboardLayout'
import DashboardOverview from '@/components/moderation/DashboardOverview'

export default function ModerationPage() {
  return (
    <RoleGuard requiredRoles={['MODERATOR', 'STREAMER']}>
      <DashboardLayout>
        <DashboardOverview />
      </DashboardLayout>
    </RoleGuard>
  )
}

