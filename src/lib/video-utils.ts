import { Platform, VideoMetadata } from '@/types'

// SECURITY: Whitelist of allowed video domains
const ALLOWED_YOUTUBE_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be'
]

const ALLOWED_TIKTOK_DOMAINS = [
  'tiktok.com',
  'www.tiktok.com',
  'vm.tiktok.com'
]

function isValidDomain(hostname: string, allowedDomains: string[]): boolean {
  const lowerHostname = hostname.toLowerCase()
  return allowedDomains.some(domain => 
    lowerHostname === domain || lowerHostname.endsWith('.' + domain)
  )
}

export function extractVideoId(url: string): { platform: Platform; videoId: string } | null {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname
    
    // SECURITY: Validate domain against whitelist
    // YouTube patterns
    if (isValidDomain(hostname, ALLOWED_YOUTUBE_DOMAINS)) {
      let videoId: string | null = null
      
      if (hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1)
      } else if (hostname.includes('youtube.com')) {
        videoId = urlObj.searchParams.get('v')
      }
      
      if (videoId && videoId.trim() !== '') {
        return { platform: 'YOUTUBE', videoId }
      }
    }
    
    // TikTok patterns
    if (isValidDomain(hostname, ALLOWED_TIKTOK_DOMAINS)) {
      const pathMatch = urlObj.pathname.match(/\/video\/(\d+)/)
      if (pathMatch) {
        return { platform: 'TIKTOK', videoId: pathMatch[1] }
      }
    }
    
    return null
  } catch {
    return null
  }
}

export async function fetchVideoMetadata(
  videoId: string,
  platform: Platform,
  apiKey?: string
): Promise<VideoMetadata | null> {
  try {
    // Prefer oEmbed when possible (no API key required)
    if (platform === 'YOUTUBE') {
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`
        const oembedRes = await fetch(oembedUrl)
        if (oembedRes.ok) {
          const oembed = await oembedRes.json()
          return {
            title: oembed.title,
            thumbnail_url: oembed.thumbnail_url
          }
        }
      } catch {}
    }

    if (platform === 'YOUTUBE' && apiKey) {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`
      )
      const data = await response.json()
      
      if (data.items && data.items.length > 0) {
        const video = data.items[0]
        return {
          title: video.snippet.title,
          thumbnail_url: video.snippet.thumbnails?.medium?.url,
          description: video.snippet.description
        }
      }
    }
    
    // Fallback: return basic info
    return {
      title: 'Video',
      thumbnail_url: undefined
    }
  } catch (error: any) {
    console.error('Error fetching video metadata:', error?.message || 'Unknown error')
    return null
  }
}

export function validateVideoUrl(url: string): boolean {
  const result = extractVideoId(url)
  return result !== null
}

export function getEmbedUrl(videoId: string, platform: Platform): string {
  if (platform === 'YOUTUBE') {
    return `https://www.youtube.com/embed/${videoId}`
  } else if (platform === 'TIKTOK') {
    return `https://www.tiktok.com/embed/${videoId}`
  }
  return ''
}

