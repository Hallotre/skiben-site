import { useState, useEffect } from 'react'

interface SeventvEmoteProps {
  emoteId: string
  size?: '1x' | '2x' | '3x' | '4x'
}

const sizeMap = {
  '1x': 28,
  '2x': 56,
  '3x': 84,
  '4x': 112
}

export default function SeventvEmote({ emoteId, size = '2x' }: SeventvEmoteProps) {
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadImage = async () => {
      try {
        const url = `https://cdn.7tv.app/emote/${emoteId}/${size}.avif`
        setImageUrl(url)
        setError(false)
      } catch (err) {
        setError(true)
      }
    }
    
    loadImage()
  }, [emoteId, size])

  if (error) {
    return (
      <div 
        className="bg-gray-700 flex items-center justify-center"
        style={{ 
          width: sizeMap[size], 
          height: sizeMap[size],
          imageRendering: 'crisp-edges'
        }}
      >
        <span className="text-xs">?</span>
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={`7tv emote ${emoteId}`}
      className="inline-block"
      style={{ 
        width: sizeMap[size], 
        height: sizeMap[size], 
        objectFit: 'contain',
        imageRendering: 'crisp-edges'
      }}
    />
  )
}
