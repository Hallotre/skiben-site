'use client'

import { useEffect, useState } from 'react'

interface TwitchEmbedProps {
  videoId: string
  title?: string
  className?: string
  autoplay?: boolean
}

export default function TwitchEmbed({ 
  videoId, 
  title = 'Twitch Clip', 
  className = '',
  autoplay = false
}: TwitchEmbedProps) {
  const [parentDomain, setParentDomain] = useState<string>('')

  useEffect(() => {
    // Twitch requires the 'parent' parameter to match the hosting domain
    if (typeof window !== 'undefined') {
      setParentDomain(window.location.hostname)
    }
  }, [])

  if (!parentDomain) {
    return <div className={`bg-black aspect-video animate-pulse ${className}`} />
  }

  const src = `https://clips.twitch.tv/embed?clip=${videoId}&parent=${parentDomain}&autoplay=${autoplay}`

  return (
    <div className={`relative w-full aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
      <iframe
        src={src}
        title={title}
        width="100%"
        height="100%"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  )
}

