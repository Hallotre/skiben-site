'use client'

import { useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Grid,
  Paper,
  Divider,
  Chip,
  alpha,
  IconButton,
} from '@mui/material'
import {
  VideoLibrary as VideoLibraryIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  EmojiEvents as TrophyIcon,
  People as PeopleIcon,
  Shield as ShieldIcon,
  Star as StarIcon,
  AdminPanelSettings as AdminIcon,
  Block as BlockIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material'
import Link from 'next/link'

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
  contestId?: string | null
}

export default function DashboardOverview({ contestId = null }: DashboardOverviewProps) {
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
  }, [contestId])

  const fetchStats = async () => {
    try {
      // Fetch submission stats
      let query = supabase
        .from('submissions')
        .select('status')
      
      // Filter by contest if specified
      if (contestId) {
        query = query.eq('contest_id', contestId)
      }
      
      const { data: submissions, error: subError } = await query

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
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 3 }}>
          Loading dashboard...
        </Typography>
      </Box>
    )
  }

  const approvalRate = stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          fontWeight={700} 
          gutterBottom
          sx={{
            color: 'text.primary',
          }}
        >
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and monitor your submissions and users
        </Typography>
      </Box>

      {/* Key Metrics Row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        <MetricCard
          title="Total Submissions"
          value={stats.total}
          icon={<VideoLibraryIcon />}
          color="#3b82f6"
          href="/moderation/submissions"
        />
        <MetricCard
          title="Pending Review"
          value={stats.unapproved}
          icon={<TimeIcon />}
          color="#eab308"
          href="/moderation/submissions?status=UNAPPROVED"
          urgent={stats.unapproved > 0}
        />
        <MetricCard
          title="Approval Rate"
          value={`${approvalRate}%`}
          icon={<TrendingUpIcon />}
          color="#22c55e"
          stat={`${stats.approved} of ${stats.total}`}
        />
      </Box>

      {/* Detailed Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 3 }}>
        {/* Submissions Section */}
        <Box>
          <Card elevation={0} sx={{ bgcolor: 'rgba(26, 26, 46, 0.6)', border: '1px solid', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                  <VideoLibraryIcon sx={{ fontSize: 20 }} />
                  Submissions
                </Typography>
                <Link href="/moderation/submissions" style={{ textDecoration: 'none' }}>
                  <Chip 
                    label="View All" 
                    size="small"
                    clickable
                    icon={<ArrowForwardIcon />}
                    sx={{ fontSize: '0.75rem' }}
                  />
                </Link>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
                <StatusBox
                  status="UNAPPROVED"
                  count={stats.unapproved}
                  icon={<TimeIcon />}
                  color="#eab308"
                  href="/moderation/submissions?status=UNAPPROVED"
                />
                <StatusBox
                  status="APPROVED"
                  count={stats.approved}
                  icon={<CheckIcon />}
                  color="#22c55e"
                  href="/moderation/submissions?status=APPROVED"
                />
                <StatusBox
                  status="DENIED"
                  count={stats.denied}
                  icon={<CancelIcon />}
                  color="#ef4444"
                  href="/moderation/submissions?status=DENIED"
                />
                <StatusBox
                  status="WINNERS"
                  count={stats.winners}
                  icon={<TrophyIcon />}
                  color="#a855f7"
                  href="/moderation/winners"
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Users Section */}
        <Box>
          <Card elevation={0} sx={{ bgcolor: 'rgba(26, 26, 46, 0.6)', border: '1px solid', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                <PeopleIcon sx={{ fontSize: 20 }} />
                Users
              </Typography>
              <Box sx={{ mt: 2, space: 2 }}>
                <UserMetric label="Total" value={userStats.total} icon={<PeopleIcon />} />
                <UserMetric label="Moderators" value={userStats.moderators} icon={<ShieldIcon />} />
                <UserMetric label="Streamers" value={userStats.streamers} icon={<StarIcon />} />
                <UserMetric label="Admins" value={userStats.admins} icon={<AdminIcon />} />
                <UserMetric label="Banned" value={userStats.banned} icon={<BlockIcon />} color="#ef4444" />
              </Box>
              <Link href="/moderation/users" style={{ textDecoration: 'none' }}>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', color: 'primary.main', cursor: 'pointer' }}>
                  <Typography variant="caption" sx={{ mr: 1 }}>Manage Users</Typography>
                  <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </Box>
              </Link>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3, color: 'text.primary' }}>Quick Actions</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          <ActionButton
            title="Review Pending"
            icon={<TimeIcon />}
            color="#eab308"
            href="/moderation/submissions?status=UNAPPROVED"
          />
          <ActionButton
            title="View Winners"
            icon={<TrophyIcon />}
            color="#a855f7"
            href="/moderation/winners"
          />
          <ActionButton
            title="All Submissions"
            icon={<VideoLibraryIcon />}
            color="#3b82f6"
            href="/moderation/submissions"
          />
          <ActionButton
            title="User Management"
            icon={<PeopleIcon />}
            color="#6366f1"
            href="/moderation/users"
          />
        </Box>
      </Box>
    </Box>
  )
}

