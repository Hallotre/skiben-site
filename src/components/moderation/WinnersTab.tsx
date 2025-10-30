'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Submission } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { Copy, CheckCircle2, Trophy, Download } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface WinnersTabProps {
  contestId?: string | null
  selectedContest?: string | null
  allContests?: any[]
}

export default function WinnersTab({ contestId, selectedContest, allContests }: WinnersTabProps) {
  const [winners, setWinners] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchWinners()
  }, [contestId])

  const fetchWinners = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('submissions')
        .select(`
          *,
          submitter:profiles(*)
        `)
        .eq('status', 'WINNER')
        .order('created_at', { ascending: false })

      if (contestId) {
        query = query.eq('contest_id', contestId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching winners:', error)
        setWinners([])
      } else {
        setWinners(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <p className="mt-6 text-lg text-slate-400">Laster inn vinnere...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold mb-2 flex items-center gap-2">
          <Trophy className="h-8 w-8 text-white" />
          <span className="text-white">Vinnere</span>
        </h2>
        <p className="text-slate-400 font-medium">
          Vis og administrer vinner-innsendinger
        </p>

        {/* Export video links button */}
        <div className="mt-4">
          <Button
            onClick={() => {
              // Build CSV with headers (only id, platform, submitter, video_url)
              const rows = winners.map(w => ({
                id: w.id,
                platform: w.platform,
                submitter: (w as any).submitter?.username || '',
                video_url: w.video_url
              }))
              const headers = ['id','platform','submitter','video_url']
              const escape = (v: any) => {
                const s = String(v ?? '')
                if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
                return s
              }
              const content = [headers.join(','), ...rows.map(r => headers.map(h => escape((r as any)[h])).join(','))].join('\n')
              const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `winners${contestId ? `-${contestId.substring(0,8)}` : ''}.csv`
              document.body.appendChild(a)
              a.click()
              a.remove()
              URL.revokeObjectURL(url)
            }}
            disabled={winners.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Eksporter CSV
          </Button>
        </div>
      </div>

      {winners.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50 text-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Trophy className="h-16 w-16 text-slate-400" />
            <p className="text-slate-400">Ingen vinnere enda</p>
          </div>
        </Card>
      ) : (
        <div className="border border-slate-800 rounded-lg overflow-hidden ">
          <Table className="text-white">
            <TableHeader>
              <TableRow className="bg-transparent hover:bg-transparent">
                <TableHead className="text-white">Video</TableHead>
                <TableHead className="text-white">Plattform</TableHead>
                <TableHead className="text-white">Bruker</TableHead>
                <TableHead className="text-white">Kommentar</TableHead>
                <TableHead className="text-white text-right">Handling</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winners.map((w) => {
                const isYouTube = w.platform === 'YOUTUBE'
                const thumb = isYouTube && w.video_id ? `https://i.ytimg.com/vi/${w.video_id}/hqdefault.jpg` : undefined
                const username = (w as any).submitter?.username || ''
                const comment = (w as any).submission_comment || (w as any).metadata?.comment || ''
                return (
                  <TableRow key={w.id} className="hover:bg-slate-900/60">
                    <TableCell className="max-w-[460px] text-white">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 rounded overflow-hidden bg-slate-800 flex items-center justify-center">
                          {thumb ? (
                            <img src={thumb} alt="thumb" className="h-12 w-16 object-cover" />
                          ) : (
                            <Badge className="bg-slate-700 text-white">{w.platform}</Badge>
                          )}
                        </div>
                        <a href={w.video_url} target="_blank" rel="noopener noreferrer" className="text-white truncate hover:underline">
                          {w.video_url}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-white">{w.platform?.toLowerCase()}</TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-slate-800 text-white text-xs">{username?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <span>{username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[360px] truncate text-white">{comment}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(w.video_url)}
                          className="border-slate-700 bg-slate-800/30 text-white hover:bg-slate-800 hover:border-slate-600 hover:text-white px-3 py-1"
                        >
                          {copiedId === w.id ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                              Kopiert
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Kopier lenke
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => window.open(w.video_url, '_blank')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Åpne
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
