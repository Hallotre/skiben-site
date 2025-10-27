'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Submission, SubmissionStatus } from '@/types'
import VideoPlayer from '@/components/video/VideoPlayer'
import ModerationActions from '@/components/moderation/ModerationActions'

export default function ReviewInterface() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchApprovedSubmissions()
  }, [])

  const fetchApprovedSubmissions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          submitter:profiles(*)
        `)
        .eq('status', 'APPROVED')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching approved submissions:', error)
        return
      }

      setSubmissions(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentSubmission = submissions[currentIndex]

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < submissions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleStatusChange = (submissionId: string, newStatus: SubmissionStatus) => {
    // Remove the submission from the list if it's no longer approved
    if (newStatus !== 'APPROVED') {
      setSubmissions(prev => prev.filter(sub => sub.id !== submissionId))
      
      // Adjust current index if needed
      if (currentIndex >= submissions.length - 1) {
        setCurrentIndex(Math.max(0, submissions.length - 2))
      }
    }
  }

  const handleBanUser = (userId: string) => {
    // Remove all submissions from banned user
    setSubmissions(prev => prev.filter(sub => sub.submitter_id !== userId))
    
    // Adjust current index if needed
    if (currentIndex >= submissions.length - 1) {
      setCurrentIndex(Math.max(0, submissions.length - 2))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading approved videos...</p>
        </div>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">No Approved Videos</h1>
          <p className="text-gray-300">
            There are no approved videos to review at the moment.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with counter and navigation */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Review Interface</h1>
          <p className="text-gray-300">
            Browse approved submissions for your stream
          </p>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-500">
            {currentIndex + 1} / {submissions.length}
          </div>
          <p className="text-sm text-gray-400">Approved Videos</p>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          
          <span className="text-gray-300 px-4">
            {currentIndex + 1} of {submissions.length}
          </span>
          
          <button
            onClick={goToNext}
            disabled={currentIndex === submissions.length - 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Video Player and Details */}
      {currentSubmission && (
        <div className="card">
          <div className="mb-6">
            <VideoPlayer
              videoId={currentSubmission.video_id}
              platform={currentSubmission.platform}
              title={currentSubmission.title}
              className="mb-6"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  {currentSubmission.title}
                </h2>
                
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong>Platform:</strong> {currentSubmission.platform}</p>
                  <p><strong>Submitted by:</strong> {currentSubmission.submitter?.username}</p>
                  <p><strong>Submitted:</strong> {new Date(currentSubmission.created_at).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> 
                    <span className="ml-2 bg-green-900/20 text-green-400 px-2 py-1 rounded text-xs">
                      {currentSubmission.status}
                    </span>
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Video Link</h3>
                <a 
                  href={currentSubmission.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:text-primary-400 break-all"
                >
                  {currentSubmission.video_url}
                </a>
                
                {currentSubmission.metadata?.comment && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Comment</h3>
                    <p className="text-gray-300 text-sm bg-dark-700 p-3 rounded">
                      {currentSubmission.metadata.comment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Moderation Actions */}
          <div className="border-t border-dark-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Moderation Actions</h3>
            <ModerationActions
              submission={currentSubmission}
              onStatusChange={handleStatusChange}
              onBanUser={handleBanUser}
            />
          </div>
        </div>
      )}
    </div>
  )
}

