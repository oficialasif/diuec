'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface ProfileData {
  displayName: string
  email: string
  phoneNumber?: string
  photoURL: string
  bio?: string
  updatedAt?: string
}

export default function ProfilePage() {
  const { user, userProfile, refreshUserProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ProfileData>({
    displayName: '',
    email: '',
    phoneNumber: '',
    photoURL: '',
    bio: ''
  })

  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data() as ProfileData
          setProfile({
            displayName: userData.displayName || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            photoURL: userData.photoURL || '',
            bio: userData.bio || '',
            updatedAt: userData.updatedAt || ''
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        toast.error('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('You must be logged in to update your profile')
      return
    }

    try {
      setSaving(true)
      toast.loading('Updating profile...')

      // Prepare update data
      const updateData: Partial<ProfileData> = {
        displayName: profile.displayName.trim(),
        email: profile.email.trim(),
        photoURL: profile.photoURL.trim(),
        updatedAt: new Date().toISOString()
      }

      // Only include optional fields if they have values
      if (profile.phoneNumber?.trim()) {
        updateData.phoneNumber = profile.phoneNumber.trim()
      }
      if (profile.bio?.trim()) {
        updateData.bio = profile.bio.trim()
      }

      // Update user profile in Firestore
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, updateData)

      // Refresh the user profile in the auth context
      await refreshUserProfile()

      toast.dismiss()
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.dismiss()
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-900/50 rounded-lg shadow-xl p-6 border border-violet-500/20">
          <h1 className="text-2xl font-bold text-white mb-6 bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo Preview */}
            <div className="flex items-center space-x-6 mb-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-violet-500/50">
                {profile.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.photoURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-violet-900/30 flex items-center justify-center">
                    <span className="text-2xl text-violet-300">
                      {profile.displayName?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="photoURL" className="block text-sm font-medium text-gray-300 mb-1">
                Profile Photo URL
              </label>
              <input
                type="url"
                id="photoURL"
                value={profile.photoURL}
                onChange={(e) => setProfile({ ...profile, photoURL: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-black/50 border border-violet-500/20 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-black/50 border border-violet-500/20 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-black/50 border border-violet-500/20 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={profile.phoneNumber}
                onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-black/50 border border-violet-500/20 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="+880"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 rounded-md bg-black/50 border border-violet-500/20 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 