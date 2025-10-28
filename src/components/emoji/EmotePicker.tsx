'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import SeventvEmote from './SeventvEmote'

interface EmotePickerProps {
  open: boolean
  onClose: () => void
  onSelect: (emoteId: string) => void
}

// Popular 7tv emotes for quick selection
const POPULAR_EMOTES = [
  { id: '01K7PSQWEZT3TWCKFYKRHBFMBH', name: 'Chad' },
  { id: '60afc1fd44d22e000d942831', name: 'Pepega' },
  { id: '60afcb6d44d22e000d942868', name: 'Madge' },
  { id: '60af9b4e44d22e000d941c6d', name: 'PogChamp' },
  { id: '60afc7df44d22e000d9427a7', name: 'MonkaS' },
]

export default function EmotePicker({ open, onClose, onSelect }: EmotePickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEmote, setSelectedEmote] = useState<string | null>(null)

  const handleSelect = (emoteId: string) => {
    setSelectedEmote(emoteId)
  }

  const handleConfirm = () => {
    if (selectedEmote) {
      onSelect(selectedEmote)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Emote</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search emotes or paste emote ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Popular Emotes</h3>
            <div className="flex flex-wrap gap-3">
              {POPULAR_EMOTES.map((emote) => (
                <div
                  key={emote.id}
                  onClick={() => handleSelect(emote.id)}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all
                    ${selectedEmote === emote.id 
                      ? 'border-2 border-blue-600 bg-blue-600/10' 
                      : 'border-2 border-transparent hover:bg-blue-600/5'
                    }
                  `}
                >
                  <SeventvEmote emoteId={emote.id} size="4x" />
                  <p className="text-xs text-center mt-1 text-gray-400">{emote.name}</p>
                </div>
              ))}
            </div>
          </div>

          {searchQuery && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Search Results</h3>
              <div className="flex flex-wrap gap-3">
                {/* Search results would go here */}
                <p className="text-gray-400 text-sm">Search functionality coming soon</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedEmote}>
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