// Metric Card Component
interface MetricCardProps {
  title: string
  value: string | number
  icon: ReactNode
  color: string
  href?: string
  stat?: string
  urgent?: boolean
}

function MetricCard({ title, value, icon, color, href, stat, urgent }: MetricCardProps) {
  const CardWrapper = ({ children }: { children: ReactNode }) => {
    if (href) {
      return (
        <Link href={href} style={{ textDecoration: 'none' }}>
          {children}
        </Link>
      )
    }
    return <>{children}</>
  }

  return (
    <CardWrapper>
      <Card
        elevation={0}
        sx={{
          height: '100%',
          backgroundColor: 'rgba(26, 26, 46, 0.6)',
          border: `1px solid ${alpha(color, 0.2)}`,
          transition: 'all 0.2s ease',
          cursor: href ? 'pointer' : 'default',
          '&:hover': href ? {
            transform: 'translateY(-2px)',
            borderColor: color,
            boxShadow: `0 4px 12px ${alpha(color, 0.2)}`,
          } : {},
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: alpha(color, 0.1),
                color: color,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {icon}
            </Box>
            {urgent && (
              <Chip label="Urgent" size="small" sx={{ bgcolor: '#ef4444', color: 'white', height: 20 }} />
            )}
          </Box>
          <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {stat && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {stat}
            </Typography>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  )
}

// Status Box Component
interface StatusBoxProps {
  status: string
  count: number
  icon: ReactNode
  color: string
  href: string
}

function StatusBox({ status, count, icon, color, href }: StatusBoxProps) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          textAlign: 'center',
          borderRadius: 2,
          backgroundColor: 'rgba(26, 26, 46, 0.6)',
          border: `1px solid ${alpha(color, 0.2)}`,
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          '&:hover': {
            borderColor: color,
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 12px ${alpha(color, 0.2)}`,
          },
        }}
      >
        <Box sx={{ color, mb: 1, display: 'flex', justifyContent: 'center' }}>
          {icon}
        </Box>
        <Typography variant="h4" fontWeight={700}>
          {count}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {status}
        </Typography>
      </Paper>
    </Link>
  )
}

// User Metric Component
interface UserMetricProps {
  label: string
  value: number
  icon: ReactNode
  color?: string
}

function UserMetric({ label, value, icon, color = 'primary.main' }: UserMetricProps) {
  const bgColor = color === 'primary.main' ? 'rgba(59, 130, 246, 0.1)' : alpha(color, 0.1)
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ color, display: 'flex', alignItems: 'center' }}>
          {icon}
        </Box>
        <Typography variant="body2" fontWeight={500}>
          {label}
        </Typography>
      </Box>
      <Chip label={value} size="small" sx={{ fontWeight: 700, bgcolor: bgColor }} />
    </Box>
  )
}

// Action Button Component
interface ActionButtonProps {
  title: string
  icon: ReactNode
  color: string
  href: string
}

function ActionButton({ title, icon, color, href }: ActionButtonProps) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: 'rgba(26, 26, 46, 0.6)',
            border: `1px solid ${alpha(color, 0.2)}`,
            borderRadius: 2,
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            '&:hover': {
              borderColor: color,
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 12px ${alpha(color, 0.2)}`,
            },
          }}
        >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ color, display: 'flex', alignItems: 'center' }}>
              {icon}
            </Box>
            <Typography variant="body2" fontWeight={600}>
              {title}
            </Typography>
          </Box>
          <ArrowForwardIcon sx={{ color, fontSize: 20 }} />
        </Box>
      </Paper>
    </Link>
  )
}
