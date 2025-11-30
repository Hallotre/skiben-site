'use client'

import YouTubeEmbed from './YouTubeEmbed'
import TikTokEmbed from './TikTokEmbed'
import TwitchEmbed from './TwitchEmbed'
import { Platform } from '@/types'

interface VideoPlayerProps {
  videoId: string
  platform: Platform
  title?: string
  autoplay?: boolean
  className?: string
}

export default function VideoPlayer({ 
  videoId, 
  platform, 
  title,
  autoplay = false,
  className = ''
}: VideoPlayerProps) {
  if (platform === 'YOUTUBE') {
    return (
      <YouTubeEmbed 
        videoId={videoId}
        title={title}
        autoplay={autoplay}
        className={className}
      />
    )
  }
  
  if (platform === 'TIKTOK') {
    return (
      <TikTokEmbed 
        videoId={videoId}
        title={title}
        className={className}
      />
    )
  }

  if (platform === 'TWITCH') {
    return (
      <TwitchEmbed 
        videoId={videoId}
        title={title}
        autoplay={autoplay}
        className={className}
      />
    )
  }
  
  return (
    <div className={`bg-dark-800 rounded-lg p-8 text-center ${className}`}>
      <p className="text-gray-400">Unsupported video platform</p>
    </div>
  )
}

