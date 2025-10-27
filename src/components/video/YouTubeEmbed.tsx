'use client'

import { Platform } from '@/types'

interface YouTubeEmbedProps {
  videoId: string
  title?: string
  autoplay?: boolean
  className?: string
}

export default function YouTubeEmbed({ 
  videoId, 
  title = 'YouTube Video',
  autoplay = false,
  className = ''
}: YouTubeEmbedProps) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1${
    autoplay ? '&autoplay=1' : ''
  }`

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative w-full h-0 pb-[56.25%]"> {/* 16:9 aspect ratio */}
        <iframe
          src={embedUrl}
          title={title}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}

