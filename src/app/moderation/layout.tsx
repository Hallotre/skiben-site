import { redirect } from 'next/navigation'
import { checkRole } from '@/lib/permissions'

// SECURITY: Server-side authorization check for all moderation pages
export default async function ModerationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user has moderator privileges
  const hasAccess = await checkRole(['MODERATOR', 'STREAMER', 'ADMIN'])
  
  if (!hasAccess) {
    // Server-side redirect if unauthorized
    redirect('/')
  }

  return <>{children}</>
}

