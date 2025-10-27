'use client'

import { useEffect } from 'react'
import { redirect } from 'next/navigation'

export default function WinnersPage() {
  useEffect(() => {
    redirect('/moderation?tab=winners')
  }, [])
  
  return null
}
