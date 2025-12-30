'use client'

import Link from 'next/link'
import { Facebook, Mail, MessageCircle, MessageSquare } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()

  if (pathname === '/chat' || pathname === '/community') {
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
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tournaments" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  Tournaments
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Games */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Games</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tournaments/pubg" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  PUBG
                </Link>
              </li>
              <li>
                <Link href="/tournaments/free-fire" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  Free Fire
                </Link>
              </li>
              <li>
                <Link href="/tournaments/efootball" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
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

        <div className="mt-8 pt-8 border-t border-violet-500/20">
          <p className="text-center text-gray-300 text-sm">
            © {new Date().getFullYear()} DIU Esports Community. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}