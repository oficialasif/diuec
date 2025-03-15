'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const checkAuth = () => {
      if (!loading) {
        if (!user) {
          console.log('No user found, redirecting from:', pathname) // Debug log
          timeoutId = setTimeout(() => {
            toast.error('Please sign in to access this page')
            router.replace('/login')
          }, 100)
        } else if (pathname.startsWith('/admin') && (!userProfile || userProfile.role !== 'admin')) {
          console.log('Non-admin user accessing admin route:', pathname) // Debug log
          timeoutId = setTimeout(() => {
            toast.error('Access denied. Admin privileges required.')
            router.replace('/dashboard')
          }, 100)
        } else {
          console.log('User authenticated:', user.email) // Debug log
        }
      }
    }

    checkAuth()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [user, userProfile, loading, router, pathname])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    )
  }

  // If no user or trying to access admin without privileges, show nothing (will redirect)
  if (!user || (pathname.startsWith('/admin') && (!userProfile || userProfile.role !== 'admin'))) {
    return null
  }

  // User is authenticated and has proper permissions, show content
  return <>{children}</>
} 