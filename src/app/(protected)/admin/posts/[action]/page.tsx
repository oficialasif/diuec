'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { collection, doc, getDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PostEditorProps {
  params: {
    action: string
  }
  searchParams: {
    id?: string
  }
}

export default function PostEditor({ params, searchParams }: PostEditorProps) {
  const router = useRouter()
  const { userProfile } = useAuth()
  const isEditing = params.action === 'edit'
  const postId = searchParams.id

  const [loading, setLoading] = useState(isEditing)
  const [post, setPost] = useState({
    title: '',
    content: '',
  })

  useEffect(() => {
    if (isEditing && postId) {
      const fetchPost = async () => {
        try {
          const postDoc = await getDoc(doc(db, 'posts', postId))
          if (postDoc.exists()) {
            setPost({
              title: postDoc.data().title,
              content: postDoc.data().content,
            })
          } else {
            toast.error('Post not found')
            router.push('/admin/posts')
          }
        } catch (error) {
          console.error('Error fetching post:', error)
          toast.error('Failed to fetch post')
        } finally {
          setLoading(false)
        }
      }

      fetchPost()
    }
  }, [isEditing, postId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!post.title || !post.content) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      if (isEditing && postId) {
        await updateDoc(doc(db, 'posts', postId), {
          ...post,
          updatedAt: serverTimestamp(),
        })
        toast.success('Post updated successfully')
      } else {
        await addDoc(collection(db, 'posts'), {
          ...post,
          createdAt: serverTimestamp(),
          author: {
            uid: userProfile?.uid,
            displayName: userProfile?.displayName,
          },
        })
        toast.success('Post created successfully')
      }
      router.push('/admin/posts')
    } catch (error) {
      console.error('Error saving post:', error)
      toast.error('Failed to save post')
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/admin/posts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Post' : 'Create New Post'}
          </h1>
        </div>

        <div className="bg-violet-950/50 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                placeholder="Enter post title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={post.content}
                onChange={(e) => setPost({ ...post, content: e.target.value })}
                placeholder="Write your post content here..."
                className="mt-1 h-64"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/admin/posts">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit">
                {isEditing ? 'Update Post' : 'Create Post'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 