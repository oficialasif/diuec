'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import {
  X,
  Home,
  Trophy,
  Image as ImageIcon,
  FileText,
  Settings,
  LogOut,
  Users,
  Bell,
  UserCircle,
  LogIn
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { MobileNavbar } from './MobileNavbar'

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, userProfile, isAdmin } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = originalStyle
    }
    
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [isOpen])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setIsOpen(false)
      toast.success('Signed out successfully')
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  const menuItems = user ? [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/tournaments', label: 'Tournaments', icon: Trophy },
    { href: '/gallery', label: 'Gallery', icon: ImageIcon },
    { href: '/posts', label: 'Posts', icon: FileText },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/profile', label: 'Profile', icon: UserCircle },
    { href: '/settings', label: 'Settings', icon: Settings },
  ] : [
    { href: '/', label: 'Home', icon: Home },
    { href: '/tournaments', label: 'Tournaments', icon: Trophy },
    { href: '/gallery', label: 'Gallery', icon: ImageIcon },
    { href: '/login', label: 'Sign In', icon: LogIn },
  ]

  const adminMenuItems = [
    { href: '/(protected)/admin', label: 'Admin Dashboard', icon: Home },
    { href: '/(protected)/admin/users', label: 'User Management', icon: Users },
    { href: '/(protected)/admin/gallery', label: 'Photo Gallery', icon: ImageIcon },
    { href: '/(protected)/admin/posts', label: 'Posts', icon: FileText },
    { href: '/(protected)/admin/settings', label: 'Settings', icon: Settings },
  ]

  const items = isAdmin ? adminMenuItems : menuItems

  return (
    <>
      {/* Mobile Navbar */}
      <MobileNavbar onOpenSidebar={() => setIsOpen(true)} />

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-black border-r border-violet-500/20 z-50 md:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-violet-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Menu</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-violet-500/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-violet-400" />
                  </button>
                </div>
                {user && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center">
                      <span className="text-lg font-semibold text-white">
                        {userProfile?.displayName?.[0] || user?.email?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{userProfile?.displayName}</p>
                      <p className="text-sm text-violet-400">{user?.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-violet-600 text-white'
                            : 'text-violet-400 hover:bg-violet-500/10 hover:text-white'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </nav>

              {/* Footer */}
              {user && (
                <div className="p-4 border-t border-violet-500/20">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 