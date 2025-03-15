'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Users, Image as ImageIcon, FileText, Trophy } from 'lucide-react'

interface Stats {
  totalUsers: number
  totalPosts: number
  totalPhotos: number
  totalTournaments: number
}

export function UserStats() {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPosts: 0,
    totalPhotos: 0,
    totalTournaments: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      try {
        if (isAdmin) {
          // Admin sees total stats
          const usersQuery = query(collection(db, 'users'), limit(100))
          const photosQuery = query(collection(db, 'gallery'), limit(100))
          const postsQuery = query(collection(db, 'posts'), limit(100))
          const tournamentsQuery = query(collection(db, 'tournaments'), limit(100))

          const [usersSnap, photosSnap, postsSnap, tournamentsSnap] = await Promise.all([
            getDocs(usersQuery),
            getDocs(photosQuery),
            getDocs(postsQuery),
            getDocs(tournamentsQuery)
          ])

          setStats({
            totalUsers: usersSnap.size,
            totalPhotos: photosSnap.size,
            totalPosts: postsSnap.size,
            totalTournaments: tournamentsSnap.size
          })
        } else {
          // Regular user sees their own stats
          const tournamentsQuery = query(
            collection(db, 'tournaments'),
            where('participants', 'array-contains', user.uid),
            limit(100)
          )
          const postsQuery = query(
            collection(db, 'posts'),
            where('userId', '==', user.uid),
            limit(100)
          )
          const photosQuery = query(
            collection(db, 'gallery'),
            where('addedBy', '==', user.uid),
            limit(100)
          )

          const [tournamentsSnap, postsSnap, photosSnap] = await Promise.all([
            getDocs(tournamentsQuery),
            getDocs(postsQuery),
            getDocs(photosQuery)
          ])

          setStats({
            totalUsers: 0, // Not relevant for regular users
            totalPhotos: photosSnap.size,
            totalPosts: postsSnap.size,
            totalTournaments: tournamentsSnap.size
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [user, isAdmin])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-violet-950/50 rounded-lg p-6 animate-pulse">
            <div className="h-8 w-8 bg-violet-500/20 rounded-full mb-4"></div>
            <div className="h-6 w-24 bg-violet-500/20 rounded mb-2"></div>
            <div className="h-4 w-16 bg-violet-500/20 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {isAdmin && (
        <div className="bg-violet-950/50 rounded-lg p-6">
          <Users className="w-8 h-8 text-violet-400 mb-4" />
          <h3 className="text-2xl font-bold text-white">{stats.totalUsers}</h3>
          <p className="text-violet-400">Total Users</p>
        </div>
      )}
      <div className="bg-violet-950/50 rounded-lg p-6">
        <FileText className="w-8 h-8 text-violet-400 mb-4" />
        <h3 className="text-2xl font-bold text-white">{stats.totalPosts}</h3>
        <p className="text-violet-400">{isAdmin ? 'Total Posts' : 'Your Posts'}</p>
      </div>
      <div className="bg-violet-950/50 rounded-lg p-6">
        <ImageIcon className="w-8 h-8 text-violet-400 mb-4" />
        <h3 className="text-2xl font-bold text-white">{stats.totalPhotos}</h3>
        <p className="text-violet-400">{isAdmin ? 'Gallery Photos' : 'Your Photos'}</p>
      </div>
      <div className="bg-violet-950/50 rounded-lg p-6">
        <Trophy className="w-8 h-8 text-violet-400 mb-4" />
        <h3 className="text-2xl font-bold text-white">{stats.totalTournaments}</h3>
        <p className="text-violet-400">
          {isAdmin ? 'Total Tournaments' : 'Tournaments Joined'}
        </p>
      </div>
    </div>
  )
} 