'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, orderBy, onSnapshot, updateDoc, doc, arrayUnion, Timestamp, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { MessageSquare, Share2, Send, Image as ImageIcon, MoreHorizontal, Globe, Clock, MessageCircle, ThumbsUp, Calendar, Users, Newspaper, ExternalLink, Bell, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { getValidImageUrl } from '@/lib/utils/image'
import Link from 'next/link'

interface Post {
  id: string
  content: string
  imageUrl?: string
  userId: string
  userName: string
  userAvatar: string
  createdAt: Timestamp
  likes: string[]
  comments: {
    id: string
    userId: string
    userName: string
    userAvatar: string
    text: string
    createdAt: Timestamp
  }[]
}

const SidebarRow = ({ Icon, title, href }: { Icon: any, title: string, href?: string }) => (
  <Link href={href || "#"} className="flex items-center space-x-4 p-3 hover:bg-zinc-800 rounded-xl transition-all group cursor-pointer">
    <Icon className="w-7 h-7 text-violet-500 group-hover:text-violet-400" />
    <p className="font-medium text-gray-300 group-hover:text-white">{title}</p>
  </Link>
)

export default function CommunityPage() {
  const { user, userProfile } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostImage, setNewPostImage] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Post[]>([])

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => {
        const data = doc.data()
        const likes = Array.isArray(data.likes) ? data.likes : []
        return {
          id: doc.id,
          ...data,
          likes,
          comments: data.comments || []
        }
      }) as Post[]
      setPosts(fetchedPosts)
      setNotifications(fetchedPosts.slice(0, 5)) // Get latest 5 posts for notifications
      setIsLoading(false)
    }, (error) => {
      console.error('Error fetching posts:', error)
      toast.error('Failed to load posts')
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please sign in to create a post')
      return
    }

    if (!newPostContent.trim()) {
      toast.error('Please write something to post')
      return
    }

    setIsPosting(true)
    try {
      await addDoc(collection(db, 'posts'), {
        content: newPostContent,
        imageUrl: newPostImage || null,
        userId: user.uid,
        userName: userProfile?.displayName || 'Anonymous',
        userAvatar: userProfile?.photoURL || '',
        createdAt: Timestamp.now(),
        likes: [],
        comments: []
      })

      setNewPostContent('')
      setNewPostImage('')
      toast.success('Post created successfully!')
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Failed to create post')
    } finally {
      setIsPosting(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) {
      toast.error('Please sign in to like posts')
      return
    }

    try {
      const postRef = doc(db, 'posts', postId)
      const post = posts.find(p => p.id === postId)
      if (!post) return

      const currentLikes = Array.isArray(post.likes) ? post.likes : []
      const hasLiked = currentLikes.includes(user.uid)

      let newLikes
      if (hasLiked) {
        newLikes = currentLikes.filter(id => id !== user.uid)
      } else {
        newLikes = [...currentLikes, user.uid]
      }

      await updateDoc(postRef, { likes: newLikes })
    } catch (error) {
      console.error('Error updating like:', error)
      toast.error('Failed to update like')
    }
  }

  const handleComment = async (postId: string) => {
    if (!user) {
      toast.error('Please sign in to comment')
      return
    }

    const text = commentText[postId]?.trim()
    if (!text) return

    try {
      const postRef = doc(db, 'posts', postId)
      const newComment = {
        id: Date.now().toString(),
        userId: user.uid,
        userName: userProfile?.displayName || 'Anonymous',
        userAvatar: userProfile?.photoURL || '',
        text,
        createdAt: Timestamp.now()
      }

      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      })

      setCommentText({ ...commentText, [postId]: '' })
      toast.success('Comment added!')
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    }
  }

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate()
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="fixed inset-0 top-16 bg-[#18191A] text-white flex overflow-hidden">

      {/* Left Sidebar - Fixed */}
      <div className="hidden lg:flex flex-col w-[300px] xl:w-[360px] h-full overflow-y-auto pb-4 scrollbar-hide flex-shrink-0 border-r border-zinc-800 bg-[#18191A]">
        <div className="p-4 space-y-2">
          {/* User Profile Link */}
          {user && (
            <div className="flex items-center space-x-4 p-3 hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors">
              <div className="relative w-9 h-9 rounded-full overflow-hidden">
                <Image
                  src={getValidImageUrl(userProfile?.photoURL, 'avatar')}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="font-semibold text-lg truncate">{userProfile?.displayName}</p>
            </div>
          )}

          <SidebarRow Icon={Users} title="Find Players" href="/teams" />
          <SidebarRow Icon={Calendar} title="Tournaments" href="/tournaments" />
          <SidebarRow Icon={Newspaper} title="Game News" href="/news" />
          <SidebarRow Icon={Clock} title="Memories" />
          <div className="border-b border-zinc-700 my-2" />
          <h3 className="text-gray-400 font-semibold px-4 mb-2 mt-4 text-lg">Your Games</h3>
          <SidebarRow Icon={ExternalLink} title="PUBG Mobile" href="/games/pubg" />
          <SidebarRow Icon={ExternalLink} title="Valorant" href="/games/valorant" />
        </div>

        <div className="mt-auto px-4 text-xs text-gray-500 pt-8 pb-4">
          Privacy · Terms · Advertising · Cookies · DIU eSports © 2024
        </div>
      </div>

      {/* Center Feed - Scrollable */}
      <div className="flex-1 h-full overflow-y-auto scrollbar-hide bg-[#18191A]">
        <div className="max-w-[680px] mx-auto w-full py-8 px-4">
          {/* Create Post Widget */}
          {user && (
            <div className="bg-[#242526] rounded-xl p-4 mb-6 shadow-md border border-zinc-700/50">
              <div className="flex gap-4 mb-4 items-center">
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-zinc-700">
                  <Image
                    src={getValidImageUrl(userProfile?.photoURL, 'avatar')}
                    alt="Me"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 bg-[#3A3B3C] hover:bg-[#4E4F50] rounded-full px-4 py-2.5 transition-colors cursor-pointer group" onClick={() => (document.getElementById('post-input') as HTMLInputElement)?.focus()}>
                  <input
                    id="post-input"
                    className="bg-transparent border-none outline-none text-white placeholder-gray-400 w-full cursor-pointer group-hover:bg-transparent"
                    placeholder={`What's on your mind, ${userProfile?.displayName?.split(' ')[0]}?`}
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Image URL Input (simplified for now) */}
              {newPostContent && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mb-4"
                >
                  <Input
                    placeholder="Image URL (optional)"
                    value={newPostImage}
                    onChange={e => setNewPostImage(e.target.value)}
                    className="bg-[#3A3B3C] border-zinc-600 text-white"
                  />
                </motion.div>
              )}

              <div className="border-t border-zinc-700 pt-3 flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-[#3A3B3C] gap-2">
                    <ImageIcon className="text-green-500 w-5 h-5" />
                    Photo/Video
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-[#3A3B3C] gap-2 hidden sm:flex">
                    <MessageCircle className="text-blue-500 w-5 h-5" />
                    Tag Friends
                  </Button>
                </div>
                {newPostContent && (
                  <Button size="sm" onClick={handleCreatePost} disabled={isPosting}>
                    {isPosting ? 'Posting...' : 'Post'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Feed */}
          <div className="space-y-6 pb-10">
            {posts.map(post => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#242526] rounded-xl shadow-md border border-zinc-700/50 overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-700">
                      <Image
                        src={getValidImageUrl(post.userAvatar, 'avatar')}
                        alt={post.userName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white hover:underline cursor-pointer">{post.userName}</h4>
                      <div className="flex items-center text-gray-400 text-xs gap-1">
                        <span>{formatDate(post.createdAt)}</span>
                        <span>·</span>
                        <Globe className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                  <div className="relative group/menu">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-[#3A3B3C] rounded-full h-8 w-8 p-0">
                      <MoreHorizontal />
                    </Button>
                    <div className="absolute right-0 top-full mt-1 bg-[#242526] border border-zinc-700 rounded-lg shadow-xl overflow-hidden hidden group-hover/menu:block w-40 z-10 transition-all">
                      <button
                        onClick={async () => {
                          if (!user) return toast.error('Please login to report');
                          try {
                            await addDoc(collection(db, 'reports'), {
                              postId: post.id,
                              postContent: post.content,
                              reportedBy: user.uid,
                              reason: 'Inappropriate Content',
                              status: 'pending',
                              createdAt: Timestamp.now()
                            });
                            toast.success('Post reported to admins');
                          } catch (e) { console.error(e); toast.error('Failed to report'); }
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4" /> Report Post
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-4 pb-2">
                  <p className="text-white whitespace-pre-wrap leading-relaxed text-[15px]">{post.content}</p>
                </div>

                {post.imageUrl && (
                  <div className="relative w-full aspect-video mt-2 bg-black">
                    <Image
                      src={post.imageUrl}
                      alt="Post Content"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}

                {/* Stats */}
                <div className="px-4 py-3 flex justify-between items-center text-gray-400 text-sm border-b border-zinc-700 mx-4">
                  <div className="flex items-center gap-1">
                    {post.likes.length > 0 && (
                      <>
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <ThumbsUp className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="ml-1 hover:underline cursor-pointer">{post.likes.length}</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <span className="hover:underline cursor-pointer">{post.comments.length} comments</span>
                    <span className="hover:underline cursor-pointer">0 shares</span>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="px-2 py-1 flex justify-between items-center mx-2 my-1">
                  <Button
                    variant="ghost"
                    className={`flex-1 hover:bg-[#3A3B3C] gap-2 ${post.likes.includes(user?.uid || '') ? 'text-blue-500' : 'text-gray-400'}`}
                    onClick={() => handleLike(post.id)}
                  >
                    <ThumbsUp className={`w-5 h-5 ${post.likes.includes(user?.uid || '') ? 'fill-current' : ''}`} />
                    <span className="hidden sm:inline">Like</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 hover:bg-[#3A3B3C] gap-2 text-gray-400"
                    onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="hidden sm:inline">Comment</span>
                  </Button>
                  <Button variant="ghost" className="flex-1 hover:bg-[#3A3B3C] gap-2 text-gray-400">
                    <Share2 className="w-5 h-5" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </div>

                {/* Comments Section (Collapsible) */}
                <AnimatePresence>
                  {(activeCommentPost === post.id || post.comments.length < 3 && post.comments.length > 0) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 pt-2 bg-[#1c1d1e]"
                    >
                      <div className="space-y-4 mb-4">
                        {post.comments.map(comment => (
                          <div key={comment.id} className="flex gap-2 items-start">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1">
                              <Image src={getValidImageUrl(comment.userAvatar, 'avatar')} alt={comment.userName} fill className="object-cover" />
                            </div>
                            <div>
                              <div className="bg-[#3A3B3C] rounded-2xl px-3 py-2">
                                <h5 className="font-semibold text-sm text-white">{comment.userName}</h5>
                                <p className="text-sm text-gray-200">{comment.text}</p>
                              </div>
                              <div className="flex gap-3 text-xs text-gray-500 ml-3 mt-1">
                                <button className="hover:underline font-semibold">Like</button>
                                <button className="hover:underline font-semibold">Reply</button>
                                <span>{formatDate(comment.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Comment Input */}
                      {user && (
                        <div className="flex gap-2 items-center">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                            <Image src={getValidImageUrl(userProfile?.photoURL, 'avatar')} alt="Me" fill className="object-cover" />
                          </div>
                          <div className="flex-1 relative">
                            <input
                              className="w-full bg-[#3A3B3C] rounded-full py-2 pl-3 pr-10 text-white placeholder-gray-400 text-sm focus:outline-none"
                              placeholder="Write a comment..."
                              value={commentText[post.id] || ''}
                              onChange={e => setCommentText({ ...commentText, [post.id]: e.target.value })}
                              onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                            />
                            <button
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-400 disabled:opacity-50"
                              onClick={() => handleComment(post.id)}
                              disabled={!commentText[post.id]?.trim()}
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Notifications */}
      <div className="hidden xl:flex flex-col w-[360px] h-full overflow-hidden bg-[#18191A] border-l border-zinc-800 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-gray-300 font-semibold text-lg">Notifications</h3>
          <Bell className="w-5 h-5 text-gray-500" />
        </div>

        <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700">
          {notifications.map(post => (
            <div key={post.id} className="flex gap-3 items-start p-2 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors">
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-violet-500/20">
                <Image
                  src={getValidImageUrl(post.userAvatar, 'avatar')}
                  alt={post.userName}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#18191A]"></div>
              </div>
              <div>
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-white">{post.userName}</span> posted a new update: "{post.content.substring(0, 30)}..."
                </p>
                <span className="text-xs text-violet-400 mt-1 block">{formatDate(post.createdAt)}</span>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No recent notifications
            </div>
          )}
        </div>
      </div>
    </div>
  )
}