'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AdminRouteGuard } from '@/components/auth/AdminRouteGuard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Settings2, Mail, Bell, Shield, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

interface SiteSettings {
  siteName: string
  siteDescription: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  maxUsersPerTournament: number
  emailNotifications: {
    enabled: boolean
    fromEmail: string
    welcomeTemplate: string
    tournamentTemplate: string
  }
  security: {
    maxLoginAttempts: number
    passwordMinLength: number
    requireEmailVerification: boolean
  }
  features: {
    tournaments: boolean
    gallery: boolean
    blog: boolean
    chat: boolean
  }
}

const defaultSettings: SiteSettings = {
  siteName: 'Gaming Community',
  siteDescription: 'A community for gamers',
  maintenanceMode: false,
  registrationEnabled: true,
  maxUsersPerTournament: 100,
  emailNotifications: {
    enabled: false,
    fromEmail: 'noreply@example.com',
    welcomeTemplate: 'Welcome to our gaming community!',
    tournamentTemplate: 'A new tournament has been announced!'
  },
  security: {
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireEmailVerification: true
  },
  features: {
    tournaments: true,
    gallery: true,
    blog: true,
    chat: true
  }
}

export default function SettingsManagement() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const settingsRef = doc(db, 'settings', 'site')
      const settingsDoc = await getDoc(settingsRef)
      
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as SiteSettings)
      } else {
        // If no settings document exists, create one with default settings
        await setDoc(settingsRef, defaultSettings)
        setSettings(defaultSettings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const settingsRef = doc(db, 'settings', 'site')
      await setDoc(settingsRef, settings)
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminRouteGuard>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Site Settings</h1>
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <svg className="w-8 h-8 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="mt-2 text-gray-400">Loading settings...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* General Settings */}
            <div className="bg-black/50 rounded-lg border border-violet-500/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings2 className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-semibold text-white">General Settings</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Site Name</label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="bg-black border-violet-500/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Site Description</label>
                  <Textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    className="bg-black border-violet-500/20 text-white"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-white">Maintenance Mode</label>
                    <p className="text-sm text-gray-400">Enable to show maintenance page to all users</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-white">User Registration</label>
                    <p className="text-sm text-gray-400">Allow new users to register</p>
                  </div>
                  <Switch
                    checked={settings.registrationEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, registrationEnabled: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Email Settings */}
            <div className="bg-black/50 rounded-lg border border-violet-500/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-semibold text-white">Email Notifications</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-white">Enable Email Notifications</label>
                    <p className="text-sm text-gray-400">Send automated emails to users</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications.enabled}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      emailNotifications: { ...settings.emailNotifications, enabled: checked }
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">From Email</label>
                  <Input
                    value={settings.emailNotifications.fromEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      emailNotifications: { ...settings.emailNotifications, fromEmail: e.target.value }
                    })}
                    className="bg-black border-violet-500/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Welcome Email Template</label>
                  <Textarea
                    value={settings.emailNotifications.welcomeTemplate}
                    onChange={(e) => setSettings({
                      ...settings,
                      emailNotifications: { ...settings.emailNotifications, welcomeTemplate: e.target.value }
                    })}
                    className="bg-black border-violet-500/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Tournament Notification Template</label>
                  <Textarea
                    value={settings.emailNotifications.tournamentTemplate}
                    onChange={(e) => setSettings({
                      ...settings,
                      emailNotifications: { ...settings.emailNotifications, tournamentTemplate: e.target.value }
                    })}
                    className="bg-black border-violet-500/20 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-black/50 rounded-lg border border-violet-500/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-semibold text-white">Security Settings</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Maximum Login Attempts</label>
                  <Input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                    })}
                    className="bg-black border-violet-500/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Minimum Password Length</label>
                  <Input
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, passwordMinLength: parseInt(e.target.value) }
                    })}
                    className="bg-black border-violet-500/20 text-white"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-white">Require Email Verification</label>
                    <p className="text-sm text-gray-400">Users must verify their email before accessing features</p>
                  </div>
                  <Switch
                    checked={settings.security.requireEmailVerification}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      security: { ...settings.security, requireEmailVerification: checked }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="bg-black/50 rounded-lg border border-violet-500/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-semibold text-white">Feature Toggles</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-white">Tournaments</label>
                    <p className="text-sm text-gray-400">Enable tournament features</p>
                  </div>
                  <Switch
                    checked={settings.features.tournaments}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      features: { ...settings.features, tournaments: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-white">Photo Gallery</label>
                    <p className="text-sm text-gray-400">Enable photo gallery features</p>
                  </div>
                  <Switch
                    checked={settings.features.gallery}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      features: { ...settings.features, gallery: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-white">Blog</label>
                    <p className="text-sm text-gray-400">Enable blog features</p>
                  </div>
                  <Switch
                    checked={settings.features.blog}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      features: { ...settings.features, blog: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-white">Chat</label>
                    <p className="text-sm text-gray-400">Enable chat features</p>
                  </div>
                  <Switch
                    checked={settings.features.chat}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      features: { ...settings.features, chat: checked }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminRouteGuard>
  )
} 