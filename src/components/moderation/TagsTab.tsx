'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ContestTag } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus } from 'lucide-react'

export default function TagsTab() {
  const supabase = createClient()
  const [tags, setTags] = useState<ContestTag[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    const { data } = await supabase.from('contest_tags').select('*').order('name', { ascending: true })
    setTags(data || [])
  }

  const handleAdd = async () => {
    if (!name.trim()) return
    setLoading(true)
    const { error } = await supabase.from('contest_tags').insert({ name: name.trim() })
    setLoading(false)
    if (!error) {
      setName('')
      fetchTags()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne taggen?')) return
    await supabase.from('contest_tags').delete().eq('id', id)
    fetchTags()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Badge className="bg-blue-600 text-white">Tags</Badge>
          <span>Administrer konkurranse-tagger</span>
        </h2>
        <p className="text-slate-400 mt-2">Kun administratorer kan endre tagger</p>
      </div>

      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white">Legg til ny tag</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Skriv inn navn på tagg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Button onClick={handleAdd} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> Legg til
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white">Eksisterende tagger</CardTitle>
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <p className="text-slate-400">Ingen tagger enda</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                  <span className="text-white font-medium">{tag.name}</span>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(tag.id)} className="border-red-600 text-red-500 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


