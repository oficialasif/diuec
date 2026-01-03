'use client'

import Link from 'next/link'
import { Facebook, Mail, MessageCircle, Github } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function Footer() {
  const pathname = usePathname()

  // Hide footer on chat, community, admin, and auth routes
  if (pathname === '/chat' || pathname === '/community' || pathname?.startsWith('/diuec') || pathname?.startsWith('/auth')) {
    return null
  }

  return (
    <footer className="bg-black text-white border-t border-violet-500/20">
      <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">
              DIU EC
            </h3>
            <p className="text-gray-300 text-sm md:text-base">
              The ultimate gaming community at Daffodil International University
            </p>
            <div className="flex gap-4 pt-2">
              <div className="relative w-16 h-16 bg-white/5 rounded-lg p-1">
                <Image
                  src="/images/footer_diu_ec_logo.png"
                  alt="DIU EC Logo"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 64px, 64px"
                />
              </div>
              <div className="relative w-16 h-16 bg-white/5 rounded-lg p-1">
                <Image
                  src="/images/footer_diu_logo.png"
                  alt="DIU Logo"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 64px, 64px"
                />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/tournaments" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  Tournaments
                </Link>
              </li>
              <li>
                <Link href="/teams" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  Teams
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  About
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  Chat
                </Link>
              </li>
            </ul>
          </div>

          {/* Games */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Games</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/games/pubg" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  PUBG
                </Link>
              </li>
              <li>
                <Link href="/games/free-fire" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  Free Fire
                </Link>
              </li>
              <li>
                <Link href="/games/efootball" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  eFootball
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Connect With Us</h4>
            <div className="space-y-3">
              <a
                href="https://www.facebook.com/diuec"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group text-sm md:text-base"
              >
                <Facebook className="w-5 h-5 text-blue-500 group-hover:text-blue-400 flex-shrink-0" />
                <span>DIU Esports Community</span>
              </a>
              <a
                href="https://discord.gg/diuec"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group text-sm md:text-base"
              >
                <MessageCircle className="w-5 h-5 text-indigo-500 group-hover:text-indigo-400 flex-shrink-0" />
                <span>Discord Server</span>
              </a>
              <a
                href="mailto:contact@diuec.com"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group text-sm md:text-base"
              >
                <Mail className="w-5 h-5 text-violet-500 group-hover:text-violet-400 flex-shrink-0" />
                <span>contact@diuec.com</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-violet-500/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-300 text-sm">
            © {new Date().getFullYear()} DIU Esports Community. All rights reserved.
          </p>
          <a
            href="https://github.com/oficialasif"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <span>Developed by</span>
            <Github className="w-4 h-4" />
            <span className="font-medium">oficialasif</span>
          </a>
        </div>
      </div>
    </footer>
  )
}