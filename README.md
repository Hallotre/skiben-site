# Skiben - Streamer Video Hub

A Next.js application that enables streamers to collect, moderate, and review video submissions from their viewers.

## Features

- **Video Submission**: Viewers can submit YouTube and TikTok videos via a web form
- **Moderation Dashboard**: Moderators can review, approve, deny, and manage submissions
- **Streamer Review Interface**: Dedicated interface for streamers to browse approved videos
- **Twitch OAuth Authentication**: Secure login with Twitch accounts
- **Role-based Access Control**: Different permissions for viewers, moderators, and streamers
- **Real-time Updates**: Live updates using Supabase real-time subscriptions

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the following SQL to create the database schema:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  twitch_id TEXT UNIQUE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'VIEWER' CHECK (role IN ('VIEWER', 'MODERATOR', 'STREAMER', 'ADMIN')),
  is_banned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions table
CREATE TABLE public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('YOUTUBE', 'TIKTOK', 'TWITCH')),
  video_url TEXT NOT NULL,
  video_id TEXT NOT NULL,
  status TEXT DEFAULT 'UNAPPROVED' CHECK (status IN ('UNAPPROVED', 'APPROVED', 'DENIED', 'WINNER')),
  submitter_id UUID REFERENCES public.profiles(id) NOT NULL,
  contest_id UUID REFERENCES public.contests(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  metadata JSONB,
  -- Timestamp fields from submission modal
  source TEXT,
  start_timestamp TEXT,
  end_timestamp TEXT,
  submission_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.submissions
  DROP CONSTRAINT IF EXISTS submissions_platform_check;
ALTER TABLE IF EXISTS public.submissions
  ADD CONSTRAINT submissions_platform_check
  CHECK (platform IN ('YOUTUBE', 'TIKTOK', 'TWITCH'));

-- Contests table
CREATE TABLE public.contests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ENDED')),
  submission_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moderation logs table
CREATE TABLE public.moderation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL CHECK (action IN ('APPROVE', 'DENY', 'MARK_WINNER', 'UNAPPROVE', 'REMOVE', 'BAN_USER')),
  previous_status TEXT,
  new_status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submissions_submitter ON public.submissions(submitter_id);
CREATE INDEX idx_submissions_contest ON public.submissions(contest_id);
CREATE INDEX idx_moderation_logs_submission ON public.moderation_logs(submission_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, update only their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Submissions: Everyone can read, authenticated users can create
CREATE POLICY "Submissions are viewable by everyone" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = submitter_id AND NOT (SELECT is_banned FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Moderators can update submissions" ON public.submissions FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('MODERATOR', 'STREAMER', 'ADMIN'));
CREATE POLICY "Moderators can delete submissions" ON public.submissions FOR DELETE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('MODERATOR', 'STREAMER', 'ADMIN'));

-- Moderation logs: Viewable by moderators, created by moderators
CREATE POLICY "Moderators can view logs" ON public.moderation_logs FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('MODERATOR', 'STREAMER', 'ADMIN'));
CREATE POLICY "Moderators can create logs" ON public.moderation_logs FOR INSERT WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('MODERATOR', 'STREAMER', 'ADMIN'));
```

3. Enable Twitch OAuth in Supabase Dashboard:
   - Go to Authentication > Providers
   - Enable Twitch provider
   - Add your Twitch app credentials

### 2. Twitch App Setup

1. Go to [Twitch Developer Console](https://dev.twitch.tv/console)
2. Create a new application
3. Set the OAuth redirect URL to: `https://your-project.supabase.co/auth/v1/callback`
4. Copy the Client ID and Client Secret

### 3. Environment Variables

Create a `.env.local` file in the root directory. For detailed setup instructions, see **[ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)**.

Quick reference:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# YouTube API (Optional)
YOUTUBE_API_KEY=your_youtube_api_key_optional
```

> 📖 **See [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md) for step-by-step instructions on getting these values.**

### 4. Installation

```bash
npm install
npm run dev
```

### 5. Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Usage

1. **Viewers**: Visit `/submit` to submit videos
2. **Moderators**: Visit `/moderation` to review and manage submissions
3. **Streamers**: Visit `/review` to browse approved videos

## Role Management

To change user roles, update the `role` field in the `profiles` table:
- `VIEWER`: Can submit videos
- `MODERATOR`: Can moderate submissions
- `STREAMER`: Can review approved videos and moderate

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License