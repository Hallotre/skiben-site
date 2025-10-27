export type UserRole = 'VIEWER' | 'MODERATOR' | 'STREAMER' | 'ADMIN'
export type Platform = 'YOUTUBE' | 'TIKTOK'
export type SubmissionStatus = 'UNAPPROVED' | 'APPROVED' | 'DENIED' | 'WINNER'
export type ModerationAction = 'APPROVE' | 'DENY' | 'MARK_WINNER' | 'UNAPPROVE' | 'REMOVE' | 'BAN_USER'

export interface Profile {
  id: string
  twitch_id?: string
  username: string
  avatar_url?: string
  role: UserRole
  is_banned: boolean
  created_at: string
  updated_at: string
}

export interface Submission {
  id: string
  title: string
  platform: Platform
  video_url: string
  video_id: string
  status: SubmissionStatus
  submitter_id: string
  contest_id?: string
  thumbnail_url?: string
  metadata?: any
  source?: string
  start_timestamp?: string
  end_timestamp?: string
  submission_comment?: string
  created_at: string
  updated_at: string
  submitter?: Profile
  contest?: Contest
}

export interface ModerationLog {
  id: string
  submission_id: string
  moderator_id: string
  action: ModerationAction
  previous_status?: SubmissionStatus
  new_status?: SubmissionStatus
  notes?: string
  created_at: string
  moderator?: Profile
}

export interface VideoMetadata {
  title: string
  thumbnail_url?: string
  duration?: number
  description?: string
}

export interface Contest {
  id: string
  title: string
  description: string
  status: 'ACTIVE' | 'INACTIVE' | 'ENDED'
  submission_count: number
  display_number?: number
  created_at: string
  updated_at: string
}

