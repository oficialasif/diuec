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
]

// Protected routes that require authentication
const protectedPaths = [
  '/dashboard',
  '/chat'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
} 