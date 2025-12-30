'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DiuecRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/auth/admin-login')
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500"></div>
    </div>
  )
}
