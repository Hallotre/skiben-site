import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import MUIAppBar from '@/components/layout/MUIAppBar'
import MUIProvider from '@/providers/MUIProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Skiben',
  description: 'Skibens website',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body 
        className={`${inter.className} min-h-screen`} 
        style={{ 
          margin: 0, 
          padding: 0,
          backgroundColor: '#0a0f1a',
          background: 'linear-gradient(135deg, #0a0f1a 0%, #111827 100%)'
        }}
      >
        <MUIProvider>
          <MUIAppBar />
          {children}
        </MUIProvider>
      </body>
    </html>
  )
}
