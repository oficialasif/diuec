'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/shared/ui/button'
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
import EmojiPicker from 'emoji-picker-react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/shared/ui/popover'
import { EmojiSmile, Trash, ThreeDots } from 'react-bootstrap-icons'

interface Message {
  id: string
  text: string
  userId: string
  userDisplayName: string
  userPhotoURL: string
  createdAt: Date
  reactions: { [key: string]: string[] } // emoji -> userIds
}

interface TypingUser {
  userId: string
  displayName: string
  timestamp: Date
}

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Chat</h1>
        <p>Chat page content coming soon...</p>
      </div>
    </div>
  )
} 