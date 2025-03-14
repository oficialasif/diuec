'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'react-hot-toast'

const publicRoutes = ['/', '/auth/login', '/auth/signup']
const authRoutes = ['/auth/login', '/auth/signup']

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      // If the route is an auth route and user is logged in, redirect to dashboard
      if (user && authRoutes.includes(pathname)) {
        router.replace('/dashboard')
        return
      }

      // If the route is protected and user is not logged in, redirect to login
      if (!user && !publicRoutes.includes(pathname)) {
        toast.error('Please sign in to access this page')
        router.replace('/')
        return
      }
    }
  }, [user, loading, pathname, router])

  // Show nothing while checking auth
  if (loading) {
    return null
  }

  // If on auth route and logged in, or on protected route and not logged in, show nothing
  if (
    (user && authRoutes.includes(pathname)) ||
    (!user && !publicRoutes.includes(pathname))
  ) {
    return null
  }

  return <>{children}</>
} 