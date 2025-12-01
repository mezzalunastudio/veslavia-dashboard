// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/settings', '/profile', '/analytics']
const publicRoutes = ['/auth/sign-in', '/auth/sign-up', '/auth/forgot-password']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Cek KEDUA token - accessToken dan refreshToken
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value
  const hasToken = !!(accessToken || refreshToken)

  console.log('Middleware check:', { 
    pathname, 
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    hasToken,
  })

  // Skip untuk static files, API routes, dan file extensions
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Root path - redirect based on auth
  if (pathname === '/') {
    if (hasToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  // User sudah login tapi akses auth pages -> redirect ke dashboard
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    if (hasToken) {
      console.log('Already authenticated, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // Belum login, biarkan akses auth pages
    return NextResponse.next()
  }

  // User belum login tapi akses protected routes -> redirect ke login
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!hasToken) {
      console.log('Not authenticated, redirecting to sign-in')
      const signInUrl = new URL('/auth/sign-in', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }
    // Sudah login, biarkan akses protected routes
    return NextResponse.next()
  }

  // Default: allow access
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}