// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/settings', '/profile', '/analytics']
const publicRoutes = ['/auth/sign-in', '/auth/sign-up', '/auth/forgot-password']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip auth check untuk public routes dan static files
  if (publicRoutes.includes(pathname) || 
      pathname.startsWith('/_next') || 
      pathname.startsWith('/api/auth') ||
      pathname.includes('.')) {
    return NextResponse.next()
  }

  // Hanya check auth untuk protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    try {
      const authCheck = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
      })

      const isAuthenticated = authCheck.ok

      if (!isAuthenticated) {
        const redirectUrl = new URL('/auth/sign-in', request.url)
        redirectUrl.searchParams.set('callbackUrl', request.url)
        return NextResponse.redirect(redirectUrl)
      }

    } catch (error) {
      const redirectUrl = new URL('/auth/sign-in', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Route redirects
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }
  
  if (request.nextUrl.pathname === '/register') {
    return NextResponse.redirect(new URL('/auth/sign-up', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images/|.*\\.(?:png|jpg|jpeg|gif|svg|ico)$).*)',
  ],
}