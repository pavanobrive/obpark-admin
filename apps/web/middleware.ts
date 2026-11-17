import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const path = url.pathname

  // Check for admin session cookie
  const hasSession = request.cookies.has('admin_session')

  // 1. Root route: Landing page logic
  if (path === '/') {
    if (hasSession) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Login page
  if (path === '/login') {
    const isSessionExpired = url.searchParams.get('session_expired') === 'true'
    if (isSessionExpired) {
      const response = NextResponse.next()
      response.cookies.delete('admin_session')
      response.cookies.delete('refreshToken')
      return response
    }

    if (hasSession) {
      // Already authenticated, redirect to /admin or requested 'next' target
      const nextTarget = url.searchParams.get('next') || '/admin'
      const destination = nextTarget.startsWith('/') ? nextTarget : '/admin'
      return NextResponse.redirect(new URL(destination, request.url))
    }
    return NextResponse.next()
  }

  // 3. Protected admin routes
  if (path.startsWith('/admin')) {
    if (!hasSession) {
      const loginUrl = new URL('/login', request.url)
      const currentFullUrl = path + (url.search || '')
      loginUrl.searchParams.set('next', currentFullUrl)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // 4. Any other non-static route
  if (!hasSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.redirect(new URL('/admin', request.url))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API proxy / routes)
     * - uploads (static media)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - static file extensions (svg, png, jpg, jpeg, gif, webp, css, js, etc.)
     */
    '/((?!api|uploads|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|ico)$).*)',
  ],
}
