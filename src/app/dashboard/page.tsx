'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { getPosts } from '@/lib/services'
import type { Post } from '@/lib/models'
import { Button } from '@/components/shared/ui/button'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        <p>Dashboard page content coming soon...</p>
      </div>
    </div>
  )
} 