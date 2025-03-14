'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { motion } from 'framer-motion'
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { Textarea } from '@/components/shared/ui/textarea'
import { Image as ImageIcon, Send, Trophy, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, userProfile } = useAuth()
  const [registeredTournaments, setRegisteredTournaments] = useState(0)
  const [postContent, setPostContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [announcements, setAnnouncements] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAnnouncementsLoading, setIsAnnouncementsLoading] = useState(true)

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

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-8 px-4 md:px-0">
      <div className="container mx-auto max-w-6xl">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-violet-900/50 to-violet-600/30 rounded-lg p-6 mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {userProfile?.displayName}! 👋
          </h1>
          <p className="text-violet-200">
            Ready to dominate the gaming scene? Let's check out what's happening today.
          </p>
        </motion.div>

        {/* Stats and Create Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Tournament Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black border border-violet-500/20 rounded-lg p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-violet-500/20 rounded-full">
                <Trophy className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Registered Tournaments</h2>
                <p className="text-3xl font-bold text-violet-400">{registeredTournaments}</p>
              </div>
            </div>
            <Button
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => window.location.href = '/tournaments'}
            >
              Browse Tournaments
            </Button>
          </motion.div>

          {/* Create Post */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 bg-black border border-violet-500/20 rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Create a Post</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <Textarea
                placeholder="What's on your mind?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full bg-black border-violet-500/20 focus:border-violet-500 text-white"
                rows={3}
              />
              <div className="flex gap-4">
                <Input
                  type="url"
                  placeholder="Image URL (optional)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 bg-black border-violet-500/20 focus:border-violet-500 text-white"
                  prefix={<ImageIcon className="w-4 h-4 text-violet-400" />}
                />
                <Button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Posting...' : 'Post'}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Announcements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black border border-violet-500/20 rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-violet-400" />
            <h2 className="text-lg font-semibold">Latest Announcements</h2>
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
        </motion.div>
      </div>
    </div>
  )
} 