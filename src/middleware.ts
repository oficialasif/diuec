import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Public routes that don't require authentication
const publicPaths = [
  '/',
  '/about',
  '/tournaments',
  '/contact',
  '/community',
  '/auth/login',
  '/auth/register',
  '/auth/admin-login',
  '/diuec',
]

// Protected routes that require authentication
const protectedPaths = [
]

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')
  const pathname = request.nextUrl.pathname

  // Redirect to admin login if trying to access admin pages without session
  if (pathname.startsWith('/(protected)/admin') && !pathname.includes('/login')) {
    if (!session) {
      return NextResponse.redirect(new URL('/(protected)/admin/login', request.url))
    }
  }

  // Prevent accessing admin login page if already logged in
  if (pathname === '/(protected)/admin/login' && session) {
    return NextResponse.redirect(new URL('/(protected)/admin', request.url))
  }

  // Check if the path starts with any of the protected or public paths
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))
  const isProtectedPath = protectedPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))
  const isAuthPath = pathname.startsWith('/auth/')

  // Get the token from cookies
  const token = request.cookies.get('session')?.value

  // If it's an auth path and user is logged in, redirect to dashboard
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If it's a protected path and user is not authenticated, redirect to login
  if (isProtectedPath && !token) {
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    response.cookies.delete('session') // Clear any invalid session
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 