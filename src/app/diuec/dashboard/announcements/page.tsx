'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, doc, setDoc, deleteDoc, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { Plus, Edit, Trash2, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [formData, setFormData] = useState({ title: '', content: '' })

    useEffect(() => {
        fetchAnnouncements()
    }, [])

    const fetchAnnouncements = async () => {
        setLoading(true)
        const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        setAnnouncements(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })))
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title || !formData.content) {
            toast.error('Please fill all fields')
            return
        }

        try {
            const newRef = doc(collection(db, 'announcements'))
            await setDoc(newRef, {
                id: newRef.id,
                title: formData.title,
                content: formData.content,
                createdAt: new Date()
            })
            toast.success('Announcement created')
            setFormData({ title: '', content: '' })
            setIsCreating(false)
            fetchAnnouncements()
        } catch (error) {
            toast.error('Failed to create announcement')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this announcement?')) return
        try {
            await deleteDoc(doc(db, 'announcements', id))
            toast.success('Announcement deleted')
            fetchAnnouncements()
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Announcements</h1>
                    <p className="text-gray-400">Manage platform announcements</p>
                </div>
                <Button
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-violet-600 hover:bg-violet-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Announcement
                </Button>
            </div>

            {/* Create Form */}
            {isCreating && (
                <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Announcement title..."
                            className="bg-zinc-900 border-zinc-800 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Content</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Announcement content..."
                            rows={4}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
                            Create
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            )}

            {/* Announcements List */}
            <div className="space-y-4">
                {announcements.map((announcement) => (
                    <div key={announcement.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="p-3 bg-violet-600/10 rounded-lg">
                                    <Bell className="w-6 h-6 text-violet-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white text-lg mb-1">{announcement.title}</h3>
                                    <p className="text-gray-400 mb-2">{announcement.content}</p>
                                    <span className="text-xs text-gray-500">
                                        {announcement.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                                    </span>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(announcement.id)}
                                className="text-red-400 hover:text-red-300"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {announcements.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500">
                        No announcements yet
                    </div>
                )}
            </div>
        </div>
    )
}
