'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import RoleGuard from '@/components/auth/RoleGuard'
import DashboardLayout from '@/components/moderation/DashboardLayout'
import DashboardOverview from '@/components/moderation/DashboardOverview'
import ModerationDashboard from '@/components/moderation/ModerationDashboard'
import ContestsTab from '@/components/moderation/ContestsTab'
import WinnersTab from '@/components/moderation/WinnersTab'
import UsersTab from '@/components/moderation/UsersTab'
import TabContent from '@/components/moderation/TabContent'

type TabValue = 'overview' | 'contests' | 'submissions' | 'winners' | 'users'

export default function ModerationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<TabValue>('overview')
  const [selectedContest, setSelectedContest] = useState<string | null>(null)
  const [contestList, setContestList] = useState<any[]>([])
  
  // Read tab and contest from URL params on mount
  useEffect(() => {
    const tab = searchParams.get('tab') as TabValue
    const contest = searchParams.get('contest')
    
    if (tab && ['overview', 'contests', 'submissions', 'winners', 'users'].includes(tab)) {
      setSelectedTab(tab)
    }
    
    if (contest) {
      setSelectedContest(contest)
    }
    
    // Fetch contest list
    fetchContests()
  }, [searchParams])
  
  const fetchContests = async () => {
    const { createClient } = await import('@/utils/supabase/client')
    const supabase = createClient()
    const { data } = await supabase.from('contests').select('*').order('created_at', { ascending: false })
    setContestList(data || [])
  }
  
  const handleTabChange = (tab: string) => {
    const tabValue = tab as TabValue
    setSelectedTab(tabValue)
    const url = selectedContest 
      ? `/moderation?contest=${selectedContest}&tab=${tabValue}`
      : `/moderation?tab=${tabValue}`
    router.push(url, { scroll: false })
  }
  
  const handleContestChange = (contestId: string | null) => {
    setSelectedContest(contestId)
    const url = contestId
      ? `/moderation?contest=${contestId}&tab=${selectedTab}`
      : `/moderation?tab=${selectedTab}`
    router.push(url, { scroll: false })
  }

  return (
    <RoleGuard requiredRoles={['MODERATOR', 'STREAMER', 'ADMIN']}>
      <DashboardLayout 
        selectedTab={selectedTab} 
        onTabChange={handleTabChange}
        selectedContest={selectedContest}
        onContestChange={handleContestChange}
        contestList={contestList}
      >
        <TabContent value="overview" selectedTab={selectedTab}>
          <DashboardOverview contestId={selectedContest} />
        </TabContent>
        
        <TabContent value="submissions" selectedTab={selectedTab}>
          <ModerationDashboard contestId={selectedContest} />
        </TabContent>
        
        <TabContent value="contests" selectedTab={selectedTab}>
          <ContestsTab />
        </TabContent>
        
        <TabContent value="winners" selectedTab={selectedTab}>
          <WinnersTab contestId={selectedContest} />
        </TabContent>
        
        <TabContent value="users" selectedTab={selectedTab}>
          <UsersTab />
        </TabContent>
      </DashboardLayout>
    </RoleGuard>
  )
}

