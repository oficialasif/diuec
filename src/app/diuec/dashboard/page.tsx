'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'
import StatsCard from '@/components/admin/StatsCard'
import { Users, Trophy, Shield, FileText, TrendingUp, Activity } from 'lucide-react'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTournaments: 0,
        totalTeams: 0,
        totalPosts: 0,
        activeUsers: 0,
        pendingRegistrations: 0
    })
    const [recentActivity, setRecentActivity] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
        fetchRecentActivity()
    }, [])

    const fetchStats = async () => {
        try {
            // Fetch user count
            const usersSnap = await getDocs(collection(db, 'users'))

            // Fetch tournaments count
            const tournamentsSnap = await getDocs(collection(db, 'tournaments'))

            // Fetch teams count
            const teamsSnap = await getDocs(collection(db, 'teams'))

            // Fetch posts count
            const postsSnap = await getDocs(collection(db, 'posts'))

            // Fetch pending registrations
            const pendingQuery = query(
                collection(db, 'tournament_registrations'),
                where('status', '==', 'pending')
            )
            const pendingSnap = await getDocs(pendingQuery)

            setStats({
                totalUsers: usersSnap.size,
                totalTournaments: tournamentsSnap.size,
                totalTeams: teamsSnap.size,
                totalPosts: postsSnap.size,
                activeUsers: usersSnap.size, // Can be refined with activity tracking
                pendingRegistrations: pendingSnap.size
            })

            setLoading(false)
        } catch (error) {
            console.error('Error fetching stats:', error)
            setLoading(false)
        }
    }

    const fetchRecentActivity = async () => {
        try {
            // Fetch recent users
            const usersQuery = query(
                collection(db, 'users'),
                orderBy('createdAt', 'desc'),
                limit(5)
            )
            const usersSnap = await getDocs(usersQuery)

            const activities = usersSnap.docs.map(doc => {
                const data = doc.data()
                return {
                    type: 'user',
                    message: `New user registered: ${data.displayName}`,
                    time: data.createdAt
                }
            })

            setRecentActivity(activities)
        } catch (error) {
            console.error('Error fetching activity:', error)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-t-2 border-violet-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-gray-400">Welcome back! Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="violet"
                    trend="+12%"
                />
                <StatsCard
                    title="Tournaments"
                    value={stats.totalTournaments}
                    icon={Trophy}
                    color="yellow"
                    trend="+5%"
                />
                <StatsCard
                    title="Teams"
                    value={stats.totalTeams}
                    icon={Shield}
                    color="blue"
                    trend="+8%"
                />
                <StatsCard
                    title="Posts"
                    value={stats.totalPosts}
                    icon={FileText}
                    color="green"
                    trend="+15%"
                />
                <StatsCard
                    title="Active Users"
                    value={stats.activeUsers}
                    icon={Activity}
                    color="emerald"
                    trend="+20%"
                />
                <StatsCard
                    title="Pending Requests"
                    value={stats.pendingRegistrations}
                    icon={TrendingUp}
                    color="orange"
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
                <div className="space-y-3">
                    {recentActivity.length > 0 ? recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                            <p className="text-sm text-gray-300">{activity.message}</p>
                            <span className="text-xs text-gray-500">
                                {activity.time?.toDate?.()?.toLocaleDateString() || 'Recently'}
                            </span>
                        </div>
                    )) : (
                        <p className="text-gray-500 text-center py-8">No recent activity</p>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                    href="/diuec/dashboard/tournaments/create"
                    className="bg-violet-600/10 border border-violet-600/20 rounded-xl p-6 hover:bg-violet-600/20 transition-colors group"
                >
                    <Trophy className="w-8 h-8 text-violet-400 mb-3" />
                    <h3 className="font-semibold text-white group-hover:text-violet-300">Create Tournament</h3>
                    <p className="text-xs text-gray-400 mt-1">Start a new tournament</p>
                </Link>

                <Link
                    href="/diuec/dashboard/announcements"
                    className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-6 hover:bg-blue-600/20 transition-colors group"
                >
                    <FileText className="w-8 h-8 text-blue-400 mb-3" />
                    <h3 className="font-semibold text-white group-hover:text-blue-300">Announcements</h3>
                    <p className="text-xs text-gray-400 mt-1">Post updates</p>
                </Link>

                <Link
                    href="/diuec/dashboard/users"
                    className="bg-green-600/10 border border-green-600/20 rounded-xl p-6 hover:bg-green-600/20 transition-colors group"
                >
                    <Users className="w-8 h-8 text-green-400 mb-3" />
                    <h3 className="font-semibold text-white group-hover:text-green-300">Manage Users</h3>
                    <p className="text-xs text-gray-400 mt-1">User management</p>
                </Link>

                <Link
                    href="/diuec/dashboard/teams"
                    className="bg-orange-600/10 border border-orange-600/20 rounded-xl p-6 hover:bg-orange-600/20 transition-colors group"
                >
                    <Shield className="w-8 h-8 text-orange-400 mb-3" />
                    <h3 className="font-semibold text-white group-hover:text-orange-300">Manage Teams</h3>
                    <p className="text-xs text-gray-400 mt-1">Team verification</p>
                </Link>
            </div>
        </div>
    )
}
