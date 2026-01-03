'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, Upload, Loader2, Save, X } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import {
    getCommitteeMembers,
    addCommitteeMember,
    updateCommitteeMember,
    deleteCommitteeMember,
    getGalleryImages,
    addGalleryImage,
    deleteGalleryImage,
    getSponsors,
    addSponsor,
    deleteSponsor,
    uploadImage
} from '@/lib/services'
import { CommitteeMember, GalleryImage, Sponsor } from '@/lib/models'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

export default function ContentPage() {
    const [activeTab, setActiveTab] = useState<'committee' | 'gallery' | 'sponsors'>('committee')

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Content Management</h1>
                <p className="text-gray-400">Manage home page content</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-zinc-800 pb-2 overflow-x-auto">
                {['committee', 'gallery', 'sponsors'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${activeTab === tab
                            ? 'bg-violet-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-zinc-800'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 min-h-[500px]">
                {activeTab === 'committee' && <CommitteeManager />}
                {activeTab === 'gallery' && <GalleryManager />}
                {activeTab === 'sponsors' && <SponsorsManager />}
            </div>
        </div>
    )
}

// --- COMMITTEE MANAGER ---
function CommitteeManager() {
    const [members, setMembers] = useState<CommitteeMember[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [formData, setFormData] = useState({ name: '', role: '', image: '', order: 0 })
    const [uploading, setUploading] = useState(false)

    const fetchMembers = async () => {
        try {
            const data = await getCommitteeMembers()
            setMembers(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchMembers() }, [])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const url = await uploadImage(file, 'committee')
            setFormData(prev => ({ ...prev, image: url }))
            toast.success('Image uploaded')
        } catch (error) {
            toast.error('Upload failed')
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setUploading(true)
        try {
            if (editId) {
                await updateCommitteeMember(editId, formData)
                toast.success('Member updated')
            } else {
                await addCommitteeMember(formData)
                toast.success('Member added')
            }
            resetForm()
            fetchMembers()
        } catch (error) {
            toast.error('Operation failed')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return
        try {
            await deleteCommitteeMember(id)
            setMembers(prev => prev.filter(m => m.id !== id))
            toast.success('Member deleted')
        } catch (error) {
            toast.error('Delete failed')
        }
    }

    const resetForm = () => {
        setIsEditing(false)
        setEditId(null)
        setFormData({ name: '', role: '', image: '', order: members.length + 1 })
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Committee Members</h2>
                <Button onClick={() => { resetForm(); setIsEditing(true) }}>
                    <Plus className="w-4 h-4 mr-2" /> Add Member
                </Button>
            </div>

            {isEditing && (
                <form onSubmit={handleSubmit} className="bg-black/40 p-6 rounded-lg border border-zinc-800 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Name</label>
                            <input
                                className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Role</label>
                            <input
                                className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Order</label>
                            <input
                                type="number"
                                className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white"
                                value={formData.order}
                                onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Image (Optional - Upload or URL)</label>
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="committee-upload"
                                    />
                                    <label
                                        htmlFor="committee-upload"
                                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md p-2 text-gray-400 cursor-pointer hover:bg-zinc-700 flex items-center justify-center gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        {uploading ? 'Uploading...' : 'Upload File'}
                                    </label>
                                </div>
                                <input
                                    placeholder="Or paste image URL"
                                    className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white text-sm"
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                />
                                {formData.image && (
                                    <div className="relative w-full h-32 rounded overflow-hidden border border-zinc-700 bg-black/20">
                                        <Image src={formData.image} alt="preview" fill className="object-contain" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button type="submit" disabled={uploading}>
                            {uploading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4 mr-2" />}
                            Save
                        </Button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map(member => (
                    <div key={member.id} className="bg-zinc-800/50 p-4 rounded-lg flex items-center gap-4 group">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-violet-500/30">
                            {member.image ? (
                                <Image src={member.image} alt={member.name} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-xs text-gray-400">No Img</div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white">{member.name}</h3>
                            <p className="text-sm text-violet-400">{member.role}</p>
                            <p className="text-xs text-gray-500">Order: {member.order}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button
                                onClick={() => {
                                    setEditId(member.id)
                                    setFormData({ name: member.name, role: member.role, image: member.image, order: member.order })
                                    setIsEditing(true)
                                }}
                                className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/40"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(member.id)}
                                className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// --- GALLERY MANAGER ---
function GalleryManager() {
    const [images, setImages] = useState<GalleryImage[]>([])
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({ title: '', imageUrl: '' })
    const [uploading, setUploading] = useState(false)

    const fetchImages = async () => {
        try {
            const data = await getGalleryImages()
            setImages(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchImages() }, [])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const url = await uploadImage(file, 'gallery')
            setFormData(prev => ({ ...prev, imageUrl: url }))
            toast.success('Image uploaded')
        } catch (error) {
            toast.error('Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setUploading(true)
        try {
            await addGalleryImage(formData)
            toast.success('Image added')
            setFormData({ title: '', imageUrl: '' })
            fetchImages()
        } catch (error) {
            toast.error('Failed')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return
        try {
            await deleteGalleryImage(id)
            setImages(prev => prev.filter(img => img.id !== id))
            toast.success('Deleted')
        } catch (error) {
            toast.error('Delete failed')
        }
    }

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-bold text-white">Gallery</h2>

            <form onSubmit={handleSubmit} className="bg-black/40 p-6 rounded-lg border border-zinc-800 flex gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm text-gray-400 mb-1">Title (Optional)</label>
                    <input
                        className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm text-gray-400 mb-1">Image (Optional - Upload or URL)</label>
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <input type="file" onChange={handleImageUpload} className="hidden" id="gallery-upload" />
                            <label
                                htmlFor="gallery-upload"
                                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md p-2 text-gray-400 cursor-pointer hover:bg-zinc-700 flex items-center justify-center gap-2"
                            >
                                <Upload className="w-4 h-4" /> {uploading ? '...' : 'Upload File'}
                            </label>
                        </div>
                        <input
                            placeholder="Or paste image URL"
                            className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white text-sm"
                            value={formData.imageUrl}
                            onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                        />
                    </div>
                </div>
                <Button type="submit" disabled={uploading}>
                    <Plus className="w-4 h-4 mr-2" /> Add
                </Button>
            </form>

            {formData.imageUrl && (
                <div className="w-full h-32 relative rounded-lg overflow-hidden border border-zinc-700">
                    <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" />
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map(img => (
                    <div key={img.id} className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-zinc-800">
                        {img.imageUrl ? (
                            <Image src={img.imageUrl} alt={img.title} fill className="object-cover transition-transform group-hover:scale-110" />
                        ) : (
                            <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-gray-500">No Img</div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={() => handleDelete(img.id)}
                                className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                        {img.title && (
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-xs truncate">
                                {img.title}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// --- SPONSORS MANAGER ---
function SponsorsManager() {
    const [sponsors, setSponsors] = useState<Sponsor[]>([])
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({ name: '', logo: '', website: '' })
    const [uploading, setUploading] = useState(false)

    const fetchSponsors = async () => {
        try {
            const data = await getSponsors()
            setSponsors(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchSponsors() }, [])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const url = await uploadImage(file, 'sponsors')
            setFormData(prev => ({ ...prev, logo: url }))
            toast.success('Logo uploaded')
        } catch (error) {
            toast.error('Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setUploading(true)
        try {
            await addSponsor(formData)
            toast.success('Sponsor added')
            setFormData({ name: '', logo: '', website: '' })
            fetchSponsors()
        } catch (error) {
            toast.error('Failed')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return
        try {
            await deleteSponsor(id)
            setSponsors(prev => prev.filter(s => s.id !== id))
            toast.success('Deleted')
        } catch (error) {
            toast.error('Delete failed')
        }
    }

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-bold text-white">Sponsors</h2>

            <form onSubmit={handleSubmit} className="bg-black/40 p-6 rounded-lg border border-zinc-800 gap-4 grid grid-cols-1 md:grid-cols-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Name</label>
                    <input
                        className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Website (Optional)</label>
                    <input
                        className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white"
                        value={formData.website}
                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Logo (Optional - Upload or URL)</label>
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <input type="file" onChange={handleImageUpload} className="hidden" id="sponsor-upload" />
                            <label
                                htmlFor="sponsor-upload"
                                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md p-2 text-gray-400 cursor-pointer hover:bg-zinc-700 flex items-center justify-center gap-2"
                            >
                                <Upload className="w-4 h-4" /> {uploading ? '...' : 'Upload File'}
                            </label>
                        </div>
                        <input
                            placeholder="Or paste URL"
                            className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white text-sm"
                            value={formData.logo}
                            onChange={e => setFormData({ ...formData, logo: e.target.value })}
                        />
                    </div>
                </div>
                <div className="flex items-end">
                    <Button type="button" className="w-full" onClick={handleSubmit} disabled={uploading}>
                        <Plus className="w-4 h-4 mr-2" /> Add
                    </Button>
                </div>
            </form>

            <div className="flex flex-wrap gap-8 justify-center bg-white/5 p-8 rounded-xl">
                {sponsors.map(sponsor => (
                    <div key={sponsor.id} className="relative group p-4 bg-white/10 rounded items-center flex justify-center w-32 h-20">
                        <div className="relative w-full h-full">
                            {sponsor.logo ? (
                                <Image src={sponsor.logo} alt={sponsor.name} fill className="object-contain" />
                            ) : (
                                <span className="text-xs text-gray-500">{sponsor.name}</span>
                            )}
                        </div>
                        <button
                            onClick={() => handleDelete(sponsor.id)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
