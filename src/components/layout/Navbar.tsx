'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { AuthModal } from '@/components/auth/auth'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/shared/ui/avatar'
import { Button } from '@/components/shared/ui/button'
import { User, LogOut, Settings, Trophy, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

import { ProfileEditModal } from '@/components/profile/ProfileEditModal'
import { MyTournamentsModal } from '@/components/tournaments/MyTournamentsModal'

export default function Navbar() {
  const pathname = usePathname()

  // Early return MUST be before any hooks to maintain hook order
  if (pathname?.startsWith('/diuec') || pathname?.startsWith('/auth')) {
    return null
  }

  const { user, userProfile, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showTournamentsModal, setShowTournamentsModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [isScrolled, setIsScrolled] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow

    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = originalStyle
    }

    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [isMobileMenuOpen])



  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    // Special check for Tournaments to enable active state for Game pages
    if (href === '/tournaments') {
      return pathname?.startsWith('/tournaments') || pathname?.startsWith('/games')
    }
    return pathname?.startsWith(href)
  }

  const navItems = [
    { href: '/', label: 'HOME' },
    // { href: '/community', label: 'COMMUNITY' }, // Temporarily disabled
    { href: '/tournaments', label: 'TOURNAMENTS' },
    { href: '/teams', label: 'TEAMS' },
    { href: '/leaderboard', label: 'LEADERBOARD' },
  ]

  const authNavItems = user ? [
    { href: '/dashboard', label: 'DASHBOARD' },
    { href: '/chat', label: 'CHAT' },
  ] : []

  const handleSignOut = async () => {
    await signOut()
    setIsMobileMenuOpen(false)
  }

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-16 border-b",
        isScrolled
          ? "bg-black/80 backdrop-blur-md border-violet-500/20 shadow-lg"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-500 to-violet-200 bg-clip-text text-transparent cursor-default">DIU Esports Community</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-all duration-300 nav-item relative flex items-center gap-2",
                  isActive(item.href) ? "text-white" : "text-gray-400 hover:text-white"
                )}
              >
                {isActive(item.href) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.5)] animate-pulse" />
                )}
                {item.label}
              </Link>


            </div>
          ))}

          {authNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-all duration-300 nav-item relative flex items-center gap-2",
                isActive(item.href) ? "text-white" : "text-gray-400 hover:text-white"
              )}
            >
              {isActive(item.href) && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.5)] animate-pulse" />
              )}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:block">
          {user ? (
            <div className="relative group">
              <div className="flex items-center gap-3 cursor-pointer">
                <span className="text-sm font-medium text-violet-200">{userProfile?.displayName}</span>
                <Avatar className="h-10 w-10 ring-2 ring-violet-500/50 transition duration-300 group-hover:ring-violet-500">
                  <AvatarImage src={userProfile?.photoURL || ''} />
                  <AvatarFallback className="bg-violet-600 text-white">
                    {userProfile?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="absolute right-0 mt-2 w-56 bg-black/95 rounded-md shadow-lg overflow-hidden z-20 transform scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-300 origin-top-right border border-violet-500/20">
                <div className="px-4 py-2 text-sm text-violet-200">
                  <p className="font-medium">{userProfile?.displayName}</p>
                  <p className="text-xs text-violet-400/70">{userProfile?.email}</p>
                </div>
                <div className="h-px bg-violet-500/20 my-2"></div>

                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-violet-200 hover:bg-violet-600/20 hover:text-white transition-colors rounded-sm w-full text-left"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={() => setShowTournamentsModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-violet-200 hover:bg-violet-600/20 hover:text-white transition-colors rounded-sm w-full text-left"
                >
                  <Trophy className="w-4 h-4" />
                  My Tournaments
                </button>

                <div className="h-px bg-violet-500/20 my-2"></div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors rounded-sm w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="rounded-full border-violet-500 text-violet-400 hover:bg-violet-500 hover:text-white transition-all duration-300"
              onClick={() => setShowAuthModal(true)}
            >
              SIGN IN
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors ml-auto"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "fixed inset-0 top-16 bg-black z-[60] transition-transform duration-300 md:hidden overflow-y-auto border-t border-zinc-800",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Mobile User Profile Section */}
          {user && (
            <div className="px-4 py-6 border-b border-violet-500/20">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 ring-2 ring-violet-500/50">
                  <AvatarImage src={userProfile?.photoURL || ''} />
                  <AvatarFallback className="bg-violet-600 text-white">
                    {userProfile?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{userProfile?.displayName}</p>
                  <p className="text-sm text-gray-400 truncate">{userProfile?.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Navigation Items */}
          <nav className="px-4 py-6 space-y-6">
            {/* Main Navigation */}
            <div className="space-y-1">
              {navItems.map((item) => (
                <div key={item.href} className="border-b border-violet-500/10 last:border-0">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between py-3 text-base font-medium transition-colors",
                      isActive(item.href) ? "text-violet-400" : "text-gray-300 hover:text-white"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                  </Link>
                </div>
              ))}
            </div>

            {/* Auth Navigation */}
            {user ? (
              <div className="space-y-1">
                <div className="pt-4 border-t border-violet-500/20">
                  {authNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center py-3 text-base font-medium transition-colors",
                        isActive(item.href) ? "text-violet-400" : "text-gray-300 hover:text-white"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setShowProfileModal(true)
                    }}
                    className="flex items-center gap-3 py-3 text-base font-medium text-gray-300 hover:text-white transition-colors w-full text-left"
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setShowTournamentsModal(true)
                    }}
                    className="flex items-center gap-3 py-3 text-base font-medium text-gray-300 hover:text-white transition-colors w-full text-left"
                  >
                    <Trophy className="h-5 w-5" />
                    <span>My Tournaments</span>
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 py-3 text-base font-medium text-red-400 hover:text-red-300 transition-colors w-full text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-violet-500/20 space-y-4">
                <Button
                  variant="outline"
                  className="w-full rounded-full border-violet-500 text-violet-400 hover:bg-violet-500 hover:text-white transition-all duration-300"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    setShowAuthModal(true)
                  }}
                >
                  SIGN IN
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white hover:bg-violet-500/10"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    setShowAuthModal(true)
                    // You can add a way to switch to signup in the AuthModal here
                  }}
                >
                  CREATE ACCOUNT
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={() => setShowAuthModal(false)}
      />
      <ProfileEditModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
      <MyTournamentsModal
        isOpen={showTournamentsModal}
        onClose={() => setShowTournamentsModal(false)}
      />
    </header>
  )
}
