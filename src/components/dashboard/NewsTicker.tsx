'use client'

import { motion } from 'framer-motion'
import { Bell, Calendar } from 'lucide-react'

interface NewsItem {
    id: string
    title: string
    type: 'announcement' | 'event'
}

export default function NewsTicker({ items }: { items: NewsItem[] }) {
    if (items.length === 0) return null

    return (
        <div className="w-full bg-violet-950/30 border-b border-violet-500/20 overflow-hidden relative h-10 flex items-center">
            <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-black to-transparent w-20 z-10" />
            <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-black to-transparent w-20 z-10" />

            <div className="flex whitespace-nowrap">
                <motion.div
                    className="flex gap-16 px-4"
                    animate={{ x: [0, -1000] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 20 // Adjust speed based on content length
                    }}
                >
                    {/* Repeat items to create continuous loop illusion */}
                    {[...items, ...items, ...items].map((item, i) => (
                        <div key={`${item.id}-${i}`} className="flex items-center gap-2 text-sm text-gray-300">
                            {item.type === 'announcement' ? (
                                <Bell className="w-4 h-4 text-violet-400" />
                            ) : (
                                <Calendar className="w-4 h-4 text-green-400" />
                            )}
                            <span className="font-medium text-white">{item.title}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}
