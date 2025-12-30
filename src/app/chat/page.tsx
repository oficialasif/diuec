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
  serverTimestamp,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore'
import { toast } from 'react-hot-toast'
import { Loader2, Send, ImageIcon, X, Search, MoreHorizontal, Phone, Video, Smile, Paperclip } from 'lucide-react'
import Image from 'next/image'

interface Message {
  id: string
  text: string
  imageUrl?: string
  userId: string
  userName: string
  userAvatar: string
  createdAt: Timestamp
}

const ChatSidebar = ({ active, setActive }: { active: string, setActive: (id: string) => void }) => {
  const conversations = [
    { id: 'general', name: 'General Chat', avatar: '/branding/logo.png', lastMessage: 'Anyone up for a scrim?', time: '2m' },
    { id: 'valorant', name: 'Valorant Community', avatar: 'https://seeklogo.com/images/V/valorant-logo-FAB2CA0E55-seeklogo.com.png', lastMessage: 'Ranked grind starts at 8', time: '1h' },
    { id: 'pubg', name: 'PUBG Mobile', avatar: 'https://w7.pngwing.com/pngs/380/764/png-transparent-pubg-mobile-playerunknown-s-battlegrounds-video-game-battle-royale-game-tencent-games-game-logo-video-game.png', lastMessage: 'Tournament registration open', time: '3h' },
  ]

  return (
    <div className="w-full md:w-80 border-r border-zinc-800 flex flex-col bg-black md:flex">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search Messenger"
            className="w-full bg-zinc-900 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActive(conv.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${active === conv.id ? 'bg-violet-900/20' : 'hover:bg-zinc-900'}`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 ring-2 ring-transparent">
                  {/* Placeholder for conv avatars if external links fail */}
                  <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-xs font-bold">
                    {conv.name.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                {/* Online Indicator Mock */}
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black"></div>
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-sm text-zinc-100">{conv.name}</h3>
                <div className="flex justify-between items-center text-xs text-zinc-500 mt-1">
                  <span className="truncate max-w-[120px]">{conv.lastMessage}</span>
                  <span>{conv.time}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { user, userProfile } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [activeChat, setActiveChat] = useState('general')

  useEffect(() => {
    // Only fetch for General for now as backend only supports one channel
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
      setTimeout(scrollToBottom, 100)
    })

    return () => unsubscribe()
  }, [])

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
    if (!timestamp) return ''
    const date = timestamp.toDate()
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (!user) {
    return (
      <div className="fixed inset-0 top-16 bg-black flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-violet-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <Send className="w-10 h-10 text-white ml-1" />
          </div>
          <h1 className="text-3xl font-bold text-white">Join the Conversation</h1>
          <p className="text-zinc-400">Please sign in to access the community chat.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 top-16 bg-black flex overflow-hidden">
      {/* Sidebar - Hidden on mobile unless toggled (simplified for now as always visible on desktop, hidden on mobile) */}
      <div className="hidden md:flex h-full">
        <ChatSidebar active={activeChat} setActive={setActiveChat} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-black relative">
        {/* Chat Header */}
        <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 bg-black/50 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              {/* Mobile back button or menu could go here */}
            </div>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white">
                GC
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
            </div>
            <div>
              <h2 className="font-bold text-white leading-tight">General Chat</h2>
              <p className="text-xs text-green-500">Active now</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-violet-500">
            <Phone className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            <Video className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            <MoreHorizontal className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
          {messages.map((message, index) => {
            const isMe = message.userId === user.uid
            const showAvatar = index === 0 || messages[index - 1].userId !== message.userId

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'} group`}
              >
                {!isMe && (
                  <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-auto ${!showAvatar ? 'opacity-0' : ''}`}>
                    <Image
                      src={message.userAvatar || '/placeholder.jpg'}
                      alt={message.userName}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}

                <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Name on hover or first message in group */}
                  {!isMe && showAvatar && (
                    <span className="text-[10px] text-zinc-500 ml-1 mb-1">{message.userName}</span>
                  )}

                  <div
                    className={`
                            px-4 py-2 break-words relative
                            ${isMe
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl rounded-tr-none'
                        : 'bg-zinc-800 text-zinc-100 rounded-2xl rounded-tl-none'
                      }
                          `}
                  >
                    {message.text}
                    {message.imageUrl && (
                      <div className="mt-2 rounded-lg overflow-hidden">
                        <Image src={message.imageUrl} alt="attachment" width={300} height={200} className="w-full h-auto object-cover" />
                      </div>
                    )}
                  </div>

                  <span className={`text-[10px] text-zinc-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                    {formatTime(message.createdAt)}
                  </span>
                </div>
              </motion.div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black border-t border-zinc-800 shrink-0">
          {imageUrl && (
            <div className="relative inline-block mb-2">
              <Image src={imageUrl} alt="preview" width={64} height={64} className="rounded-lg border border-zinc-700" />
              <button onClick={() => setImageUrl('')} className="absolute -top-2 -right-2 bg-zinc-800 rounded-full p-1 border border-zinc-700">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-violet-500">
              <button type="button" className="p-2 hover:bg-zinc-900 rounded-full transition-colors"><ImageIcon className="w-5 h-5" /></button>
              <button type="button" className="p-2 hover:bg-zinc-900 rounded-full transition-colors hidden sm:block"><Paperclip className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-zinc-900 text-white rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all border border-transparent shadow-sm"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
                <Smile className="w-5 h-5" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!newMessage.trim() && !imageUrl}
              className="p-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}