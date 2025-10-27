'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { extractVideoId, validateVideoUrl, fetchVideoMetadata } from '@/lib/video-utils'
import { Submission, Platform } from '@/types'

interface SubmissionFormProps {
  onSubmit?: (submission: Submission) => void
}

export default function SubmissionForm({ onSubmit }: SubmissionFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    comment: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [videoInfo, setVideoInfo] = useState<{ platform: Platform; videoId: string } | null>(null)
  
  const supabase = createClient()

  const handleUrlChange = async (url: string) => {
    setFormData(prev => ({ ...prev, videoUrl: url }))
    setError('')
    
    if (url) {
      if (!validateVideoUrl(url)) {
        setError('Please enter a valid YouTube or TikTok URL')
        return
      }
      
      const videoData = extractVideoId(url)
      if (videoData) {
        setVideoInfo(videoData)
        
        // Try to fetch metadata
        const metadata = await fetchVideoMetadata(videoData.videoId, videoData.platform)
        if (metadata && metadata.title) {
          setFormData(prev => ({ ...prev, title: metadata.title }))
        }
      }
    } else {
      setVideoInfo(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to submit videos')
        return
      }

      if (!videoInfo) {
        setError('Please enter a valid video URL')
        return
      }

      const { data, error } = await supabase
        .from('submissions')
        .insert({
          title: formData.title,
          platform: videoInfo.platform,
          video_url: formData.videoUrl,
          video_id: videoInfo.videoId,
          submitter_id: user.id,
          metadata: {
            comment: formData.comment
          }
        })
        .select()
        .single()

      if (error) {
        setError(error.message)
        return
      }

      setSuccess('Video submitted successfully!')
      setFormData({ title: '', videoUrl: '', comment: '' })
      setVideoInfo(null)
      
      if (onSubmit) {
        onSubmit(data)
      }
    } catch (err: any) {
      setError('An unexpected error occurred')
      console.error('Submission error:', err?.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-dark-700 border border-dark-600 rounded-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="videoUrl" className="block text-sm font-bold text-white mb-3">
              VIDEO URL *
            </label>
            <input
              type="url"
              id="videoUrl"
              value={formData.videoUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or https://tiktok.com/@user/video/..."
              className="bg-dark-600 border border-dark-500 text-white rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            {videoInfo && (
              <p className="text-sm text-primary-500 mt-2 font-semibold">
                ✓ Detected {videoInfo.platform} video
              </p>
            )}
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-bold text-white mb-3">
              TITLE *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter video title"
              className="bg-dark-600 border border-dark-500 text-white rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-bold text-white mb-3">
              COMMENT
            </label>
            <textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Add any additional comments about this video..."
              rows={4}
              className="bg-dark-600 border border-dark-500 text-white rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-600 text-red-300 px-4 py-3 rounded-lg font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/30 border border-green-600 text-green-300 px-4 py-3 rounded-lg font-semibold">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !videoInfo}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-8 rounded-lg w-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase"
          >
            {loading ? 'Submitting...' : 'SUBMIT VIDEO'}
          </button>
        </form>
      </div>
    </div>
  )
}

