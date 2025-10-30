'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Contest } from '@/types'
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
// removed select for source; auto-detect from URL
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X } from 'lucide-react'

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
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to submit')
        return
      }

      // SECURITY: Use validated video extraction and metadata
      const { extractVideoId, validateVideoUrl, fetchVideoMetadata } = await import('@/lib/video-utils')
      
      if (!validateVideoUrl(formData.link)) {
        setError('Invalid video URL. Please use a valid YouTube or TikTok URL.')
        return
      }

      const videoData = extractVideoId(formData.link)
      if (!videoData || !videoData.videoId) {
        setError('Could not extract video ID from URL')
        return
      }

      const videoId = videoData.videoId
      const platform = videoData.platform

      // Try to fetch title automatically if not provided
      try {
        const metadata = await fetchVideoMetadata(videoId, platform)
        if (metadata?.title && !formData.title) {
          setFormData(prev => ({ ...prev, title: metadata.title }))
        }
      } catch {}

      const { error: insertError } = await supabase
        .from('submissions')
        .insert({
          title: formData.title,
          platform: platform as any,
          video_url: formData.link,
          video_id: videoId,
          submitter_id: user.id,
          contest_id: contest.id,
          submission_comment: formData.comment
        })

      if (insertError) {
        setError(insertError.message)
        return
      }

      onSubmitSuccess()
      onClose()
    } catch (err: any) {
      setError('An unexpected error occurred')
      console.error('Submission error:', err?.message || 'Unknown error')
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
          {/* SUBMISSION Heading */}
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
                  onChange={async (e) => {
                    const url = e.target.value
                    setFormData({ ...formData, link: url })
                    try {
                      const { extractVideoId, validateVideoUrl, fetchVideoMetadata } = await import('@/lib/video-utils')
                      if (validateVideoUrl(url)) {
                        const vd = extractVideoId(url)
                        if (vd) {
                          const md = await fetchVideoMetadata(vd.videoId, vd.platform)
                          if (md?.title) {
                            setFormData(prev => ({ ...prev, title: md.title }))
                          }
                        }
                      }
                    } catch {}
                  }}
                  placeholder="https://youtube.com/watch?v=..."
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
                  rows={4}
                  className="bg-[rgb(18,18,18)] border-white/20 text-white rounded-md w-full hover:bg-[rgb(24,24,24)] focus:bg-[rgb(24,24,24)]"
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
