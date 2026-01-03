'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/shared/ui/button'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { toast } from 'react-hot-toast'
import { X, User, Edit2 } from 'lucide-react'

interface ProfileEditModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
    const [loading, setLoading] = useState(false)
    const [displayName, setDisplayName] = useState('')
    const [bio, setBio] = useState('')
    const { user, userProfile } = useAuth()
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (userProfile) {
            setDisplayName(userProfile.displayName || '')
            setBio(userProfile.bio || '')
        }
    }, [userProfile])

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen, onClose])

    // Prevent body scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }
        return () => { document.body.style.overflow = "auto" }
    }, [isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setLoading(true)
        try {
            const userRef = doc(db, 'users', user.uid)
            await updateDoc(userRef, {
                displayName,
                bio,
                updatedAt: new Date(),
            })

            toast.success('Profile updated successfully!')
            onClose()
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                ref={modalRef}
                className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-900/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Edit2 className="w-5 h-5 text-violet-500" />
                        Edit Profile
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="displayName"
                                className="block text-sm font-medium text-gray-300 mb-2"
                            >
                                Display Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <input
                                    type="text"
                                    id="displayName"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="block w-full rounded-xl border border-white/10 bg-black/50 py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all sm:text-sm"
                                    placeholder="Enter your display name"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="bio"
                                className="block text-sm font-medium text-gray-300 mb-2"
                            >
                                Bio
                            </label>
                            <textarea
                                id="bio"
                                rows={4}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="block w-full rounded-xl border border-white/10 bg-black/50 py-3 px-4 text-white placeholder-gray-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all sm:text-sm resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={loading}
                                className="border-white/10 hover:bg-white/5 text-gray-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-violet-600 hover:bg-violet-700 min-w-[120px]"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}
