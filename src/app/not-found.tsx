'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-[500px] w-full bg-[rgba(26,26,46,0.6)] border border-blue-500/20 text-center">
        <CardContent className="p-8">
          {/* Emote */}
          <div className="mb-6">
            <img
              src="https://cdn.7tv.app/emote/01K0PDSQ5E8SPAY3XHQ55JSP4N/4x.avif"
              alt="404 Error"
              className="mx-auto block"
              style={{ width: '600px', height: '200px' }}
            />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-2">DÅRLIG DEKNING</h2>

          {/* Message */}
          <p className="text-slate-400 mb-3">I SYLTE SATAN ASSÅ EG KJENNE EG SPYR!</p>
          <p className="text-slate-400 mb-6 text-sm">Du prøvde å nå en side som ikke eksisterer.</p>

          {/* Single Button */}
          <div className="flex justify-center">
            <Button asChild className="bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold px-6 py-3 uppercase tracking-wider shadow-[0_4px_6px_-1px_rgba(37,99,235,0.3)] hover:from-blue-700 hover:to-cyan-600">
              <Link href="/">Tilbake til forsiden</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
