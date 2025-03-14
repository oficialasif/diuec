'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { motion } from 'framer-motion'
import { collection, query, orderBy, getDocs, updateDoc, doc, arrayUnion, Timestamp, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { MessageSquare, Heart, Share2, Send } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

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

export default function CommunityPage() {
  const { user, userProfile } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostImage, setNewPostImage] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      const fetchedPosts = querySnapshot.docs.map(doc => {
        const data = doc.data()
        // Convert likes to array if it's a number
        const likes = Array.isArray(data.likes) ? data.likes : []
        return {
          id: doc.id,
          ...data,
          likes
        }
      }) as Post[]
      setPosts(fetchedPosts)
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to load posts')
    } finally {
      setIsLoading(false)
    }
  }

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
      const postRef = await addDoc(collection(db, 'posts'), {
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
      fetchPosts()
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

      // Ensure likes is an array
      const currentLikes = Array.isArray(post.likes) ? post.likes : []
      const hasLiked = currentLikes.includes(user.uid)
      
      if (hasLiked) {
        // Unlike
        const newLikes = currentLikes.filter(id => id !== user.uid)
        await updateDoc(postRef, {
          likes: newLikes
        })
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, likes: newLikes }
            : p
        ))
      } else {
        // Like
        const newLikes = [...currentLikes, user.uid]
        await updateDoc(postRef, {
          likes: newLikes
        })
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, likes: newLikes }
            : p
        ))
      }
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

      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      ))
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
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return date.toLocaleDateString()
  }

  const getValidImageUrl = (url: string | null | undefined) => {
    if (!url) return '/images/avatars/default-avatar.png'
    if (url.startsWith('data:')) return '/images/avatars/default-avatar.png'
    return url
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-8 px-4 md:px-0">
      <div className="container mx-auto max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8 text-center"
        >
          Community Posts
        </motion.h1>

        {/* Create Post Section - Only show for logged in users */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-black border border-violet-500/20 rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Create a Post</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <Input
                type="text"
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full bg-violet-900/20 border-none text-white placeholder-gray-400"
              />
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="Image URL (optional)"
                  value={newPostImage}
                  onChange={(e) => setNewPostImage(e.target.value)}
                  className="flex-1 bg-violet-900/20 border-none text-white placeholder-gray-400"
                />
                <Button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-700"
                  disabled={isPosting}
                >
                  {isPosting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Posts List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black border border-violet-500/20 rounded-lg p-6"
              >
                {/* Post Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={getValidImageUrl(post.userAvatar)}
                      alt={post.userName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-violet-200">{post.userName}</p>
                    <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-gray-200 mb-4">{post.content}</p>
                {post.imageUrl && (
                  <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={post.imageUrl}
                      alt="Post image"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center gap-6 mb-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 transition-colors ${
                      user && Array.isArray(post.likes) && post.likes.includes(user.uid)
                        ? 'text-red-500'
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart 
                      className={`w-5 h-5 ${
                        user && Array.isArray(post.likes) && post.likes.includes(user.uid) 
                          ? 'fill-current' 
                          : ''
                      }`} 
                    />
                    <span>{Array.isArray(post.likes) ? post.likes.length : 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-400">
                    <MessageSquare className="w-5 h-5" />
                    <span>{post.comments.length}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-400">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Comments */}
                <div className="space-y-4">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={getValidImageUrl(comment.userAvatar)}
                          alt={comment.userName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 bg-violet-900/20 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-violet-200">
                            {comment.userName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(comment.createdAt)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-300">{comment.text}</p>
                      </div>
                    </div>
                  ))}

                  {/* Add Comment - Only show input for logged in users */}
                  <div className="flex gap-3">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={getValidImageUrl(user ? userProfile?.photoURL : undefined)}
                        alt="User avatar"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex gap-2">
                      <Input
                        type="text"
                        placeholder={user ? "Write a comment..." : "Sign in to comment"}
                        value={commentText[post.id] || ''}
                        onChange={(e) => setCommentText({
                          ...commentText,
                          [post.id]: e.target.value
                        })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && user) {
                            handleComment(post.id)
                          }
                        }}
                        disabled={!user}
                        className="flex-1 bg-violet-900/20 border-none text-white placeholder-gray-400"
                      />
                      <Button
                        size="icon"
                        className="bg-violet-600 hover:bg-violet-700"
                        onClick={() => handleComment(post.id)}
                        disabled={!user}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {posts.length === 0 && (
              <p className="text-center text-gray-400 py-8">
                No posts yet. Be the first to share something!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 