import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient as createServerSupabaseClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient(cookieStore)

    const { data: contestsData, error: contestsError } = await supabase
      .from('contests')
      .select('id, title, description, status, display_number, tags, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (contestsError) {
      throw contestsError
    }

    if (!contestsData || contestsData.length === 0) {
      return NextResponse.json({ contests: [] }, { headers: { 'Cache-Control': 'no-store' } })
    }

    const contestIds = contestsData.map((contest) => contest.id)
    const countsMap = new Map<string, number>()

    if (contestIds.length > 0) {
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select('contest_id')
        .in('contest_id', contestIds)

      if (submissionsError) {
        throw submissionsError
      }

      submissionsData?.forEach((submission) => {
        if (!submission.contest_id) return
        countsMap.set(
          submission.contest_id,
          (countsMap.get(submission.contest_id) || 0) + 1
        )
      })
    }

    const contests = contestsData.map((contest) => ({
      ...contest,
      submission_count: countsMap.get(contest.id) || 0,
    }))

    return NextResponse.json(
      { contests },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Failed to load contests:', error)
    return NextResponse.json(
      { error: 'Failed to load contests' },
      { status: 500 }
    )
  }
}

