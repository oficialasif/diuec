'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { AuthModal } from '@/components/auth/auth'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/shared/ui/avatar'
import { Button } from '@/components/shared/ui/button'
import { User, LogOut, Settings, Trophy } from 'lucide-react'

export default function Navbar() {
  const { user, userProfile, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-violet-500/20 h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-500 to-violet-200 bg-clip-text text-transparent">DIU ESPORTS</h1>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="/community" 
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors nav-item relative after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-violet-500 after:bottom-[-4px] after:left-0 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
          >
            COMMUNITY
          </Link>

          {/* Tournaments Dropdown */}
          <div className="relative group">
            <Link 
              href="/tournaments" 
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors nav-item relative after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-violet-500 after:bottom-[-4px] after:left-0 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              TOURNAMENTS
            </Link>
            <div className="absolute left-0 mt-2 w-48 bg-black rounded-md shadow-lg overflow-hidden z-20 transform scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-300 origin-top">
              <div className="py-2">
                <Link
                  href="/tournaments/pubg"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-violet-900 hover:text-white transition-colors"
                >
                  PUBG
                </Link>
                <Link
                  href="/tournaments/free-fire"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-violet-900 hover:text-white transition-colors"
                >
                  FREE FIRE
                </Link>
                <Link
                  href="/tournaments/football"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-violet-900 hover:text-white transition-colors"
                >
                  FOOTBALL
                </Link>
                <Link
                  href="/tournaments/valorant"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-violet-900 hover:text-white transition-colors"
                >
                  VALORANT
                </Link>
                <Link
                  href="/tournaments/cs2"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-violet-900 hover:text-white transition-colors"
                >
                  CS2
                </Link>
              </div>
            </div>
          </div>

          <Link 
            href="/teams" 
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors nav-item relative after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-violet-500 after:bottom-[-4px] after:left-0 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
          >
            TEAMS
          </Link>
          <Link 
            href="/about" 
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors nav-item relative after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-violet-500 after:bottom-[-4px] after:left-0 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
          >
            ABOUT
          </Link>

          {/* Conditional nav items that only appear when logged in */}
          {user && (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors nav-item relative after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-violet-500 after:bottom-[-4px] after:left-0 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
              >
                DASHBOARD
              </Link>
              <Link
                href="/chat"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors nav-item relative after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-violet-500 after:bottom-[-4px] after:left-0 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
              >
                CHAT
              </Link>
            </>
          )}
        </nav>

        {/* Auth Buttons or Profile */}
        <div className="flex items-center gap-4">
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

              {/* Profile Dropdown */}
              <div className="absolute right-0 mt-2 w-56 bg-black/95 rounded-md shadow-lg overflow-hidden z-20 transform scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-300 origin-top-right border border-violet-500/20">
                <div className="p-2">
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
  