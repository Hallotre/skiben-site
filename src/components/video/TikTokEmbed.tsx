'use client'

interface TikTokEmbedProps {
  videoId: string
  title?: string
  className?: string
}

export default function TikTokEmbed({ 
  videoId, 
  title = 'TikTok Video',
  className = ''
}: TikTokEmbedProps) {
  // TikTok embed URL format
  const embedUrl = `https://www.tiktok.com/embed/${videoId}`

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative w-full h-0 pb-[177.78%]"> {/* 9:16 portrait aspect ratio */}
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

