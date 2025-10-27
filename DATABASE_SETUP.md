# Database Setup Guide

This guide will help you set up the Supabase database for Skiben.

## Prerequisites

1. A Supabase account and project (create at [supabase.com](https://supabase.com))
2. SQL Editor access in your Supabase dashboard

## Quick Setup Steps

### Step 1: Access SQL Editor

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Schema SQL

Copy and paste the following SQL into the SQL Editor, then click **Run**:

```sql
-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  twitch_id TEXT UNIQUE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'VIEWER' CHECK (role IN ('VIEWER', 'MODERATOR', 'STREAMER', 'ADMIN')),
  is_banned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contests table
CREATE TABLE IF NOT EXISTS public.contests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ENDED')),
  submission_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('YOUTUBE', 'TIKTOK')),
  video_url TEXT NOT NULL,
  video_id TEXT NOT NULL,
  status TEXT DEFAULT 'UNAPPROVED' CHECK (status IN ('UNAPPROVED', 'APPROVED', 'DENIED', 'WINNER')),
  submitter_id UUID REFERENCES public.profiles(id) NOT NULL,
  contest_id UUID REFERENCES public.contests(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  metadata JSONB,
  source TEXT,
  start_timestamp TEXT,
  end_timestamp TEXT,
  submission_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create moderation_logs table
CREATE TABLE IF NOT EXISTS public.moderation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL CHECK (action IN ('APPROVE', 'DENY', 'MARK_WINNER', 'UNAPPROVE', 'REMOVE', 'BAN_USER')),
  previous_status TEXT,
  new_status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitter ON public.submissions(submitter_id);
CREATE INDEX IF NOT EXISTS idx_submissions_contest ON public.submissions(contest_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_submission ON public.moderation_logs(submission_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Submissions are viewable by everyone" ON public.submissions;
DROP POLICY IF EXISTS "Authenticated users can create submissions" ON public.submissions;
DROP POLICY IF EXISTS "Moderators can update submissions" ON public.submissions;
DROP POLICY IF EXISTS "Moderators can delete submissions" ON public.submissions;
DROP POLICY IF EXISTS "Moderators can view logs" ON public.moderation_logs;
DROP POLICY IF EXISTS "Moderators can create logs" ON public.moderation_logs;

-- Profiles: Users can read all, update only their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Submissions: Everyone can read, authenticated users can create
CREATE POLICY "Submissions are viewable by everyone" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = submitter_id AND NOT (SELECT is_banned FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Moderators can update submissions" ON public.submissions FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('MODERATOR', 'STREAMER', 'ADMIN'));
CREATE POLICY "Moderators can delete submissions" ON public.submissions FOR DELETE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('MODERATOR', 'STREAMER', 'ADMIN'));

-- Contests: Everyone can read and create (for streamers to manage contests)
CREATE POLICY "Contests are viewable by everyone" ON public.contests FOR SELECT USING (true);
CREATE POLICY "Admins can create contests" ON public.contests FOR INSERT WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('ADMIN', 'STREAMER'));
CREATE POLICY "Admins can update contests" ON public.contests FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('ADMIN', 'STREAMER'));
CREATE POLICY "Admins can delete contests" ON public.contests FOR DELETE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('ADMIN', 'STREAMER'));

-- Moderation logs: Viewable by moderators, created by moderators
CREATE POLICY "Moderators can view logs" ON public.moderation_logs FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('MODERATOR', 'STREAMER', 'ADMIN'));
CREATE POLICY "Moderators can create logs" ON public.moderation_logs FOR INSERT WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('MODERATOR', 'STREAMER', 'ADMIN'));
```

### Step 3: Create Your First Admin User (Important!)

After running the schema, you need to create your first admin user. You'll do this after you log in for the first time.

1. Log into the application with your Twitch account
2. Go to your Supabase dashboard → **Table Editor** → `profiles`
3. Find your user record
4. Change the `role` field from `VIEWER` to `ADMIN`
5. Click **Save**

**Alternative (SQL method)**:
```sql
UPDATE public.profiles 
SET role = 'ADMIN' 
WHERE username = 'your_username';
```

### Step 4: Enable Twitch OAuth

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Twitch** in the list
3. Click to **Enable**
4. Add your Twitch OAuth credentials:
   - Client ID (from [Twitch Developer Console](https://dev.twitch.tv/console))
   - Client Secret
5. Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`
6. Save

### Step 5: Verify Setup

Run this query to verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- `contests`
- `moderation_logs`
- `profiles`
- `submissions`

## Troubleshooting

### "relation does not exist" error
- Make sure you're running the SQL in the correct database
- Check that you're in the SQL Editor, not the query runner

### "permission denied" errors
- Verify RLS policies were created successfully
- Check that Row Level Security is enabled on all tables

### Authentication not working
- Verify Twitch OAuth is enabled in Supabase
- Check that redirect URLs match exactly in both Twitch and Supabase
- Make sure environment variables are set correctly

### Can't access moderation dashboard
- You need to be assigned a MODERATOR, STREAMER, or ADMIN role
- Create admin account (see Step 3)

## Next Steps

After database setup:
1. ✅ Set up environment variables (see `ENV_SETUP_GUIDE.md`)
2. ✅ Configure Twitch OAuth (see above)
3. ✅ Create your admin account
4. ✅ Deploy to production (see `PRODUCTION_READINESS_REPORT.md`)

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- Users can only see their own profile, but can view all submissions
- Only moderators can update/delete submissions
- Service role key should NEVER be exposed to client
- Always use the anon key for client-side operations

---

**Done!** Your database is now set up and ready to use. 🚀

