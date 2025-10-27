'use client'

import Link from 'next/link'
import { Box, Typography, Button, Card, CardContent } from '@mui/material'

export default function NotFound() {
  return (
    <Box 
      sx={{ 
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0f1a 0%, #111827 100%)',
        px: 4
      }}
    >
      <Card sx={{ 
          maxWidth: 500,
          bgcolor: 'rgba(26, 26, 46, 0.6)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          textAlign: 'center',
          p: 4
        }}>
          <CardContent>
          {/* Emote */}
          <Box sx={{ mb: 3 }}>
            <img 
              src="https://cdn.7tv.app/emote/01K0PDSQ5E8SPAY3XHQ55JSP4N/4x.avif"
              alt="404 Error"
              style={{ 
                width: '600px',
                height: '200px',
                margin: '0 auto',
                display: 'block'
              }}
            />
          </Box>

          {/* Title */}
          <Typography 
            variant="h4" 
            fontWeight={700}
            gutterBottom
            sx={{ color: 'white', mb: 2 }}
          >
            DÅRLIG DEKNING
          </Typography>

          {/* Message */}
          <Typography 
            variant="body1" 
            sx={{ color: '#94a3b8', mb: 4 }}
          >
            I SYLTE SATAN ASSÅ EG KJENNE EG SPYR!
          </Typography>

          {/* Single Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                  color: 'white',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
                  borderRadius: 1,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #0891b2 100%)',
                    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)',
                  }
                }}
              >
                Tilbake til forsiden
              </Button>
            </Link>
          </Box>
          </CardContent>
        </Card>
      </Box>
  )
}

