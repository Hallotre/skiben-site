'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Contest, ContestTag } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Plus, Video, Loader2, Trophy, TrendingUp, Trash2, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ContestsTab() {
  const router = useRouter()
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [tags, setTags] = useState<ContestTag[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchContests()
    fetchTags()
  }, [])

  const fetchContests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching contests:', error)
        setContests([])
      } else {
        setContests(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('contest_tags')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching tags:', error)
      } else {
        setTags(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDelete = async (contestId: string) => {
    if (!confirm('Er du sikker på at du vil slette denne konkurransen?')) return

    try {
      const { error } = await supabase
        .from('contests')
        .delete()
        .eq('id', contestId)

      if (error) throw error
      fetchContests()
    } catch (error) {
      console.error('Error deleting contest:', error)
    }
  }

  const handleStatusChange = async (contestId: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
    try {
      const { error } = await supabase
        .from('contests')
        .update({ status: newStatus })
        .eq('id', contestId)

      if (error) throw error
      fetchContests()
    } catch (error) {
      console.error('Error updating contest:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <p className="mt-6 text-lg text-slate-400">
          Loading contests...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-extrabold mb-2 flex items-center gap-2">
            <Trophy className="h-8 w-8 text-white" />
            <span className="text-white">Konkurranseadministrasjon</span>
          </h2>
          <p className="text-slate-400 font-medium">
            Opprett og administrer videokonkurranser
          </p>
        </div>
        <Button 
          onClick={() => setShowModal(true)} 
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Opprett konkurranse
        </Button>
      </div>

      {/* Empty State */}
      {contests.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50 text-center py-16">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-slate-800 rounded-full">
                <Video className="h-16 w-16 text-slate-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Ingen konkurranser opprettet ennå</h3>
                <p className="text-slate-400 mb-6">
                  Opprett din første konkurranse for å starte innsamling av innsendinger
                </p>
                <Button 
                  onClick={() => setShowModal(true)} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Opprett konkurranse
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Contests Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contests.map((contest) => (
            <Card
              key={contest.id}
              className="group border-slate-800 bg-slate-900/50 hover:border-blue-600/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={contest.status === 'ACTIVE' ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-700'}>
                    {contest.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(contest.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <TrendingUp className="h-3 w-3" />
                  Opprettet: {new Date(contest.created_at).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {contest.tags && contest.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-blue-600/10 text-blue-400 border-blue-600/30 font-semibold"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>

              <CardContent>
                <h3 className="font-bold text-xl mb-3 text-white transition-colors">
                  {contest.title}
                </h3>
                <p className="text-sm text-slate-400 mb-4 min-h-[48px] line-clamp-3">
                  {contest.description || 'Ingen beskrivelse'}
                </p>

                <div className="flex items-center gap-2 p-3 bg-blue-600/10 rounded-lg mb-4 border border-blue-600/20">
                  <Video className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-bold text-blue-400">
                      {contest.submission_count} INNSENDINGER
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => router.push(`/moderation?contest=${contest.id}&tab=submissions`)}
                  >
                    Se innsendinger
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-slate-700 bg-slate-800/30 text-white hover:bg-slate-800 hover:border-slate-600 hover:text-white"
                    onClick={() => handleStatusChange(contest.id, contest.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                  >
                    {contest.status === 'ACTIVE' ? 'Deaktiver' : 'Aktiver'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateContestModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false)
          fetchContests()
        }}
        tags={tags}
      />
    </div>
  )
}

function CreateContestModal({ open, onClose, onSuccess, tags }: { open: boolean; onClose: () => void; onSuccess: () => void; tags: ContestTag[] }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    tags: 'Alert Contest'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('contests')
        .insert({
          title: formData.title,
          description: formData.description,
          status: formData.status,
          tags: [formData.tags],
          submission_count: 0
        })

      if (insertError) throw insertError
      
      onSuccess()
      setFormData({ title: '', description: '', status: 'ACTIVE', tags: 'Alert Contest' })
    } catch (err: any) {
      setError(err.message || 'Failed to create contest')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-800 rounded-lg max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-600">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">Opprett ny konkurranse</h3>
              <p className="text-sm text-slate-400">Start innsamling av videoinnsendinger</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 mt-4">
            <div>
              <Label htmlFor="title" className="text-white">Tittel</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="f.eks. SUB ALERT FORSLAG"
                className="bg-slate-800 border-slate-700 text-white mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white">Beskrivelse</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Beskriv hva denne konkurransen handler om..."
                className="bg-slate-800 border-slate-700 text-white mt-2"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="status" className="text-white">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as 'ACTIVE' | 'INACTIVE' })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="ACTIVE">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-green-500 font-semibold">AKTIV</span>
                      <span className="text-slate-400 text-sm"></span>
                    </div>
                  </SelectItem>
                  <SelectItem value="INACTIVE">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-500" />
                      <span className="text-slate-400 font-semibold">INAKTIV</span>
                      <span className="text-slate-500 text-sm"></span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags" className="text-white">Konkurranse-tag</Label>
              <Select
                value={formData.tags}
                onValueChange={(value) => setFormData({ ...formData, tags: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  {tags && tags.length === 0 ? (
                    <div className="px-2 py-1.5 text-slate-400 text-sm">Ingen tagger tilgjengelig</div>
                  ) : (
                    tags?.map((t: ContestTag) => (
                      <SelectItem key={t.id} value={t.name}>
                        <span className="text-white">{t.name}</span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
                <p className="text-sm text-red-400 font-semibold">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-slate-700 bg-slate-800/30 text-white hover:bg-slate-800 hover:border-slate-600 hover:text-white"
            >
              Avbryt
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="min-w-[150px] bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Oppretter...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Opprett konkurranse
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
