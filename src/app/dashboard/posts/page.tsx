'use client'

import { useState, useEffect } from 'react'
import { collection, query, orderBy, getDocs, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AdminRouteGuard } from '@/components/auth/AdminRouteGuard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Search, Edit2, Trash2, MessageSquare, Heart } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { getValidImageUrl } from '@/lib/utils/image'

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
    text: string
    createdAt: Timestamp
  }[]
}

export default function PostsManagement() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[]
      setPosts(postsData)
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePost = async (postId: string) => {
    if (!editContent.trim()) {
      toast.error('Post content cannot be empty')
      return
    }

    try {
      await updateDoc(doc(db, 'posts', postId), {
        content: editContent
      })
      toast.success('Post updated successfully')
      setEditingPost(null)
      setEditContent('')
      fetchPosts()
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error('Failed to update post')
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'posts', postId))
      toast.success('Post deleted successfully')
      fetchPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    }
  }

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate()
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.userName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminRouteGuard>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Posts Management</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black border-violet-500/20 text-white w-64"
            />
          </div>
        </div>

        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-black/50 rounded-lg border border-violet-500/20 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={getValidImageUrl(post.userAvatar, 'avatar')}
                      alt={post.userName}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-white">{post.userName}</p>
                    <p className="text-sm text-gray-400">{formatDate(post.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-violet-400 hover:text-violet-500 hover:bg-violet-500/10"
                    onClick={() => {
                      setEditingPost(post)
                      setEditContent(post.content)
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {editingPost?.id === post.id ? (
                <div className="space-y-4">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="bg-black border-violet-500/20 text-white"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdatePost(post.id)}
                      className="bg-violet-600 hover:bg-violet-700 text-white"
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditingPost(null)
                        setEditContent('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-200 mb-4">{post.content}</p>
                  {post.imageUrl && (
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                      <Image
                        src={getValidImageUrl(post.imageUrl, 'post')}
                        alt="Post image"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-gray-400">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comments.length}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}

          {filteredPosts.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No posts found
            </div>
          )}
        </div>
      </div>
    </AdminRouteGuard>
  )
} 