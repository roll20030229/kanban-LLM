import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const protectedPaths = ['/', '/settings', '/stats']
  const isProtectedPath = protectedPaths.some(path => pathname === path)

  const authPaths = ['/login']
  const isAuthPath = authPaths.some(path => pathname === path)

  const sharePath = pathname.startsWith('/share/')
  if (sharePath) {
    return NextResponse.next()
  }

  const sessionToken = request.cookies.get('next-auth.session-token') || 
                      request.cookies.get('__Secure-next-auth.session-token') ||
                      request.cookies.get('authjs.session-token') ||
                      request.cookies.get('__Secure-authjs.session-token')

  if (isAuthPath) {
    if (sessionToken) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  if (isProtectedPath) {
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/settings',
    '/stats',
    '/login',
    '/share/:path*',
  ],
}
