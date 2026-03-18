import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('klikagen_session')
  const { pathname } = request.nextUrl

  // Proteksi khusus rute /dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!session || session.value !== 'authenticated') {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Jika sudah login tapi buka /, lempar ke dashboard
  if (pathname === '/') {
    if (session && session.value === 'authenticated') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Konfigurasi Matcher
export const config = {
  matcher: ['/', '/dashboard/:path*'],
}
