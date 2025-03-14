'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

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
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-gray-300">
                Email: contact@diuec.com
              </li>
              <li className="text-gray-300">
                Discord: DIU EC
              </li>
              <li className="text-gray-300">
                Facebook: DIU Esports Community
              </li>
            </ul>
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