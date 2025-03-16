'use client'

import { useState, useEffect } from 'react'
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AdminRouteGuard } from '@/components/auth/AdminRouteGuard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Search } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { getValidImageUrl } from '@/lib/utils/image'

interface Photo {
  id: string
  url: string
  caption?: string
  addedBy: string
  createdAt: Timestamp
}

export default function GalleryManagement() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [newPhotoCaption, setNewPhotoCaption] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      const photosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Photo[]
      setPhotos(photosData)
    } catch (error) {
      console.error('Error fetching photos:', error)
      toast.error('Failed to load photos')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPhotoUrl.trim()) {
      toast.error('Please enter a photo URL')
      return
    }

    setIsUploading(true)
    try {
      await addDoc(collection(db, 'gallery'), {
        url: newPhotoUrl,
        caption: newPhotoCaption,
        addedBy: 'admin',
        createdAt: Timestamp.now()
      })

      setNewPhotoUrl('')
      setNewPhotoCaption('')
      toast.success('Photo added successfully!')
      fetchPhotos()
    } catch (error) {
      console.error('Error adding photo:', error)
      toast.error('Failed to add photo')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'gallery', photoId))
      toast.success('Photo deleted successfully')
      fetchPhotos()
    } catch (error) {
      console.error('Error deleting photo:', error)
      toast.error('Failed to delete photo')
    }
  }

  const filteredPhotos = photos.filter(photo =>
    photo.caption?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    photo.url.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminRouteGuard>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Gallery Management</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black border-violet-500/20 text-white w-64"
            />
          </div>
        </div>

        {/* Add Photo Form */}
        <div className="bg-black/50 rounded-lg border border-violet-500/20 p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Add New Photo</h2>
          <form onSubmit={handleAddPhoto} className="space-y-4">
            <div>
              <Input
                type="url"
                placeholder="Photo URL"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                className="bg-black border-violet-500/20 text-white"
              />
            </div>
            <div>
              <Textarea
                placeholder="Photo caption (optional)"
                value={newPhotoCaption}
                onChange={(e) => setNewPhotoCaption(e.target.value)}
                className="bg-black border-violet-500/20 text-white"
                rows={2}
              />
            </div>
            <Button
              type="submit"
              className="bg-violet-600 hover:bg-violet-700 text-white"
              disabled={isUploading}
            >
              {isUploading ? 'Adding...' : 'Add Photo'}
              <Plus className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="bg-black/50 rounded-lg border border-violet-500/20 overflow-hidden group"
            >
              <div className="relative aspect-video">
                <Image
                  src={getValidImageUrl(photo.url, 'gallery')}
                  alt={photo.caption || 'Gallery photo'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => handleDeletePhoto(photo.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {photo.caption && (
                <div className="p-4">
                  <p className="text-gray-200">{photo.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredPhotos.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No photos found
          </div>
        )}
      </div>
    </AdminRouteGuard>
  )
} 