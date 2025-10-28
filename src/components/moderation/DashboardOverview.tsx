'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Video, Clock, CheckCircle, XCircle, Trophy, Users, Shield, Star, Ban } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface SubmissionStats {
  total: number
  unapproved: number
  approved: number
  denied: number
  winners: number
}

interface UserStats {
  total: number
  viewers: number
  moderators: number
  streamers: number
  admins: number
  banned: number
}

interface DashboardOverviewProps {
  selectedContest: string | null
  allContests: any[]
}

export default function DashboardOverview({ selectedContest, allContests }: DashboardOverviewProps) {
  const [stats, setStats] = useState<SubmissionStats>({
    total: 0,
    unapproved: 0,
    approved: 0,
    denied: 0,
    winners: 0
  })
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    viewers: 0,
    moderators: 0,
    streamers: 0,
    admins: 0,
    banned: 0
  })
  const [contestData, setContestData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [selectedContest])

  const fetchStats = async () => {
    try {
      let query = supabase
        .from('submissions')
        .select('status')
      
      if (selectedContest && selectedContest !== 'all') {
        query = query.eq('contest_id', selectedContest)
      }
      
      const { data: submissions } = await query

      if (submissions) {
        setStats({
          total: submissions.length,
          unapproved: submissions.filter(s => s.status === 'UNAPPROVED').length,
          approved: submissions.filter(s => s.status === 'APPROVED').length,
          denied: submissions.filter(s => s.status === 'DENIED').length,
          winners: submissions.filter(s => s.status === 'WINNER').length
        })
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('role, is_banned')

      if (profiles) {
        setUserStats({
          total: profiles.length,
          viewers: profiles.filter(p => p.role === 'VIEWER' && !p.is_banned).length,
          moderators: profiles.filter(p => p.role === 'MODERATOR' && !p.is_banned).length,
          streamers: profiles.filter(p => p.role === 'STREAMER' && !p.is_banned).length,
          admins: profiles.filter(p => p.role === 'ADMIN' && !p.is_banned).length,
          banned: profiles.filter(p => p.is_banned).length
        })
      }

      // Fetch contest performance data
      const { data: contests } = await supabase
        .from('contests')
        .select('*, submission_count:submissions(count)')
        .order('created_at', { ascending: false })
        .limit(5)

      if (contests) {
        const performanceData = contests.map(contest => ({
          name: contest.title?.substring(0, 10) || `#${contest.display_number || '?'}`,
          submissions: Array.isArray(contest.submission_count) ? contest.submission_count.length : contest.submission_count || 0,
          contest
        }))
        setContestData(performanceData)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <p className="mt-6 text-lg text-slate-400">Laster dashbordstatistikk...</p>
      </div>
    )
  }

  const approvalRate = stats.total > 0 ? parseFloat(((stats.approved / stats.total) * 100).toFixed(1)) : 0

  // Chart data
  const submissionData = [
    { name: 'Godkjent', value: stats.approved, color: '#22c55e' },
    { name: 'Ventende', value: stats.unapproved, color: '#eab308' },
    { name: 'Avslått', value: stats.denied, color: '#ef4444' },
    { name: 'Vinnere', value: stats.winners, color: '#a855f7' },
  ]


  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <Card className="border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium text-slate-400">{title}</p>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const selectedContestInfo = allContests.find(c => c.id === selectedContest)

  return (
    <div className="space-y-8">
      {/* Key Metrics Header */}
      <div className="pb-4 border-b border-slate-800">
        <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
          <Video className="h-6 w-6 text-blue-500" />
          Innsendingsstatistikk
        </h3>
        {selectedContestInfo && selectedContest !== 'all' && (
          <p className="text-sm text-slate-400 flex items-center gap-2">
            <Trophy className="h-3 w-3" />
            Konkurranse: {selectedContestInfo.title}
          </p>
        )}
        {(!selectedContest || selectedContest === 'all') && (
          <p className="text-sm text-slate-400">Oversikt over alle konkurranser</p>
        )}
      </div>

      {/* Key Metrics */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard 
            title="Totalt" 
          value={stats.total}
            icon={Video}
            colorClass="bg-blue-500/10 text-blue-500"
        />
          <StatCard 
            title="Ventende" 
          value={stats.unapproved}
            icon={Clock}
            colorClass="bg-yellow-500/10 text-yellow-500"
          />
          <StatCard 
            title="Godkjent" 
            value={stats.approved} 
            icon={CheckCircle}
            colorClass="bg-green-500/10 text-green-500"
          />
          <StatCard 
            title="Avslått" 
            value={stats.denied} 
            icon={XCircle}
            colorClass="bg-red-500/10 text-red-500"
          />
          <StatCard 
            title="Vinnere" 
            value={stats.winners} 
            icon={Trophy}
            colorClass="bg-purple-500/10 text-purple-500"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submission Status Chart */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Status på innsendinger</CardTitle>
            {selectedContest && selectedContest !== 'all' && (
              <p className="text-xs text-slate-400 mt-1">Viser data kun for valgt konkurranse</p>
            )}
            {(!selectedContest || selectedContest === 'all') && (
              <p className="text-xs text-slate-400 mt-1">Viser data for alle konkurranser</p>
            )}
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={submissionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  itemStyle={{ color: '#ffffff' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {submissionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            </CardContent>
          </Card>

        {/* Contest Performance Chart */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Topp 5 konkurranser etter innsendinger</CardTitle>
            <p className="text-xs text-slate-400 mt-1">Sammenligning av alle konkurranser</p>
          </CardHeader>
          <CardContent>
            {contestData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-slate-400">Ingen konkurransedata tilgjengelig</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={contestData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    itemStyle={{ color: '#ffffff' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="submissions" radius={[8, 8, 0, 0]} fill="#3b82f6">
                    {contestData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#a855f7', '#ec4899', '#eab308', '#22c55e'][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Quick User Stats */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white">Brukeroppsummering</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50">
              <Users className="h-4 w-4 text-cyan-500" />
              <div>
                <p className="text-xs text-slate-400">Antall brukere</p>
                <p className="text-lg font-bold text-white">{userStats.total}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50">
              <Shield className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-slate-400">Administratorer</p>
                <p className="text-lg font-bold text-white">{userStats.admins}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50">
              <Star className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-xs text-slate-400">Streamere</p>
                <p className="text-lg font-bold text-white">{userStats.streamers}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-slate-400">Seere</p>
                <p className="text-lg font-bold text-white">{userStats.viewers}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50">
              <Ban className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-xs text-slate-400">Utestengt</p>
                <p className="text-lg font-bold text-white">{userStats.banned}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


