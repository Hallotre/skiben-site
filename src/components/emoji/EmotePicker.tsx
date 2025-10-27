'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress
} from '@mui/material'
import { Search } from '@mui/icons-material'
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <TextField
          fullWidth
          placeholder="Search emotes or paste emote ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1 }} />,
          }}
        />
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Popular Emotes
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            {POPULAR_EMOTES.map((emote) => (
              <Box
                key={emote.id}
                onClick={() => handleSelect(emote.id)}
                sx={{
                  p: 2,
                  border: selectedEmote === emote.id ? '2px solid #2563eb' : '2px solid transparent',
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'rgba(37, 99, 235, 0.1)',
                  },
                }}
              >
                <SeventvEmote emoteId={emote.id} size="3x" alt={emote.name} />
                <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 1 }}>
                  {emote.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {searchQuery && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Custom Emote
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              mt: 2,
              p: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
            }}>
              <SeventvEmote emoteId={searchQuery} size="3x" alt="Custom emote" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">Emote ID: {searchQuery}</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleSelect(searchQuery)}
                  sx={{ mt: 1 }}
                >
                  Select This
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={!selectedEmote}
          >
            Confirm
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

