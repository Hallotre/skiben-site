
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const cookies: CookieMethodsServer = {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // IMPORTANT: set cookies on BOTH request and response (Next's recommended pattern)
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    }

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies,
    cookieOptions: {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 400, // 400 days
    },
  })

  // IMPORTANT: await session refresh so Set-Cookie headers are applied before returning.
  await supabase.auth.getSession()

  return response
}
