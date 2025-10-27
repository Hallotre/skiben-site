/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now the default in Next.js 14, no experimental flag needed
  
  // SECURITY: Add security headers to protect against common attacks
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.supabase.co *.twitch.tv; style-src 'self' 'unsafe-inline' *.googleapis.com; font-src 'self' data: *.googleapis.com *.gstatic.com; img-src 'self' data: blob: *.supabase.co *.googleusercontent.com *.twitch.tv *.jtvnw.net static-cdn.jtvnw.net *.7tv.app cdn.7tv.app; connect-src 'self' *.supabase.co *.twitch.tv; frame-src 'self' *.youtube.com *.tiktok.com *.twitch.tv;"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig

