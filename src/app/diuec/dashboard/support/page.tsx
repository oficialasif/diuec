'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import {
    subscribeToSupportConversations,
    subscribeToConversationMessages,
    addMessageToConversation,
    Conversation,
    ConversationMessage
} from '@/lib/services/conversation-service'
import { Button } from '@/components/shared/ui/button'
import { MessageCircle, Send, User, Clock, AlertCircle, CheckCircle, Volume2, VolumeX } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { soundManager } from '@/lib/utils/sound-manager'

export default function AdminSupportPage() {
    const { user, userProfile, isAdmin } = useAuth()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<ConversationMessage[]>([])
    const [replyMessage, setReplyMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [loading, setLoading] = useState(true)
    const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled())
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const previousMessageCountRef = useRef(0)

    // Fetch all support conversations
    useEffect(() => {
        if (!isAdmin) return

        const unsubscribe = subscribeToSupportConversations((convs) => {
            console.log('Support conversations received:', convs.length)
            setConversations(convs)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [isAdmin])

    // Fetch messages for selected conversation
    useEffect(() => {
        if (!selectedConversation) {
            setMessages([])
            return
        }

        const unsubscribe = subscribeToConversationMessages(
            selectedConversation.id,
            (msgs) => {
                console.log('Messages received:', msgs.length)

                // Play receive sound for new messages from users (not admin)
                if (msgs.length > previousMessageCountRef.current) {
                    const newMessages = msgs.slice(previousMessageCountRef.current)
                    const hasNewUserMessage = newMessages.some(msg => !msg.isAdmin)
                    if (hasNewUserMessage) {
                        soundManager.playReceiveSound()

                        // Show browser notification if in background
                        if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
                            const latestMsg = newMessages.find(msg => !msg.isAdmin)
                            if (latestMsg) {
                                new Notification('New Support Message', {
                                    body: latestMsg.text.substring(0, 100),
                                    icon: '/android-chrome-192x192.png',
                                    badge: '/favicon-32x32.png'
                                })
                            }
                        }
                    }
                }
                previousMessageCountRef.current = msgs.length

                setMessages(msgs)
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
            }
        )

        return () => unsubscribe()
    }, [selectedConversation])

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!replyMessage.trim() || !selectedConversation || !user) return

        setSending(true)
        try {
            await addMessageToConversation(
                selectedConversation.id,
                user.uid,
                userProfile?.displayName || 'Admin',
                userProfile?.photoURL || '',
                replyMessage.trim(),
                'support',
                true // isAdmin
            )

            // Play send sound
            soundManager.playSendSound()

            setReplyMessage('')
            toast.success('Reply sent!')
        } catch (error) {
            console.error('Error sending reply:', error)
            toast.error('Failed to send reply')
        } finally {
            setSending(false)
        }
    }

    const toggleSound = () => {
        const newState = soundManager.toggle()
        setSoundEnabled(newState)
        toast.success(newState ? '🔊 Sounds enabled' : '🔇 Sounds muted')
    }

    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission()
            if (permission === 'granted') {
                toast.success('🔔 Browser notifications enabled')
            }
        }
    }

    // Request notification permission on mount
    useEffect(() => {
        requestNotificationPermission()
    }, [])

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center text-gray-400">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                    <p>Only administrators can access this page.</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-t-2 border-violet-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Support Management</h1>
                    <p className="text-gray-400">Manage user support requests and conversations</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                    {/* Conversations List */}
                    <div className="lg:col-span-1 bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-white/5">
                            <h2 className="font-bold flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-violet-400" />
                                Support Conversations ({conversations.length})
                            </h2>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {conversations.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No support conversations yet</p>
                                </div>
                            ) : (
                                conversations.map((conv) => (
                                    <button
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={`w-full p-4 border-b border-white/5 hover:bg-white/5 transition-colors text-left ${selectedConversation?.id === conv.id ? 'bg-violet-600/20' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {conv.metadata?.userAvatar ? (
                                                <img
                                                    src={conv.metadata.userAvatar}
                                                    alt={conv.metadata.userName || 'User'}
                                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                                    onError={(e) => {
                                                        // Fallback to icon if image fails to load
                                                        e.currentTarget.style.display = 'none'
                                                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                                    }}
                                                />
                                            ) : null}
                                            <div className={`w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 ${conv.metadata?.userAvatar ? 'hidden' : ''}`}>
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-semibold text-sm">
                                                        {conv.metadata?.userName || `User ${conv.metadata?.supportUserId?.slice(-4)}`}
                                                    </h3>
                                                    {conv.metadata?.isResolved && (
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 truncate">{conv.lastMessage || 'No messages yet'}</p>
                                                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    {conv.lastMessageAt.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Conversation View */}
                    <div className="lg:col-span-2 bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden flex flex-col">
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-white/5 bg-zinc-900/30">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {selectedConversation.metadata?.userAvatar ? (
                                                <img
                                                    src={selectedConversation.metadata.userAvatar}
                                                    alt={selectedConversation.metadata.userName || 'User'}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none'
                                                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                                    }}
                                                />
                                            ) : null}
                                            <div className={`w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center ${selectedConversation.metadata?.userAvatar ? 'hidden' : ''}`}>
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold">
                                                    {selectedConversation.metadata?.userName || 'Support Conversation'}
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    User ID: {selectedConversation.metadata?.supportUserId}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {selectedConversation.metadata?.isResolved && (
                                                <div className="flex items-center gap-2 text-green-500 text-sm">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Resolved
                                                </div>
                                            )}
                                            {/* Sound toggle button */}
                                            <button
                                                onClick={toggleSound}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                title={soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
                                            >
                                                {soundEnabled ? (
                                                    <Volume2 className="w-5 h-5 text-emerald-400" />
                                                ) : (
                                                    <VolumeX className="w-5 h-5 text-gray-500" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.length === 0 ? (
                                        <div className="text-center text-gray-500 mt-8">
                                            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                            <p>No messages yet</p>
                                        </div>
                                    ) : (
                                        messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex gap-3 ${msg.isAdmin ? 'flex-row-reverse' : ''}`}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                    {msg.isAdmin ? 'A' : 'U'}
                                                </div>
                                                <div className={`flex flex-col max-w-[70%] ${msg.isAdmin ? 'items-end' : ''}`}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-semibold">
                                                            {msg.isAdmin ? 'Admin' : 'User'}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500">
                                                            {msg.createdAt.toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={`px-4 py-2 rounded-lg ${msg.isAdmin
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'bg-zinc-800 text-gray-200'
                                                            }`}
                                                    >
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Reply Input */}
                                <div className="p-4 border-t border-white/5 bg-zinc-900/30">
                                    <form onSubmit={handleSendReply} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                            placeholder="Type your reply..."
                                            className="flex-1 bg-zinc-800 border border-white/5 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-violet-500"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={!replyMessage.trim() || sending}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <User className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <p>Select a conversation to view messages</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
