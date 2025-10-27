'use client'

import { Chip, Box } from '@mui/material'
import { SubmissionStatus } from '@/types'

interface StatusFilterProps {
  currentStatus: SubmissionStatus | 'ALL'
  onStatusChange: (status: SubmissionStatus | 'ALL') => void
}

const statusOptions = [
  { value: 'ALL', label: 'All', count: 0 },
  { value: 'UNAPPROVED', label: 'Unapproved', count: 0 },
  { value: 'APPROVED', label: 'Approved', count: 0 },
  { value: 'DENIED', label: 'Denied', count: 0 },
  { value: 'WINNER', label: 'Winners', count: 0 },
] as const

export default function StatusFilter({ currentStatus, onStatusChange }: StatusFilterProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
      {statusOptions.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          onClick={() => onStatusChange(option.value)}
          clickable
          color={currentStatus === option.value ? 'primary' : 'default'}
          sx={{
            fontWeight: 600,
            ...(currentStatus === option.value && {
              boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
            }),
          }}
        />
      ))}
    </Box>
  )
}
