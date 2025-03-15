import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/shared/ui/button'
import { getValidImageUrl } from '@/lib/utils/image'
import { MessageSquare, Heart } from 'lucide-react'

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

export default function LatestUpdates() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLatestPosts()
  }, [])

  const fetchLatestPosts = async () => {
    try {
      const q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(3)
      )
      const querySnapshot = await getDocs(q)
      const fetchedPosts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        likes: Array.isArray(doc.data().likes) ? doc.data().likes : []
      })) as Post[]
      setPosts(fetchedPosts)
    } catch (error) {
      console.error('Error fetching latest posts:', error)
    } finally {
      setIsLoading(false)
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

  return (
    <section className="py-12 bg-black">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Latest Updates</h2>
          <Link href="/community">
            <Button variant="outline" className="border-violet-500 text-violet-500 hover:bg-violet-500/20">
              See All Posts
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black border border-violet-500/20 rounded-lg p-4 hover:border-violet-500/40 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={getValidImageUrl(post.userAvatar, 'avatar')}
                      alt={post.userName}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-violet-200 text-sm">{post.userName}</p>
                    <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
                  </div>
                </div>

                {post.imageUrl && (
                  <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden">
                    <Image
                      src={getValidImageUrl(post.imageUrl, 'post')}
                      alt="Post image"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  </div>
                )}

                <p className="text-gray-200 text-sm mb-3 line-clamp-3">{post.content}</p>

                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments.length}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
} 