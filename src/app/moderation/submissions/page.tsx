'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Submission, SubmissionStatus } from '@/types'
import ModerationDashboard from '@/components/moderation/ModerationDashboard'
import RoleGuard from '@/components/auth/RoleGuard'
import DashboardLayout from '@/components/moderation/DashboardLayout'

export default function SubmissionsPage() {
  return (
    <RoleGuard requiredRoles={['MODERATOR', 'STREAMER']}>
      <DashboardLayout>
        <ModerationDashboard />
      </DashboardLayout>
    </RoleGuard>
  )
}

