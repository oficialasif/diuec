'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { createPost } from '@/lib/services'
import { Button } from '@/components/shared/ui/button'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

export default function CreatePost() {
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      await createPost(user.uid, imageUrl, caption)
      toast.success('Post created successfully!')
      router.push('/dashboard')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black py-24">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white">Create Post</h1>
          <p className="mt-2 text-gray-400">
            Share your gaming moments with the community
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="imageUrl"
                className="block text-sm font-medium text-white"
              >
                Image URL
              </label>
              <div className="mt-1">
                <input
                  type="url"
                  id="imageUrl"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-violet-500 sm:text-sm sm:leading-6"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="caption"
                className="block text-sm font-medium text-white"
              >
                Caption
              </label>
              <div className="mt-1">
                <textarea
                  id="caption"
                  required
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-violet-500 sm:text-sm sm:leading-6"
                  placeholder="Write a caption for your post..."
                />
              </div>
            </div>

            {imageUrl && (
              <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
                <p className="mb-2 text-sm text-white">Preview:</p>
                <div className="relative aspect-video w-full">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="rounded-lg object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'https://via.placeholder.com/640x360?text=Invalid+Image+URL'
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Post'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
} 