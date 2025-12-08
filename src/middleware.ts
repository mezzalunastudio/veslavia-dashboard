import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/settings', '/profile', '/analytics']
const publicRoutes = ['/auth/sign-in', '/auth/sign-up', '/auth/forgot-password']
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip untuk static files, API routes, dan file extensions
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  console.log('Middleware check:', { 
    pathname,
    host: request.nextUrl.host,
    origin: request.headers.get('origin')
  })

  // Root path - redirect based on auth
  if (pathname === '/') {
    // Cek auth dengan API call
    const isAuthenticated = await checkAuth(request)
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  // User sudah login tapi akses auth pages -> redirect ke dashboard
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    const isAuthenticated = await checkAuth(request)
    if (isAuthenticated) {
      console.log('Already authenticated, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // User belum login tapi akses protected routes -> redirect ke login
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const isAuthenticated = await checkAuth(request)
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to sign-in')
      const signInUrl = new URL('/auth/sign-in', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

// Fungsi untuk cek auth dengan API call
async function checkAuth(request: NextRequest): Promise<boolean> {
  try {
    // Coba dari cookies dulu
    const accessToken = request.cookies.get('accessToken')?.value
    const refreshToken = request.cookies.get('refreshToken')?.value
    
    if (!accessToken && !refreshToken) {
      return false
    }

    // Buat headers untuk API call
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Tambahkan cookies ke headers jika ada
    const cookieString = []
    if (accessToken) cookieString.push(`accessToken=${accessToken}`)
    if (refreshToken) cookieString.push(`refreshToken=${refreshToken}`)
    
    if (cookieString.length > 0) {
      headers['Cookie'] = cookieString.join('; ')
    }

    // Check auth via API
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
    cookie: request.headers.get('cookie') || ''
  }
    })

    return response.ok
  } catch (error) {
    console.error('Auth check error:', error)
    return false
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}