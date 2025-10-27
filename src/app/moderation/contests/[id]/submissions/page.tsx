'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Submission } from '@/types'
import RoleGuard from '@/components/auth/RoleGuard'
import DashboardLayout from '@/components/moderation/DashboardLayout'
import { usePathname } from 'next/navigation'

export default function ContestSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const supabase = createClient()
  const pathname = usePathname()
  const contestId = pathname.split('/')[3]

  useEffect(() => {
    fetchSubmissions()
  }, [contestId])

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          submitter:profiles(*)
        `)
        .eq('contest_id', contestId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching submissions:', error)
        return
      }

      setSubmissions(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (submissionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status: newStatus })
        .eq('id', submissionId)

      if (error) throw error
      fetchSubmissions()
    } catch (error) {
      console.error('Error updating submission:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard requiredRoles={['STREAMER', 'ADMIN']}>
      <DashboardLayout>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Contest Submissions</h1>
            <p className="text-gray-300">
              Submissions for this specific contest - {submissions.length} total
            </p>
          </div>

          {submissions.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-400">No submissions for this contest yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {submissions.map((submission) => (
                <div key={submission.id} className="card">
                  <div className="mb-4">
                    {submission.thumbnail_url && (
                      <img
                        src={submission.thumbnail_url}
                        alt={submission.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-xl font-bold text-white mb-2">{submission.title}</h3>
                    
                    <div className="flex flex-wrap gap-2 text-sm text-gray-400 mb-4">
                      <span className="capitalize">{submission.platform}</span>
                      <span>•</span>
                      <span>By: {submission.submitter?.username}</span>
                      <span>•</span>
                      <span>{submission.start_timestamp} - {submission.end_timestamp}</span>
                    </div>

                    {submission.submission_comment && (
                      <p className="text-gray-300 mb-4">{submission.submission_comment}</p>
                    )}

                    <span className={`text-xs px-3 py-1 rounded ${
                      submission.status === 'APPROVED' ? 'bg-green-900/20 text-green-400' :
                      submission.status === 'DENIED' ? 'bg-red-900/20 text-red-400' :
                      submission.status === 'WINNER' ? 'bg-yellow-900/20 text-yellow-400' :
                      'bg-gray-900/20 text-gray-400'
                    }`}>
                      {submission.status}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {submission.status === 'UNAPPROVED' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(submission.id, 'APPROVED')}
                          className="btn-primary text-sm flex-1"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(submission.id, 'DENIED')}
                          className="btn-danger text-sm flex-1"
                        >
                          Deny
                        </button>
                      </>
                    )}
                    {submission.status === 'APPROVED' && (
                      <button
                        onClick={() => handleStatusChange(submission.id, 'WINNER')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded text-sm flex-1"
                      >
                        Mark Winner
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  )
}


