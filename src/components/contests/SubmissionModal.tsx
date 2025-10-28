'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Contest } from '@/types'
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
    source: 'YOUTUBE',
    link: '',
    startTimestamp: '',
    endTimestamp: '',
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

      // SECURITY: Use validated video extraction
      const { extractVideoId, validateVideoUrl } = await import('@/lib/video-utils')
      
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

      const { error: insertError } = await supabase
        .from('submissions')
        .insert({
          title: formData.title,
          platform: platform as any,
          video_url: formData.link,
          video_id: videoId,
          submitter_id: user.id,
          contest_id: contest.id,
          source: formData.source,
          start_timestamp: formData.startTimestamp,
          end_timestamp: formData.endTimestamp,
          submission_comment: formData.comment,
          metadata: {
            source: formData.source,
            start_timestamp: formData.startTimestamp,
            end_timestamp: formData.endTimestamp,
            comment: formData.comment
          }
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
                <Label htmlFor="title" className="text-white font-medium text-sm mb-2 block">
                       Tittel *
                </Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  autoFocus
                  className="bg-[rgb(18,18,18)] border-white/20 text-white rounded-md w-full hover:border-white/30 focus:border-white/50"
                  placeholder="Enter title"
                />
              </div>

              <div>
                <Label htmlFor="source" className="text-white font-medium text-sm mb-2 block">
                       Kilde *
                </Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData({ ...formData, source: value })}
                >
                  <SelectTrigger className="bg-[rgb(18,18,18)] border-white/20 text-white rounded-md hover:border-white/30 focus:border-white/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#282828] border-white/20">
                         <SelectItem value="YOUTUBE">YouTube</SelectItem>
                         <SelectItem value="TIKTOK">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="link" className="text-white font-medium text-sm mb-2 block">
                       Lenke *
                </Label>
                <Input
                  id="link"
                  required
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="bg-[rgb(18,18,18)] border-white/20 text-white rounded-md w-full hover:border-white/30 focus:border-white/50"
                />
              </div>

              <div>
                <Label htmlFor="startTimestamp" className="text-white font-medium text-sm mb-2 block">
                       Start tidspunkt *
                </Label>
                <Input
                  id="startTimestamp"
                  required
                  value={formData.startTimestamp}
                  onChange={(e) => setFormData({ ...formData, startTimestamp: e.target.value })}
                  placeholder="0:15"
                  className="bg-[rgb(18,18,18)] border-white/20 text-white rounded-md w-full hover:bg-[rgb(24,24,24)] focus:bg-[rgb(24,24,24)]"
                />
              </div>

              <div>
                <Label htmlFor="endTimestamp" className="text-white font-medium text-sm mb-2 block">
                       Slutt tidspunkt *
                </Label>
                <Input
                  id="endTimestamp"
                  required
                  value={formData.endTimestamp}
                  onChange={(e) => setFormData({ ...formData, endTimestamp: e.target.value })}
                  placeholder="0:30"
                  className="bg-[rgb(18,18,18)] border-white/20 text-white rounded-md w-full hover:bg-[rgb(24,24,24)] focus:bg-[rgb(24,24,24)]"
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
