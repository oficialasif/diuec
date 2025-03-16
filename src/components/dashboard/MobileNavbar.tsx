'use client'

import { Menu } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'

interface MobileNavbarProps {
  onOpenSidebar: () => void
}

export function MobileNavbar({ onOpenSidebar }: MobileNavbarProps) {
  const { user, userProfile } = useAuth()

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-black/95 border-b border-violet-500/20 z-40 md:hidden backdrop-blur-lg">
      <div className="flex items-center justify-between h-full px-4">
        <button
          onClick={onOpenSidebar}
          className="p-2 hover:bg-violet-500/10 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-violet-400" />
        </button>

        <Link href="/" className="text-xl font-bold text-white">
          DIUEC
        </Link>

        <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center">
          <span className="text-lg font-semibold text-white">
            {userProfile?.displayName?.[0] || user?.email?.[0] || '?'}
          </span>
        </div>
      </div>
    </div>
  )
} 