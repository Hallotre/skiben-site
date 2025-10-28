'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import RoleGuard from '@/components/auth/RoleGuard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import DashboardOverview from '@/components/moderation/DashboardOverview'
import ModerationDashboard from '@/components/moderation/ModerationDashboard'
import ContestsTab from '@/components/moderation/ContestsTab'
import WinnersTab from '@/components/moderation/WinnersTab'
import UsersTab from '@/components/moderation/UsersTab'
import TagsTab from '@/components/moderation/TagsTab'
import { LayoutDashboard, Video, Users, Trophy, ListChecks, Shield, Tags } from 'lucide-react'

export default function ModerationPage() {
  const searchParams = useSearchParams()
  const [selectedContest, setSelectedContest] = useState<string | null>(searchParams.get('contest') || 'all')
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'overview')
  const [allContests, setAllContests] = useState<any[]>([])

  useEffect(() => {
    fetchContests()
    
    // Read contest from URL
    const contestParam = searchParams.get('contest')
    if (contestParam) {
      setSelectedContest(contestParam)
    }
    
    // Read tab from URL
    const tabParam = searchParams.get('tab')
    if (tabParam && ['overview', 'submissions', 'contests', 'winners', 'users', 'tags'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  const fetchContests = async () => {
    const { createClient } = await import('@/utils/supabase/client')
    const supabase = createClient()
    const { data: contests } = await supabase
      .from('contests')
      .select('id, title, display_number')
      .order('created_at', { ascending: false })
    
    setAllContests(contests || [])
  }

  const selectedContestInfo = allContests.find(c => c.id === selectedContest)

  return (
    <RoleGuard requiredRoles={['MODERATOR', 'STREAMER', 'ADMIN']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Shield className="h-10 w-10 text-blue-500" />
                Moderasjonsdashbord
              </h1>
              <p className="text-slate-400 text-lg">
                Administrer konkurranser, innsendinger og brukere
              </p>
            </div>

            {/* Global Contest Filter */}
            <div className="flex items-center justify-between p-4 border border-slate-800 bg-slate-900/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-slate-400">Filtrer på konkurranse</p>
                  {selectedContestInfo && selectedContest !== 'all' && (
                    <p className="text-sm text-white mt-1">Aktiv: {selectedContestInfo.title}</p>
                  )}
                  {(!selectedContest || selectedContest === 'all') && (
                    <p className="text-sm text-white mt-1">Viser alle konkurranser</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Select value={selectedContest || 'all'} onValueChange={setSelectedContest}>
                  <SelectTrigger className="w-[280px] bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-blue-500" />
                      <SelectValue placeholder="Filtrer på konkurranse" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="all">
                      <span className="text-white">Alle konkurranser</span>
                    </SelectItem>
                    {allContests.map((contest) => (
                      <SelectItem key={contest.id} value={contest.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="h-4 w-4 flex items-center justify-center p-0 text-xs">
                            {contest.display_number || '?'}
                          </Badge>
                          <span className="text-white">{contest.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedContestInfo && selectedContest !== 'all' && (
                  <Badge className="bg-blue-600 text-white">
                    {selectedContestInfo.title}
                  </Badge>
                )}
                {(!selectedContest || selectedContest === 'all') && (
                  <Badge variant="outline" className="border-slate-700 text-slate-300">
                    Alle konkurranser
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Main Dashboard with Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-slate-900/50 border border-slate-800 w-full justify-start h-auto p-1">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Oversikt
              </TabsTrigger>
              <TabsTrigger 
                value="submissions"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <ListChecks className="h-4 w-4 mr-2" />
                Innsendinger
              </TabsTrigger>
              <TabsTrigger 
                value="contests"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Video className="h-4 w-4 mr-2" />
                Konkurranser
              </TabsTrigger>
              <TabsTrigger 
                value="winners"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Vinnere
              </TabsTrigger>
              <TabsTrigger 
                value="users"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Users className="h-4 w-4 mr-2" />
                Brukere
              </TabsTrigger>
              <TabsTrigger
                value="tags"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Tags className="h-4 w-4 mr-2" />
                Tagger
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <DashboardOverview selectedContest={selectedContest} allContests={allContests} />
            </TabsContent>

            <TabsContent value="submissions" className="mt-6">
              <ModerationDashboard selectedContest={selectedContest} allContests={allContests} />
            </TabsContent>

            <TabsContent value="contests" className="mt-6">
              <ContestsTab />
            </TabsContent>

            <TabsContent value="winners" className="mt-6">
              <WinnersTab contestId={selectedContest !== 'all' ? selectedContest : null} />
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <UsersTab />
            </TabsContent>

            {/* Admin only: Tags */}
            <TabsContent value="tags" className="mt-6">
              <TagsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RoleGuard>
  )
}

