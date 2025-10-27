'use client'

import { useState, useEffect } from 'react'
import { Box, SxProps } from '@mui/material'

interface SeventvEmoteProps {
  emoteId: string
  size?: '1x' | '2x' | '3x' | '4x'
  alt?: string
  sx?: SxProps
  onClick?: () => void
}

export default function SeventvEmote({ 
  emoteId, 
  size = '3x', 
  alt = 'emote',
  sx,
  onClick
}: SeventvEmoteProps) {
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const emoteUrl = `https://cdn.7tv.app/emote/${emoteId}/${size}.avif`

  // Convert size to pixel dimensions
  const sizeMap: Record<string, string> = {
    '1x': '28px',
    '2x': '56px',
    '3x': '112px',
    '4x': '224px'
  }

  const pixelSize = sizeMap[size] || '112px'

  // Prevent hydration mismatch - don't render img until mounted
  if (!mounted) {
    return (
      <Box
        sx={{
          width: pixelSize,
          height: pixelSize,
          ...sx
        }}
      />
    )
  }

  return (
    <Box
      component="img"
      src={emoteUrl}
      alt={alt}
      onClick={onClick}
      onError={() => setError(true)}
      sx={{
        width: pixelSize,
        height: pixelSize,
        objectFit: 'contain',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease',
        '&:hover': onClick ? {
          transform: 'scale(1.1)',
        } : {},
        display: error ? 'none' : 'block',
        ...sx
      }}
    />
  )
}

