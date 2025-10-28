'use client'

import { Button } from '@/components/ui/button'

interface StatusFilterProps {
  currentStatus: string
  onStatusChange: (status: string) => void
}

export default function StatusFilter({ currentStatus, onStatusChange }: StatusFilterProps) {
  const statuses = ['ALL', 'APPROVED', 'DENIED', 'UNAPPROVED', 'WINNER']
  
  return (
    <div className="flex gap-2 flex-wrap mb-6">
      {statuses.map(status => (
        <Button
          key={status}
          variant={currentStatus === status ? 'default' : 'outline'}
          onClick={() => onStatusChange(status)}
          size="sm"
        >
          {status}
        </Button>
      ))}
    </div>
  )
}

