'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/shared/ui/button'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  orderBy,
  getDocs,
  where,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface UserProfile {
  uid: string
  displayName: string
  photoURL: string
  bio: string
  level: number
  followers: string[]
  following: string[]
  achievements: string[]
  joinedAt: Date
}

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Community</h1>
        <p>Community page content coming soon...</p>
      </div>
    </div>
  )
} 