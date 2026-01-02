'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { AuthModal } from '@/components/auth/auth'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/shared/ui/avatar'
import { Button } from '@/components/shared/ui/button'
import { User, LogOut, Settings, Trophy, Menu, X, ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const pathname = usePathname()

  // Early return MUST be before any hooks to maintain hook order
  if (pathname?.startsWith('/diuec') || pathname?.startsWith('/auth')) {
    return null
  }

  const { user, userProfile, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setActiveMobileDropdown(null)
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

  const handleMobileDropdownToggle = (href: string) => {
    setActiveMobileDropdown(activeMobileDropdown === href ? null : href)
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  // State for dynamic navigation
  const [games, setGames] = useState<{ name: string; displayName: string }[]>([])

  useEffect(() => {
    // Fetch active games for the dropdown
    const fetchGames = async () => {
      try {
        const { getActiveGames } = await import('@/lib/game-services')
        const activeGames = await getActiveGames()
        setGames(activeGames)
      } catch (error) {
        console.error('Failed to fetch games for navbar', error)
      }
    }
    fetchGames()
  }, [])

  const navItems = [
    { href: '/', label: 'HOME' },
    // { href: '/community', label: 'COMMUNITY' }, // Temporarily disabled
    {
      href: '/tournaments',
      label: 'TOURNAMENTS',
      dropdownItems: games.length > 0 ? games.map(game => ({
        href: `/games/${game.name.toLowerCase()}`,
        label: game.displayName.toUpperCase()
      })) : [
        { href: '/games/pubg', label: 'PUBG' }, // Failsafe defaults
        { href: '/games/free-fire', label: 'FREE FIRE' }
      ]
    },
    { href: '/teams', label: 'TEAMS' },
    { href: '/about', label: 'ABOUT' },
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
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-500 to-violet-200 bg-clip-text text-transparent cursor-default">DIU ESPORTS</h1>
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

              {item.dropdownItems && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-black/95 rounded-md shadow-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-violet-500/20">
                  <div className="py-2">
                    {item.dropdownItems.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.href}
                        href={dropdownItem.href}
                        className={cn(
                          "block px-4 py-2 text-sm transition-colors",
                          isActive(dropdownItem.href) ? "bg-violet-900/50 text-white" : "text-gray-300 hover:bg-violet-900 hover:text-white"
                        )}
                      >
                        {dropdownItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-violet-200 hover:bg-violet-600/20 hover:text-white transition-colors rounded-sm"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  href="/my-tournaments"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-violet-200 hover:bg-violet-600/20 hover:text-white transition-colors rounded-sm"
                >
                  <Trophy className="w-4 h-4" />
                  My Tournaments
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-violet-200 hover:bg-violet-600/20 hover:text-white transition-colors rounded-sm"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <div className="h-px bg-violet-500/20 my-2"></div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors rounded-sm w-full"
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
                  {item.dropdownItems ? (
                    // If the item has dropdown items, make it a button
                    <div>
                      <button
                        onClick={() => handleMobileDropdownToggle(item.href)}
                        className="flex items-center justify-between w-full py-3 text-base font-medium text-gray-300 hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(isActive(item.href) && "text-violet-400")}>{item.label}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-5 w-5 transition-transform duration-200",
                            activeMobileDropdown === item.href ? "rotate-180" : ""
                          )}
                        />
                      </button>

                      <div
                        className={cn(
                          "overflow-hidden transition-all duration-200 ease-in-out",
                          activeMobileDropdown === item.href ? "max-h-96" : "max-h-0"
                        )}
                      >
                        <div className="pl-4 py-2 space-y-2 bg-violet-500/5">
                          {item.dropdownItems.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.href}
                              href={dropdownItem.href}
                              className={cn(
                                "flex items-center gap-2 py-2 text-sm transition-colors",
                                isActive(dropdownItem.href) ? "text-violet-400" : "text-gray-400 hover:text-white"
                              )}
                              onClick={() => {
                                setIsMobileMenuOpen(false)
                                setActiveMobileDropdown(null)
                              }}
                            >
                              <ChevronRight className="h-4 w-4" />
                              <span>{dropdownItem.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Regular link without dropdown
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
                  )}
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
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 py-3 text-base font-medium text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/my-tournaments"
                    className="flex items-center gap-3 py-3 text-base font-medium text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Trophy className="h-5 w-5" />
                    <span>My Tournaments</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 py-3 text-base font-medium text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 py-3 text-base font-medium text-red-400 hover:text-red-300 transition-colors w-full"
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
    </header>
  )
}
