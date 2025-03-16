'use client'

import Link from 'next/link'
import { Facebook, Mail, MessageCircle, MessageSquare } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-violet-500/20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">
              DIU EC
            </h3>
            <p className="text-gray-300">
              The ultimate gaming community at Daffodil International University
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tournaments" className="text-gray-300 hover:text-white transition-colors">
                  Tournaments
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-300 hover:text-white transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-gray-300 hover:text-white transition-colors">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Games */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Games</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tournaments/pubg" className="text-gray-300 hover:text-white transition-colors">
                  PUBG
                </Link>
              </li>
              <li>
                <Link href="/tournaments/free-fire" className="text-gray-300 hover:text-white transition-colors">
                  Free Fire
                </Link>
              </li>
              <li>
                <Link href="/tournaments/efootball" className="text-gray-300 hover:text-white transition-colors">
                  eFootball
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
            <div className="space-y-4">
              <a 
                href="https://facebook.com/diuEsports" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
              >
                <Facebook className="w-5 h-5 text-blue-500 group-hover:text-blue-400" />
                <span>DIU Esports Community</span>
              </a>
              <a 
                href="https://m.me/j/AbaHK1yZtoDtzjle/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
              >
                <MessageSquare className="w-5 h-5 text-blue-600 group-hover:text-blue-500" />
                <span>Join Messenger Group</span>
              </a>
              <a 
                href="mailto:contact@diuec.com" 
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
              >
                <Mail className="w-5 h-5 text-violet-500 group-hover:text-violet-400" />
                <span>contact@diuec.com</span>
              </a>
              <a 
                href="https://discord.gg/diuec" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
              >
                <MessageCircle className="w-5 h-5 text-indigo-500 group-hover:text-indigo-400" />
                <span>Join our Discord</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-violet-500/20">
          <p className="text-center text-gray-300">
            © {new Date().getFullYear()} DIU Esports Community. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 