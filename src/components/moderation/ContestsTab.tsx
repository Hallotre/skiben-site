'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Contest } from '@/types'
import { Box, Typography, Card, CardContent, Button, CircularProgress, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Divider } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import Link from 'next/link'

export default function ContestsTab() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchContests()
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

  const handleDelete = async (contestId: string) => {
    if (!confirm('Are you sure you want to delete this contest?')) return

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
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 3 }}>
          Loading contests...
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography 
            variant="h4" 
            fontWeight={800} 
            gutterBottom
            sx={{
              background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🎯 Contest Management
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Create and manage video contests
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowModal(true)}
          sx={{
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          Create Contest
        </Button>
      </Box>

      {contests.length === 0 ? (
        <Card elevation={0} sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid', borderColor: 'divider', textAlign: 'center', py: 12 }}>
          <VideoLibraryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>No contests created yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Create your first contest to start collecting submissions
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowModal(true)}
          >
            Create Contest
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
          {contests.map((contest) => (
            <Card
              key={contest.id}
              elevation={0}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Chip
                    label={contest.status}
                    size="small"
                    sx={{
                      bgcolor: contest.status === 'ACTIVE' ? '#ef4444' : '#64748b',
                      color: 'white',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(contest.created_at).toLocaleDateString()}
                  </Typography>
                </Box>

                <Chip
                  label="Alert Contest"
                  size="small"
                  sx={{
                    mb: 2,
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />

                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {contest.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 48 }}>
                  {contest.description || 'No description'}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <VideoLibraryIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  <Typography variant="body2" fontWeight={700} color="primary.main">
                    {contest.submission_count} SUBMISSIONS
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                  <Link href={`/moderation/contests/${contest.id}/submissions`} passHref>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: '#3b82f6',
                        '&:hover': { bgcolor: '#2563eb' },
                      }}
                    >
                      View Submissions
                    </Button>
                  </Link>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleStatusChange(contest.id, contest.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                    sx={{
                      borderColor: contest.status === 'ACTIVE' ? '#f59e0b' : '#22c55e',
                      color: contest.status === 'ACTIVE' ? '#f59e0b' : '#22c55e',
                      '&:hover': {
                        borderColor: contest.status === 'ACTIVE' ? '#d97706' : '#16a34a',
                        bgcolor: contest.status === 'ACTIVE' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                      },
                    }}
                  >
                    {contest.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="text"
                    fullWidth
                    onClick={() => handleDelete(contest.id)}
                    sx={{
                      color: '#ef4444',
                      '&:hover': {
                        bgcolor: 'rgba(239, 68, 68, 0.1)',
                      },
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <CreateContestModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false)
          fetchContests()
        }}
      />
    </Box>
  )
}

function CreateContestModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
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
          ...formData,
          submission_count: 0
        })

      if (insertError) throw insertError
      
      onSuccess()
      setFormData({ title: '', description: '', status: 'ACTIVE' })
    } catch (err: any) {
      setError(err.message || 'Failed to create contest')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiBackdrop-root': {
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
        },
      }}
      PaperProps={{
        sx: {
          bgcolor: 'rgba(15, 23, 42, 0.95)',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              }}
            >
              <AddIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: 'text.primary' }}>
                Create New Contest
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Start collecting video submissions
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <Divider sx={{ mx: 3 }} />

        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              label="Contest Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., SUB ALERT SUGGESTIONS"
              autoFocus
              InputLabelProps={{
                sx: { color: 'text.secondary' }
              }}
              InputProps={{
                sx: {
                  color: 'text.primary',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&::placeholder': {
                    color: 'text.secondary',
                    opacity: 0.5,
                  },
                }
              }}
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this contest is about..."
              InputLabelProps={{
                sx: { color: 'text.secondary' }
              }}
              InputProps={{
                sx: {
                  color: 'text.primary',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&::placeholder': {
                    color: 'text.secondary',
                    opacity: 0.5,
                  },
                }
              }}
            />

            <FormControl fullWidth>
              <InputLabel sx={{ color: 'text.secondary' }}>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                label="Status"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                  '& .MuiSelect-icon': {
                    color: 'white',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: 'rgba(15, 23, 42, 0.98)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                    },
                  },
                }}
              >
                <MenuItem value="ACTIVE">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="ACTIVE" size="small" sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 700 }} />
                    <Typography variant="body2">Start collecting submissions</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="INACTIVE">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="INACTIVE" size="small" sx={{ bgcolor: '#64748b', color: 'white', fontWeight: 700 }} />
                    <Typography variant="body2">Pause submissions</Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {error && (
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid #ef4444',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Typography variant="body2" color="error.main" fontWeight={600}>
                  {error}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <Divider sx={{ mx: 3 }} />

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={onClose} 
            variant="outlined"
            size="large"
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            sx={{ minWidth: 150 }}
          >
            {loading ? 'Creating...' : 'Create Contest'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

