'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (!loading && user) {
      timeoutId = setTimeout(() => {
        router.replace('/dashboard')
      }, 100) // Small delay to prevent flash
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500"></div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return <>{children}</>
} 