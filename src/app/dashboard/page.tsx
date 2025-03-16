'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { motion } from 'framer-motion'
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Image as ImageIcon, Send, Trophy, Bell, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import PhotoGallery from '@/components/home/PhotoGallery'
import { UserStats } from '@/components/dashboard/UserStats'
import AdminControls from '@/components/dashboard/AdminControls'
import { MobileSidebar } from '@/components/dashboard/MobileSidebar'

export default function Dashboard() {
  const { user, userProfile, isAdmin } = useAuth()
  const [registeredTournaments, setRegisteredTournaments] = useState(0)
  const [postContent, setPostContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [announcements, setAnnouncements] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAnnouncementsLoading, setIsAnnouncementsLoading] = useState(true)
  const [loading, setLoading] = useState(true)

  // Fetch user's registered tournaments
  useEffect(() => {
    const fetchTournaments = async () => {
      if (!user) return
      try {
        const q = query(
          collection(db, 'tournament_registrations'),
          where('userId', '==', user.uid)
        )
        const querySnapshot = await getDocs(q)
        setRegisteredTournaments(querySnapshot.size)
      } catch (error) {
        console.error('Error fetching tournaments:', error)
      }
    }
    fetchTournaments()
  }, [user])

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsAnnouncementsLoading(true)
      try {
        const q = query(
          collection(db, 'announcements'),
          where('type', 'in', ['event', 'update']),
          orderBy('createdAt', 'desc')
        )
        const querySnapshot = await getDocs(q)
        const announcements = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setAnnouncements(announcements)
      } catch (error) {
        console.error('Error fetching announcements:', error)
        toast.error('Failed to load announcements')
      } finally {
        setIsAnnouncementsLoading(false)
      }
    }
    fetchAnnouncements()
  }, [])

  // Create new post
  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!postContent.trim()) {
      toast.error('Please write something to post')
      return
    }

    setIsLoading(true)
    try {
      await addDoc(collection(db, 'posts'), {
        content: postContent,
        imageUrl: imageUrl,
        userId: user.uid,
        userName: userProfile.displayName,
        userAvatar: userProfile.photoURL,
        createdAt: Timestamp.now(),
        likes: 0,
        comments: []
      })

      setPostContent('')
      setImageUrl('')
      toast.success('Post created successfully!')
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Failed to create post')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user-specific data
        const postsQuery = query(
          collection(db, 'posts'),
          where('authorId', '==', user?.uid)
        )
        const postsSnapshot = await getDocs(postsQuery)

        // Update any necessary state here
        setLoading(false)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-16 md:pt-0">
      {/* Mobile Sidebar */}
      <MobileSidebar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Welcome, {userProfile?.displayName}!
          </h1>
        </div>

        {/* Show admin controls if user is admin */}
        {isAdmin && <AdminControls />}

        {/* Stats section - different stats for admin vs user */}
        <UserStats />

        {/* Create Post Section */}
        <div className="bg-violet-950/50 rounded-lg p-4 md:p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Create a Post</h2>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full bg-black border-violet-500/20 focus:border-violet-500 text-white"
              rows={3}
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="url"
                placeholder="Image URL (optional)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 bg-black border-violet-500/20 focus:border-violet-500 text-white"
              />
              <Button
                type="submit"
                className="bg-violet-600 hover:bg-violet-700 text-white sm:w-auto w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Posting...' : 'Post'}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </div>

        {/* Photo Gallery - admin can add photos, users can only view */}
        <PhotoGallery />

        {/* Announcements Section */}
        <div className="bg-violet-950/50 rounded-lg p-4 md:p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-violet-400" />
            <h2 className="text-xl font-semibold text-white">Latest Announcements</h2>
          </div>
          {isAnnouncementsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="border-l-4 border-violet-500 pl-4 py-2"
                >
                  <h3 className="font-semibold text-violet-200">
                    {announcement.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-violet-400 mt-2">
                    {new Date(announcement.createdAt.toDate()).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  No announcements at the moment
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 