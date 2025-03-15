'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { getValidImageUrl } from '@/lib/utils/image'
import type { GalleryPhoto } from '@/types/gallery'
import toast from 'react-hot-toast'
import { Image as ImageIcon, Plus } from 'lucide-react'

interface Photo {
  id: string
  url: string
  caption: string
  createdAt: any
  addedBy: string
}

export default function PhotoGallery() {
  const { user, userProfile, isAdmin } = useAuth()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [newPhotoCaption, setNewPhotoCaption] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      const fetchedPhotos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Photo[]
      setPhotos(fetchedPhotos)
    } catch (error) {
      console.error('Error fetching photos:', error)
      toast.error('Failed to load photos')
    }
  }

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) {
      toast.error('Only admins can add photos')
      return
    }

    if (!newPhotoUrl.trim()) {
      toast.error('Please enter a photo URL')
      return
    }

    setIsLoading(true)
    try {
      await addDoc(collection(db, 'gallery'), {
        url: newPhotoUrl,
        caption: newPhotoCaption,
        createdAt: new Date(),
        addedBy: 'admin'
      })

      setNewPhotoUrl('')
      setNewPhotoCaption('')
      toast.success('Photo added successfully!')
      fetchPhotos()
    } catch (error) {
      console.error('Error adding photo:', error)
      toast.error('Failed to add photo')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-6 h-6 text-violet-400" />
              <h2 className="text-xl font-semibold text-white">Photo Gallery</h2>
            </div>
            {isAdmin && (
              <form onSubmit={handleAddPhoto} className="flex gap-4">
                <Input
                  type="url"
                  placeholder="Photo URL"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="w-64 bg-black border-violet-500/20 focus:border-violet-500 text-white"
                />
                <Input
                  type="text"
                  placeholder="Caption (optional)"
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                  className="w-48 bg-black border-violet-500/20 focus:border-violet-500 text-white"
                />
                <Button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Photo'}
                  <Plus className="w-4 h-4 ml-2" />
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-violet-950/50 rounded-lg overflow-hidden">
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full h-48 object-cover"
              />
              {photo.caption && (
                <div className="p-4">
                  <p className="text-gray-200">{photo.caption}</p>
                </div>
              )}
            </div>
          ))}
          {photos.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-400">
              No photos in the gallery yet
            </div>
          )}
        </div>
      </div>
    </section>
  )
}