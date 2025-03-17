'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  updateDoc,
  where,
  getDocs,
} from 'firebase/firestore'
import { toast } from 'react-hot-toast'
import { Loader2, Send, Trash2, Users, ImageIcon, X } from 'lucide-react'
import Image from 'next/image'
import { Timestamp } from 'firebase/firestore'

interface Message {
  id: string
  text: string
  imageUrl?: string
  userId: string
  userName: string
  userAvatar: string
  createdAt: Timestamp
}

interface TypingUser {
  userId: string
  displayName: string
  timestamp: Date
}

export default function ChatPage() {
  const { user, userProfile } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return

    // Subscribe to new messages
    const q = query(
      collection(db, 'chat_messages'),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[]
      setMessages(newMessages.reverse())
      scrollToBottom()
    })

    return () => unsubscribe()
  }, [user])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please sign in to send messages')
      return
    }

    const text = newMessage.trim()
    if (!text && !imageUrl) return

    setIsLoading(true)
    try {
      await addDoc(collection(db, 'chat_messages'), {
        text,
        imageUrl: imageUrl || null,
        userId: user.uid,
        userName: userProfile?.displayName || 'Anonymous',
        userAvatar: userProfile?.photoURL || '',
        createdAt: Timestamp.now()
      })

      setNewMessage('')
      setImageUrl('')
      scrollToBottom()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timestamp: Timestamp) => {
    const date = timestamp.toDate()
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-400">
            You need to be signed in to access the chat.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 pt-16 bg-black">
      <div className="h-full max-w-2xl mx-auto flex flex-col bg-gradient-to-b from-violet-950/50 to-black border-x border-violet-500/20">
        {/* Chat Header - Fixed */}
        <div className="absolute top-0 inset-x-0 z-20 bg-black/95 border-b border-violet-500/20 backdrop-blur supports-[backdrop-filter]:bg-black/60">
          <div className="max-w-2xl mx-auto">
            {/* Title Bar */}
            <div className="px-4 py-3 border-b border-violet-500/10">
              <h1 className="text-xl font-bold text-center text-violet-50">
                DIU eSports Community
              </h1>
            </div>
            {/* Chat Info */}
            <div className="px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-violet-200 font-medium">Community Chat</span>
              </div>
              <div className="flex items-center gap-2 text-violet-300/70">
                <Users className="w-4 h-4" />
                <span className="text-sm">{messages.length} messages</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages - Scrollable */}
        <div className="flex-1 overflow-y-auto pt-28 pb-24 space-y-3 px-4 scroll-smooth scrollbar-thin scrollbar-thumb-violet-600/50 scrollbar-track-transparent">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${
                message.userId === user.uid ? 'flex-row-reverse' : ''
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-violet-500/20">
                  <Image
                    src={message.userAvatar || '/android-chrome-192x192.png'}
                    alt={message.userName}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-[10px] text-violet-400/70 text-center">
                  {formatTime(message.createdAt)}
                </span>
              </div>

              <div
                className={`flex flex-col max-w-[75%] ${
                  message.userId === user.uid ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`rounded-2xl px-3 py-2 ${
                    message.userId === user.uid
                      ? 'bg-violet-600 text-white rounded-tr-none'
                      : 'bg-violet-900/40 text-violet-50 rounded-tl-none'
                  }`}
                >
                  <p className="text-xs font-medium mb-0.5 opacity-90">
                    {message.userName}
                  </p>
                  {message.text && (
                    <p className="text-sm break-words leading-relaxed">
                      {message.text}
                    </p>
                  )}
                  {message.imageUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden bg-violet-950/20">
                      <Image
                        src={message.imageUrl}
                        alt="Shared image"
                        width={300}
                        height={200}
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Message Input - Fixed */}
        <div className="absolute bottom-0 inset-x-0 z-20 bg-black/95 border-t border-violet-500/20 backdrop-blur supports-[backdrop-filter]:bg-black/60">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <form onSubmit={handleSendMessage}>
              {imageUrl && (
                <div className="absolute bottom-full mb-4 left-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden ring-2 ring-violet-500/20">
                    <Image
                      src={imageUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute -top-1 -right-1 bg-black/80 rounded-full p-1.5 hover:bg-black transition-colors"
                    >
                      <X className="w-3 h-3 text-violet-200" />
                    </button>
                  </div>
                </div>
              )}
              <div className="relative flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 bg-transparent hover:bg-violet-900/40 text-violet-400"
                >
                  <ImageIcon className="w-5 h-5" />
                </Button>
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-violet-950/40 border-violet-500/20 text-violet-50 placeholder:text-violet-400/50 focus:border-violet-500/50"
                />
                <Button
                  type="submit"
                  disabled={isLoading || (!newMessage.trim() && !imageUrl)}
                  className="absolute right-2 bg-violet-600 hover:bg-violet-700 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 