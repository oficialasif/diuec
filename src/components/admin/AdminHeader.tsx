'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shared/ui/avatar'
import { Button } from '@/components/shared/ui/button'
import { LogOut, Bell, UserPlus, Users, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getRecentActivities, formatRelativeTime, type Activity } from '@/lib/services/notification-service'
import Image from 'next/image'
import { getValidImageUrl } from '@/lib/utils/image'

export default function AdminHeader() {
    const { user, userProfile, signOut } = useAuth()
    const router = useRouter()
    const [showNotifications, setShowNotifications] = useState(false)
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const handleSignOut = async () => {
        await signOut()
        router.push('/diuec')
    }

    // Fetch activities when dropdown opens
    useEffect(() => {
        if (showNotifications && activities.length === 0) {
            fetchActivities()
        }
    }, [showNotifications])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowNotifications(false)
            }
        }

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showNotifications])

    const fetchActivities = async () => {
        setLoading(true)
        const data = await getRecentActivities(15)
        setActivities(data)
        setLoading(false)
    }

    const getActivityIcon = (type: Activity['type']) => {
        switch (type) {
            case 'user_registered':
                return <UserPlus className="w-4 h-4 text-blue-400" />
            case 'team_created':
            case 'team_joined':
                return <Users className="w-4 h-4 text-violet-400" />
            case 'tournament_created':
                return <Trophy className="w-4 h-4 text-yellow-400" />
            default:
                return <Bell className="w-4 h-4 text-gray-400" />
        }
    }

    return (
        <header className="h-16 bg-black/80 backdrop-blur-xl border-b border-zinc-800 px-6 flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold text-white">Administration</h2>
                <p className="text-xs text-gray-500">Manage your esports platform</p>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <Bell className="w-5 h-5 text-gray-400" />
                        {activities.length > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Header */}
                            <div className="p-4 border-b border-zinc-800">
                                <h3 className="font-semibold text-white">Recent Activity</h3>
                                <p className="text-xs text-gray-400 mt-1">Latest updates from your platform</p>
                            </div>

                            {/* Activity List */}
                            <div className="max-h-96 overflow-y-auto">
                                {loading ? (
                                    <div className="p-8 text-center">
                                        <div className="w-6 h-6 border-t-2 border-violet-500 rounded-full animate-spin mx-auto"></div>
                                    </div>
                                ) : activities.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">No recent activity</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-zinc-800">
                                        {activities.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="p-4 hover:bg-zinc-800/50 transition-colors cursor-pointer"
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* User Avatar */}
                                                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                                                        <Image
                                                            src={getValidImageUrl(activity.userPhoto, 'avatar')}
                                                            alt={activity.userName}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>

                                                    {/* Activity Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start gap-2">
                                                            {getActivityIcon(activity.type)}
                                                            <div className="flex-1">
                                                                <p className="text-sm text-white">
                                                                    <span className="font-semibold">{activity.userName}</span>
                                                                    {' '}
                                                                    <span className="text-gray-400">{activity.message}</span>
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {formatRelativeTime(activity.timestamp)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {activities.length > 0 && (
                                <div className="p-3 border-t border-zinc-800 bg-zinc-900/50">
                                    <button
                                        onClick={fetchActivities}
                                        className="w-full text-center text-sm text-violet-400 hover:text-violet-300 transition-colors"
                                    >
                                        Refresh
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Admin Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
                    <div className="text-right">
                        <p className="text-sm font-medium text-white">{userProfile?.displayName}</p>
                        <p className="text-xs text-violet-400">Administrator</p>
                    </div>
                    <Avatar className="h-10 w-10 ring-2 ring-violet-500/50">
                        <AvatarImage src={userProfile?.photoURL || ''} />
                        <AvatarFallback className="bg-violet-600 text-white">
                            {userProfile?.displayName?.charAt(0) || 'A'}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Sign Out */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </header>
    )
}
