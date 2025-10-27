'use client'

import { useEffect } from 'react'
import { redirect } from 'next/navigation'

export default function SubmissionsPage() {
  useEffect(() => {
    redirect('/moderation?tab=submissions')
  }, [])
  
  return null
}
