'use client'

import { useAuth } from '@/contexts/auth-context'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { UserNav } from './UserNav'
import { cn } from '@/lib/utils'

// Public navigation items that are always visible
const publicNavItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Tournaments', href: '/tournaments' },
  { label: 'Contact', href: '/contact' },
]

// Protected navigation items that require authentication
const protectedNavItems = [
  { label: 'Community', href: '/community' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Chat', href: '/chat' },
]

export function Navbar() {
  const { user } = useAuth()
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm border-b border-white/10">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="DIU eSports"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-xl font-bold text-white">DIU eSports</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {/* Public Navigation Items - Always visible */}
          {publicNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-violet-400",
                pathname === item.href ? "text-violet-500" : "text-gray-300"
              )}
            >
              {item.label}
            </Link>
          ))}

          {/* Protected Navigation Items - Only visible when logged in */}
          {user && protectedNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-violet-400",
                pathname === item.href ? "text-violet-500" : "text-gray-300"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <UserNav />
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/auth/login">
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
} 