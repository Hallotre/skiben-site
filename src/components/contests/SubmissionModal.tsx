'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Contest } from '@/types'
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
// removed select for source; auto-detect from URL
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X, CheckCircle2 } from 'lucide-react'

interface SubmissionModalProps {
  contest: Contest
  onClose: () => void
  onSubmitSuccess: () => void
}

export default function SubmissionModal({ contest, onClose, onSubmitSuccess }: SubmissionModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    comment: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  // Reset form state when modal opens or contest changes
  useEffect(() => {
    // Reset all state when contest changes or modal opens
    setFormData({
      title: '',
      link: '',
      comment: ''
    })
    setLoading(false)
    setError('')
    setSuccess(false)
    
    // Cleanup function to reset state when component unmounts
    return () => {
      setFormData({
        title: '',
        link: '',
        comment: ''
      })
      setLoading(false)
      setError('')
      setSuccess(false)
    }
  }, [contest.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to submit')
        setLoading(false)
        return
      }

      // SECURITY: Use validated video extraction
      const { extractVideoId, validateVideoUrl } = await import('@/lib/video-utils')
      
      if (!validateVideoUrl(formData.link)) {
        setError('Invalid video URL. Please use a valid YouTube, YouTube Shorts, TikTok, or Twitch Clip URL.')
        setLoading(false)
        return
      }

      const videoData = extractVideoId(formData.link)
      if (!videoData || !videoData.videoId) {
        setError('Could not extract video ID from URL')
        setLoading(false)
        return
      }

      const videoId = videoData.videoId
      const platform = videoData.platform

      // Generate a title from the video URL or use a default
      const title = formData.title.trim() || formData.link || `Video Submission - ${platform}`

      // Handle comment - preserve the comment as-is (empty string or actual comment)
      const comment = formData.comment.trim()

      const { error: insertError, data: insertData } = await supabase
        .from('submissions')
        .insert({
          title: title,
          platform: platform as any,
          video_url: formData.link,
          video_id: videoId,
          submitter_id: user.id,
          contest_id: contest.id,
          submission_comment: comment || null
        })
        .select()

      if (insertError) {
        console.error('Insert error details:', insertError)
        console.error('Error code:', insertError.code)
        console.error('Error details:', insertError.details)
        console.error('Error hint:', insertError.hint)
        setError(insertError.message || 'Failed to submit. Please try again.')
        setLoading(false)
        return
      }

      // Show success animation
      setSuccess(true)
      setLoading(false)
      
      // Wait a moment to show the success animation, then close
      setTimeout(() => {
        onSubmitSuccess()
        onClose()
      }, 1500)
    } catch (err: any) {
      console.error('Submission error:', err)
      console.error('Error message:', err?.message)
      console.error('Error stack:', err?.stack)
      setError(err?.message || 'An unexpected error occurred. Please check the console for details.')
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[rgb(8,8,8)] border border-blue-500/20 rounded-lg max-w-[400px] w-[400px] p-6">
        <DialogHeader>
          <DialogTitle className="text-center pb-1 pt-2">
            <div>
                     <h2 className="font-bold text-white mb-1 text-3xl">
                     SHIBEN
                   </h2>
                     <p className="text-white text-xs mb-1">
                     KONKURRANSE-ID: {contest.display_number || contest.id.substring(0, 8)}
                   </p>
              <p className="text-white font-bold text-sm">
                {contest.title}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center mt-2">
          {/* Success Animation */}
          {success && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="flex flex-col items-center gap-4 animate-scale-in">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
                  <CheckCircle2 className="relative h-20 w-20 text-green-500 animate-scale-in" />
                </div>
                <p className="text-white font-bold text-xl uppercase tracking-wider animate-slide-up">
                  INNSENDING SENDT!
                </p>
              </div>
            </div>
          )}

          {/* SUBMISSION Heading */}
          {!success && (
            <>
              <h3 className="text-white font-bold mb-4 text-2xl uppercase tracking-wider">
                INNSENDING
              </h3>

              <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="link" className="text-white font-medium text-sm mb-2 block">
                       Lenke *
                </Label>
                <Input
                  id="link"
                  required
                  value={formData.link}
                  onChange={(e) => {
                    const url = e.target.value
                    setFormData({ ...formData, link: url })
                  }}
                  placeholder="YOUTUBE, TIKTOK, TWITCH"
                  autoComplete="off"
                  className="bg-[rgb(18,18,18)] border-white/20 text-white rounded-md w-full hover:border-white/30 focus:border-white/50"
                />
              </div>

              <div>
                <Label htmlFor="comment" className="text-white font-medium text-sm mb-2 block">
                       Kommentar
                </Label>
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="HVIS LENGRE VIDEO, GJERNE SPESIFISER TIMESTAMP"
                  rows={4}
                  className="bg-[rgb(18,18,18)] border-white/20 text-white rounded-md w-full hover:bg-[rgb(24,24,24)] focus:bg-[rgb(24,24,24)] placeholder:text-white/40"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription className="font-semibold">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-white/10 text-white w-full py-3 text-sm font-bold uppercase tracking-wider rounded-md hover:bg-white/15 disabled:bg-white/5 disabled:text-white/40"
                >
                         {loading ? 'SENDER…' : 'SEND INN'}
                </Button>
              </div>
            </div>
          </form>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
