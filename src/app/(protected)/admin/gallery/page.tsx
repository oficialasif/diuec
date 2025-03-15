'use client'

import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import type { GalleryPhoto } from '@/types/gallery'

export default function GalleryManagement() {
  const { userProfile } = useAuth()
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPhoto, setNewPhoto] = useState({
    title: '',
    imageUrl: '',
  })

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('uploadedAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photoData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate(),
      })) as GalleryPhoto[]
      setPhotos(photoData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPhoto.imageUrl || !newPhoto.title) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      await addDoc(collection(db, 'gallery'), {
        ...newPhoto,
        uploadedAt: serverTimestamp(),
        uploadedBy: {
          uid: userProfile?.uid,
          displayName: userProfile?.displayName,
        },
      })

      setNewPhoto({ title: '', imageUrl: '' })
      setIsDialogOpen(false)
      toast.success('Photo added successfully')
    } catch (error) {
      console.error('Error adding photo:', error)
      toast.error('Failed to add photo')
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'gallery', photoId))
      toast.success('Photo deleted successfully')
    } catch (error) {
      console.error('Error deleting photo:', error)
      toast.error('Failed to delete photo')
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Photo Gallery Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Photo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Photo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPhoto} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newPhoto.title}
                  onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                  placeholder="Enter photo title"
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={newPhoto.imageUrl}
                  onChange={(e) => setNewPhoto({ ...newPhoto, imageUrl: e.target.value })}
                  placeholder="Enter image URL"
                />
              </div>
              <Button type="submit" className="w-full">
                Add Photo
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {photos.map((photo) => (
          <div key={photo.id} className="bg-violet-950/50 rounded-lg overflow-hidden">
            <div className="aspect-square relative">
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <button
                onClick={() => handleDeletePhoto(photo.id)}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/75 transition-colors"
              >
                <Trash2 className="h-4 w-4 text-white" />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-white">{photo.title}</h3>
              <p className="text-sm text-gray-400 mt-1">
                Added by {photo.uploadedBy.displayName} on{' '}
                {format(photo.uploadedAt, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No photos in the gallery yet.</p>
        </div>
      )}
    </div>
  )
} 