'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'react-hot-toast'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
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
            router.replace('/auth/login')
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
  }, [user, loading, router, pathname])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500"></div>
      </div>
    )
  }

  // If no user, show nothing (will redirect)
  if (!user) {
    return null
  }

  // User is authenticated, show content
  return <>{children}</>
} 