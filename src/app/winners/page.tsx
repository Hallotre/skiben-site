'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Submission } from '@/types'
import RoleGuard from '@/components/auth/RoleGuard'
import { UserRole } from '@/types'

export default function WinnersPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchWinners()
  }, [])

  const fetchWinners = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          submitter:profiles(*)
        `)
        .eq('status', 'WINNER')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching winners:', error)
        return
      }

      setSubmissions(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading winners...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard requiredRoles={['MODERATOR', 'STREAMER']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">🏆 Winner Submissions</h1>
              <p className="text-gray-300">
                All videos marked as winners - ready for sub alerts
              </p>
            </div>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No winners yet</p>
            <p className="text-gray-500">
              Winners will appear here once marked by the streamer
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="card">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Thumbnail */}
                  {submission.thumbnail_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={submission.thumbnail_url}
                        alt={submission.title}
                        className="w-48 h-36 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {submission.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="capitalize">{submission.platform}</span>
                          <span>•</span>
                          <span>By: {submission.submitter?.username}</span>
                          <span>•</span>
                          <span>{new Date(submission.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className="bg-yellow-900/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                        WINNER
                      </span>
                    </div>

                    {/* Video URL */}
                    <div className="bg-dark-700 rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-400">
                          Video URL
                        </label>
                        <button
                          onClick={() => copyToClipboard(submission.video_url, `url-${submission.id}`)}
                          className={`text-xs px-3 py-1 rounded ${
                            copiedId === `url-${submission.id}`
                              ? 'bg-green-600 text-white'
                              : 'bg-dark-600 text-gray-300 hover:bg-dark-500'
                          }`}
                        >
                          {copiedId === `url-${submission.id}` ? '✓ Copied!' : 'Copy URL'}
                        </button>
                      </div>
                      <p className="text-sm text-gray-300 break-all font-mono">
                        {submission.video_url}
                      </p>
                    </div>

                    {/* Video ID */}
                    <div className="bg-dark-700 rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-400">
                          Video ID (for embedding)
                        </label>
                        <button
                          onClick={() => copyToClipboard(submission.video_id, `id-${submission.id}`)}
                          className={`text-xs px-3 py-1 rounded ${
                            copiedId === `id-${submission.id}`
                              ? 'bg-green-600 text-white'
                              : 'bg-dark-600 text-gray-300 hover:bg-dark-500'
                          }`}
                        >
                          {copiedId === `id-${submission.id}` ? '✓ Copied!' : 'Copy ID'}
                        </button>
                      </div>
                      <p className="text-sm text-gray-300 break-all font-mono">
                        {submission.video_id}
                      </p>
                    </div>

                    {/* Embed Code */}
                    <div className="bg-dark-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-400">
                          Embed Link (for sub alert triggers)
                        </label>
                        <button
                          onClick={() => copyToClipboard(
                            submission.platform === 'YOUTUBE'
                              ? `https://www.youtube.com/watch?v=${submission.video_id}`
                              : `https://www.tiktok.com/@video/video/${submission.video_id}`,
                            `embed-${submission.id}`
                          )}
                          className={`text-xs px-3 py-1 rounded ${
                            copiedId === `embed-${submission.id}`
                              ? 'bg-green-600 text-white'
                              : 'bg-dark-600 text-gray-300 hover:bg-dark-500'
                          }`}
                        >
                          {copiedId === `embed-${submission.id}` ? '✓ Copied!' : 'Copy Embed'}
                        </button>
                      </div>
                      <p className="text-sm text-gray-300 break-all font-mono">
                        {submission.platform === 'YOUTUBE'
                          ? `https://www.youtube.com/watch?v=${submission.video_id}`
                          : `https://www.tiktok.com/@video/video/${submission.video_id}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <a
            href="/moderation"
            className="text-primary-500 hover:text-primary-400 underline"
          >
            ← Back to Moderation Dashboard
          </a>
        </div>
      </div>
    </RoleGuard>
  )
}

