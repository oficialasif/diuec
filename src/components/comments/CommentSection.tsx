'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { addComment } from '@/lib/services'
import { Button } from '@/components/shared/ui/button'
import { toast } from 'react-hot-toast'
import type { Comment } from '@/lib/models'

interface CommentSectionProps {
  postId: string
  comments: Comment[]
  onCommentAdded: (comment: Comment) => void
}

export default function CommentSection({
  postId,
  comments,
  onCommentAdded,
}: CommentSectionProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please sign in to comment')
      return
    }

    setLoading(true)
    try {
      const comment = await addComment(postId, user.uid, content)
      onCommentAdded(comment)
      setContent('')
      toast.success('Comment added successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to add comment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">
          Comments ({comments.length})
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="comment" className="sr-only">
              Add a comment
            </label>
            <textarea
              id="comment"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-violet-500 sm:text-sm sm:leading-6"
              placeholder="Add a comment..."
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading || !content.trim()}>
              {loading ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      </div>

      <AnimatePresence>
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10"
            >
              <div className="flex items-start space-x-3">
                <img
                  src={comment.userPhotoURL}
                  alt={comment.userDisplayName}
                  className="h-8 w-8 rounded-full"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">
                    {comment.userDisplayName}
                  </p>
                  <p className="mt-1 text-sm text-gray-300">{comment.content}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  )
} 