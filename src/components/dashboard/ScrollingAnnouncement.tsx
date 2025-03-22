'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Announcement {
  id: string
  text: string
  color: string
  fontSize: string
  fontFamily: string
  active: boolean
  validUntil: Timestamp
  type: 'banner'
}

export function ScrollingAnnouncement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    const now = Timestamp.now()
    const q = query(
      collection(db, 'banner_announcements'),
      where('type', '==', 'banner'),
      where('validUntil', '>', now),
      orderBy('validUntil', 'desc'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newAnnouncements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Announcement[]
      setAnnouncements(newAnnouncements)
    })

    return () => unsubscribe()
  }, [])

  // Function to parse text formatting and links
  const parseText = (text: string) => {
    const parts = []
    let lastIndex = 0
    let match

    // Combined regex for bold, italic, and links
    const formatRegex = /(\*\*.*?\*\*|_.*?_|\[([^\]]+)\]\(([^)]+)\))/g

    while ((match = formatRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }

      const matchedText = match[0]

      if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
        // Bold text
        parts.push(
          <strong key={match.index} className="font-bold">
            {matchedText.slice(2, -2)}
          </strong>
        )
      } else if (matchedText.startsWith('_') && matchedText.endsWith('_')) {
        // Italic text
        parts.push(
          <em key={match.index} className="italic">
            {matchedText.slice(1, -1)}
          </em>
        )
      } else if (matchedText.startsWith('[')) {
        // Link
        const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(matchedText)
        if (linkMatch) {
          parts.push(
            <Link
              key={match.index}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
            >
              {linkMatch[1]}
            </Link>
          )
        }
      }

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }

    return parts
  }

  if (announcements.length === 0) return null

  return (
    <div className="w-full bg-black/40 backdrop-blur-sm py-4 mb-8 overflow-hidden border-t border-b border-violet-500/20">
      <div className="relative max-w-[100vw] mx-auto">
        <div className="flex items-center justify-center">
          <motion.div
            initial={{ x: "50%" }}
            animate={{
              x: ["-100%", "100%"]
            }}
            transition={{
              duration: 30,
              ease: "linear",
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="whitespace-nowrap flex items-center"
          >
            {/* Repeat announcements three times to ensure continuous flow */}
            {[...Array(3)].map((_, i) => (
              announcements.map((announcement) => (
                <span
                  key={`${announcement.id}-${i}`}
                  className={`mx-8 ${announcement.color} ${announcement.fontSize || 'text-base'} ${announcement.fontFamily || 'font-geist-mono'}`}
                >
                  {parseText(announcement.text)}
                </span>
              ))
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
} 