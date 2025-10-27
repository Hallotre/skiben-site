'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

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

export default function DashboardOverview() {
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
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch submission stats
      const { data: submissions, error: subError } = await supabase
        .from('submissions')
        .select('status')

      if (!subError && submissions) {
        const stats: SubmissionStats = {
          total: submissions.length,
          unapproved: submissions.filter(s => s.status === 'UNAPPROVED').length,
          approved: submissions.filter(s => s.status === 'APPROVED').length,
          denied: submissions.filter(s => s.status === 'DENIED').length,
          winners: submissions.filter(s => s.status === 'WINNER').length
        }
        setStats(stats)
      }

      // Fetch user stats
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_banned')

      if (!profileError && profiles) {
        const stats: UserStats = {
          total: profiles.length,
          viewers: profiles.filter(p => p.role === 'VIEWER' && !p.is_banned).length,
          moderators: profiles.filter(p => p.role === 'MODERATOR' && !p.is_banned).length,
          streamers: profiles.filter(p => p.role === 'STREAMER' && !p.is_banned).length,
          admins: profiles.filter(p => p.role === 'ADMIN' && !p.is_banned).length,
          banned: profiles.filter(p => p.is_banned).length
        }
        setUserStats(stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-gray-300">Manage your moderation workflow from here</p>
      </div>

      {/* Submission Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          icon="📹"
          label="Total Submissions"
          value={stats.total}
          bgColor="bg-blue-600"
          href="/moderation/submissions"
        />
        <StatCard
          icon="⏳"
          label="Unapproved"
          value={stats.unapproved}
          bgColor="bg-yellow-600"
          href="/moderation/submissions?status=UNAPPROVED"
        />
        <StatCard
          icon="✅"
          label="Approved"
          value={stats.approved}
          bgColor="bg-green-600"
          href="/moderation/submissions?status=APPROVED"
        />
        <StatCard
          icon="❌"
          label="Denied"
          value={stats.denied}
          bgColor="bg-red-600"
          href="/moderation/submissions?status=DENIED"
        />
        <StatCard
          icon="🏆"
          label="Winners"
          value={stats.winners}
          bgColor="bg-purple-600"
          href="/moderation/winners"
        />
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <StatCard
          icon="👥"
          label="Total Users"
          value={userStats.total}
          bgColor="bg-indigo-600"
          href="/moderation/users"
        />
        <StatCard
          icon="👀"
          label="Viewers"
          value={userStats.viewers}
          bgColor="bg-blue-500"
          href="/moderation/users?role=VIEWER"
        />
        <StatCard
          icon="🛡️"
          label="Moderators"
          value={userStats.moderators}
          bgColor="bg-orange-500"
          href="/moderation/users?role=MODERATOR"
        />
        <StatCard
          icon="🌟"
          label="Streamers"
          value={userStats.streamers}
          bgColor="bg-pink-500"
          href="/moderation/users?role=STREAMER"
        />
        <StatCard
          icon="👑"
          label="Admins"
          value={userStats.admins}
          bgColor="bg-purple-700"
          href="/moderation/users?role=ADMIN"
        />
        <StatCard
          icon="🚫"
          label="Banned"
          value={userStats.banned}
          bgColor="bg-red-700"
          href="/moderation/users?banned=true"
        />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/moderation/submissions?status=UNAPPROVED"
            className="bg-dark-700 hover:bg-dark-600 p-4 rounded-lg transition-colors"
          >
            <div className="text-yellow-400 text-2xl mb-2">⏳</div>
            <div className="font-semibold text-white">Review Unapproved</div>
            <div className="text-sm text-gray-400">Start moderating new submissions</div>
          </a>
          
          <a
            href="/moderation/winners"
            className="bg-dark-700 hover:bg-dark-600 p-4 rounded-lg transition-colors"
          >
            <div className="text-purple-400 text-2xl mb-2">🏆</div>
            <div className="font-semibold text-white">View Winners</div>
            <div className="text-sm text-gray-400">Extract video links</div>
          </a>
          
          <a
            href="/moderation/users"
            className="bg-dark-700 hover:bg-dark-600 p-4 rounded-lg transition-colors"
          >
            <div className="text-indigo-400 text-2xl mb-2">👥</div>
            <div className="font-semibold text-white">Manage Users</div>
            <div className="text-sm text-gray-400">User management</div>
          </a>
          
          <a
            href="/moderation/submissions"
            className="bg-dark-700 hover:bg-dark-600 p-4 rounded-lg transition-colors"
          >
            <div className="text-blue-400 text-2xl mb-2">📹</div>
            <div className="font-semibold text-white">All Submissions</div>
            <div className="text-sm text-gray-400">View all videos</div>
          </a>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: string
  label: string
  value: number
  bgColor: string
  href: string
}

function StatCard({ icon, label, value, bgColor, href }: StatCardProps) {
  return (
    <a
      href={href}
      className={`${bgColor} hover:opacity-90 rounded-lg p-6 text-white transition-all transform hover:scale-105`}
    >
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </a>
  )
}

