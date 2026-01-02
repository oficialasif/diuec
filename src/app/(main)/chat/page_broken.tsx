'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { cn } from '@/lib/utils'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  onSnapshot,
  Timestamp,
  where,
} from 'firebase/firestore'
import { toast } from 'react-hot-toast'
import { Loader2, Send, MessageCircle, Users, Headphones, Shield, Hash, ArrowLeft } from 'lucide-react'
import { getTeamsByUser } from '@/lib/team-helpers'
import { Team } from '@/lib/models'

interface Message {
  id: string
  text: string
  channelId: string
  userId: string
  userName: string
  userAvatar: string
  createdAt: Timestamp
}

interface Channel {
  id: string
  name: string
  type: 'support' | 'community' | 'team'
  teamId?: string
  icon: any
  description: string
}

export default function ChatPage() {
  const { user, userProfile, loading } = useAuth()
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(true) // For mobile view
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize channels
  useEffect(() => {
    const initChannels = async () => {
      if (!user) return

      const baseChannels: Channel[] = [
        {
          id: 'support',
          name: 'Support',
          type: 'support',
          icon: Headphones,
          description: 'Get help from admins'
        },
        {
          id: 'community',
          name: 'Community',
          type: 'community',
          icon: Users,
          description: 'Public chat for all members'
        }
      ]

      try {
        const teams = await getTeamsByUser(user.uid)
        const teamChannels: Channel[] = teams.map((team: Team) => ({
          id: `team-${team.id}`,
          name: team.name,
          type: 'team' as const,
          teamId: team.id,
          icon: Shield,
          description: `Team chat • ${team.members.length} members`
        }))

        setChannels([...baseChannels, ...teamChannels])
        setSelectedChannel(baseChannels[1]) // Default to community
      } catch (error) {
        console.error('Error loading channels:', error)
        setChannels(baseChannels)
        setSelectedChannel(baseChannels[1])
      }
    }

    initChannels()
  }, [user])

  // Listen to messages for selected channel
  useEffect(() => {
    if (!selectedChannel || !user) {
      console.log('No channel or user selected')
      return
    }

    console.log('Setting up listener for channel:', selectedChannel.id)
    let unsubscribe: (() => void) | undefined

    const setupChannelListener = async () => {
      try {
        const {
          findOrCreateSupportConversation,
          findOrCreateCommunityConversation,
          findOrCreateTeamConversation,
          subscribeToConversationMessages
        } = await import('@/lib/services/conversation-service')

        let conversationId: string

        // Get or create conversation based on channel type
        if (selectedChannel.id === 'support') {
          conversationId = await findOrCreateSupportConversation(
            user.uid,
            userProfile?.displayName || 'Anonymous',
            userProfile?.photoURL || ''
          )
          console.log('Support conversation ID:', conversationId)
        } else if (selectedChannel.id === 'community') {
          conversationId = await findOrCreateCommunityConversation()
          console.log('Community conversation ID:', conversationId)
        } else if (selectedChannel.id.startsWith('team-')) {
          const teamId = selectedChannel.teamId || selectedChannel.id.replace('team-', '')
          conversationId = await findOrCreateTeamConversation(
            teamId,
            selectedChannel.name
          )
          console.log('Team conversation ID:', conversationId)
        } else {
          console.warn('Unknown channel type:', selectedChannel.id)
          return
        }

        // Listen to messages in that conversation
        unsubscribe = subscribeToConversationMessages(conversationId, (msgs) => {
          const timestamp = new Date().toISOString()
          console.log(`[${timestamp}] Chat page received ${msgs.length} messages for channel ${selectedChannel.id}`)

          const formattedMessages = msgs.map(msg => ({
            id: msg.id,
            text: msg.text,
            channelId: msg.channelId,
            userId: msg.userId,
            userName: msg.userName,
            userAvatar: msg.userAvatar,
            createdAt: Timestamp.fromDate(msg.createdAt)
          }))

          console.log(`[${timestamp}] Setting state with ${formattedMessages.length} messages`)
          setMessages(formattedMessages)
          setTimeout(scrollToBottom, 100)
        })
      } catch (error) {
        console.error('Error setting up channel listener:', error)
        toast.error('Failed to load messages')
      }
    }

    setupChannelListener()

    return () => {
      console.log('Cleaning up listener for channel:', selectedChannel.id)
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [selectedChannel, user, userProfile])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedChannel) {
      toast.error('Please sign in to send messages')
      return
    }

    const text = newMessage.trim()
    if (!text) return

    setIsLoading(true)
    try {
      const {
        findOrCreateSupportConversation,
        findOrCreateCommunityConversation,
        findOrCreateTeamConversation,
        addMessageToConversation
      } = await import('@/lib/services/conversation-service')

      let conversationId: string

      // Get or create conversation based on channel type
      if (selectedChannel.id === 'support') {
        conversationId = await findOrCreateSupportConversation(
          user.uid,
          userProfile?.displayName || 'Anonymous'
        )
      } else if (selectedChannel.id === 'community') {
        conversationId = await findOrCreateCommunityConversation()
      } else if (selectedChannel.id.startsWith('team-')) {
        const teamId = selectedChannel.teamId || selectedChannel.id.replace('team-', '')
        conversationId = await findOrCreateTeamConversation(
          teamId,
          selectedChannel.name
        )
      } else {
        throw new Error('Unknown channel type')
      }

      // Add message to conversation
      await addMessageToConversation(
        conversationId,
        user.uid,
        userProfile?.displayName || 'Anonymous',
        userProfile?.photoURL || '',
        text,
        selectedChannel.id,
        false
      )

      setNewMessage('')
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
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Join the Conversation</h1>
          <p className="text-zinc-400">Please sign in to access the community chat.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 top-16 bg-black flex overflow-hidden">
      {/* Channels Sidebar */}
      <div className="w-64 border-r border-zinc-800 bg-zinc-900/30 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-violet-400" />
            Channels
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {/* Support Channel */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 px-2 mb-1 uppercase tracking-wider">Help</p>
            {channels.filter(c => c.type === 'support').map((channel) => {
              const Icon = channel.icon
              return (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`w-full p-3 rounded-lg mb-1 flex items-center gap-3 transition-colors ${selectedChannel?.id === channel.id
                    ? 'bg-violet-600 text-white'
                    : 'hover:bg-zinc-800 text-gray-300'
                    }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-semibold text-sm truncate">{channel.name}</div>
                    <div className="text-[10px] opacity-70 truncate">{channel.description}</div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Community Channel */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 px-2 mb-1 uppercase tracking-wider">Public</p>
            {channels.filter(c => c.type === 'community').map((channel) => {
              const Icon = channel.icon
              return (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`w-full p-3 rounded-lg mb-1 flex items-center gap-3 transition-colors ${selectedChannel?.id === channel.id
                    ? 'bg-violet-600 text-white'
                    : 'hover:bg-zinc-800 text-gray-300'
                    }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {channels.map((channel) => {
                        const Icon = channel.icon
                        const isSelected = selectedChannel?.id === channel.id

                        return (
                          <button
                            key={channel.id}
                            onClick={() => {
                              setSelectedChannel(channel)
                              setShowMobileSidebar(false) // Hide sidebar on mobile when channel selected
                            }}
                            className={cn(
                              'w-full p-3 rounded-lg flex items-center gap-3 transition-all',
                              isSelected
                                ? 'bg-violet-600 text-white shadow-lg'
                                : 'hover:bg-white/5 text-gray-300'
                            )}
                          >
                            <Icon className={cn('w-5 h-5', isSelected ? 'text-white' : 'text-violet-400')} />
                            <div className="flex-1 text-left">
                              <div className="font-semibold text-sm">{channel.name}</div>
                              <div className="text-xs opacity-70">{channel.description}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Chat Area - Show on mobile when chat is selected */}
                  <div className={`${!showMobileSidebar ? 'flex' : 'hidden'} lg:flex flex-1 flex-col`}>
                    {selectedChannel ? (
                      <>
                        {/* Chat Header with Back Button */}
                        <div className="h-16 border-b border-white/5 bg-zinc-900/30 flex items-center gap-3 px-4">
                          {/* Back button - only show on mobile */}
                          <button
                            onClick={() => setShowMobileSidebar(true)}
                            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <ArrowLeft className="w-5 h-5" />
                          </button>

                          <div className="flex items-center gap-3 flex-1">
                            {React.createElement(selectedChannel.icon, { className: 'w-6 h-6 text-violet-400' })}
                            <div>
                              <h3 className="font-bold">{selectedChannel.name}</h3>
                              <p className="text-xs text-gray-500">{selectedChannel.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {messages.map((message) => {
                            const isOwn = message.userId === user?.uid
                            return (
                              <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn('flex gap-3', isOwn && 'flex-row-reverse')}
                              >
                                <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                  {message.userName.charAt(0).toUpperCase()}
                                </div>
                                <div className={cn('flex flex-col max-w-[70%]', isOwn && 'items-end')}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold text-gray-400">{message.userName}</span>
                                    <span className="text-[10px] text-gray-600">{formatTime(message.createdAt)}</span>
                                  </div>
                                  <div
                                    className={cn(
                                      'px-4 py-2 rounded-2xl',
                                      isOwn
                                        ? 'bg-violet-600 text-white rounded-br-sm'
                                        : 'bg-zinc-800 text-gray-200 rounded-bl-sm'
                                    )}
                                  >
                                    {message.text}
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-white/5 bg-zinc-900/30">
                          <form onSubmit={handleSendMessage} className="flex gap-2">
                            <Input
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Type a message..."
                              className="flex-1 bg-zinc-800 border-zinc-700 focus:border-violet-500"
                              disabled={isLoading}
                            />
                            <Button
                              type="submit"
                              disabled={!newMessage.trim() || isLoading}
                              className="bg-violet-600 hover:bg-violet-700"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </form>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                          <p>Select a channel to start chatting</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            }