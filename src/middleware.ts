// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/settings', '/profile', '/analytics']
const publicRoutes = ['/auth/sign-in', '/auth/sign-up', '/auth/forgot-password']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const token = request.cookies.get('accessToken')?.value || 
                request.cookies.get('refreshToken')?.value

  console.log('Middleware check:', { 
    pathname, 
    hasToken: !!token,
    url: request.url 
  })

  // Skip untuk static files dan API routes
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api') ||
      pathname.includes('.')) {
    return NextResponse.next()
  }

  // Jika sudah login tapi akses auth pages
  if (publicRoutes.some(route => pathname.startsWith(route)) && token) {
    console.log('Already logged in, redirecting to dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Jika tidak login tapi akses protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    console.log('Not authenticated, redirecting to login')
    const redirectUrl = new URL('/auth/sign-in', request.url)
    redirectUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match semua routes kecuali:
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}