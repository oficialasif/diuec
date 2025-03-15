'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'

interface SiteSettings {
  siteName: string
  siteDescription: string
  adminEmail: string
}

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: '',
    siteDescription: '',
    adminEmail: '',
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'site'))
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data() as SiteSettings)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
        toast.error('Failed to fetch settings')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateDoc(doc(db, 'settings', 'site'), settings)
      toast.success('Settings updated successfully')
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Failed to update settings')
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Site Settings</h1>

        <div className="bg-violet-950/50 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                placeholder="Enter site name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                placeholder="Enter site description"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                placeholder="Enter admin email"
                className="mt-1"
              />
              <p className="text-sm text-gray-400 mt-1">
                This email will be used for admin notifications and alerts.
              </p>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full">
                Save Settings
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-violet-950/50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Admin Account</h2>
          <p className="text-gray-400 mb-4">
            To change the admin password, please use the Firebase Authentication console.
            This ensures the highest level of security for admin credentials.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open('https://console.firebase.google.com', '_blank')}
          >
            Open Firebase Console
          </Button>
        </div>
      </div>
    </div>
  )
} 