'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { motion } from 'framer-motion'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/shared/ui/button'
import {
  Trophy,
  Gamepad2,
  Users,
  Bell,
  Calendar,
  ArrowRight,
  Plus,
  Target,
  Swords,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import AdminControls from '@/components/dashboard/AdminControls'

const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-violet-500/30 transition-all"
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl ${color}`} />
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-white/5 ${color.replace('bg-', 'text-')} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      {/* <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">+12%</span> */}
    </div>
    <div className="relative">
      <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-violet-200 transition-colors">{value}</h3>
      <p className="text-sm text-gray-400">{title}</p>
    </div>
  </motion.div>
)

const QuickAction = ({ title, icon: Icon, href, color }: any) => (
  <Link href={href} className="flex-1">
    <motion.div
      whileHover={{ y: -4 }}
      className="h-full bg-black/40 border border-white/10 p-4 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-white/5 hover:border-violet-500/30 transition-all cursor-pointer group"
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} bg-opacity-20 group-hover:bg-opacity-30 transition-all`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-').replace('/20', '')}`} />
      </div>
      <span className="font-medium text-gray-300 group-hover:text-white">{title}</span>
    </motion.div>
  </Link>
)

const ActivityItem = ({ title, subtitle, time, icon: Icon }: any) => (
  <div className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-colors border-b border-white/5 last:border-0">
    <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-violet-400" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-medium text-white truncate">{title}</h4>
      <p className="text-xs text-gray-400 truncate">{subtitle}</p>
    </div>
    <span className="text-xs text-gray-500 whitespace-nowrap">{time}</span>
  </div>
)

export default function Dashboard() {
  const { user, userProfile, isAdmin } = useAuth()
  const [stats, setStats] = useState({ tournaments: 0, matches: 0, teams: 0 })
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch stats (mocked logic + some real queries)
        const tournamentsQuery = query(collection(db, 'tournament_registrations'), where('userId', '==', user.uid))
        const tournamentsSnap = await getDocs(tournamentsQuery)

        // Fetch announcements
        const announcementsQuery = query(
          collection(db, 'announcements'),
          orderBy('createdAt', 'desc'),
          limit(5)
        )
        const announcementsSnap = await getDocs(announcementsQuery)

        setStats({
          tournaments: tournamentsSnap.size,
          matches: 0, // Need to implement match tracking fully to get this
          teams: 0 // Need to implement team counting
        })

        setAnnouncements(announcementsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      } catch (error) {
        console.error("Error loading dashboard:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-violet-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Helper for user feedback/toast - can be invisible or Global */}
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
            >
              {getGreeting()}, {userProfile?.displayName?.split(' ')[0]}
            </motion.h1>
            <p className="text-gray-400 mt-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Welcome back to the DIU Esports Command Center
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="border-white/10 hover:bg-white/5">
              <Users className="w-4 h-4 mr-2" />
              Invite Friends
            </Button>
            {isAdmin && (
              <Button className="bg-violet-600 hover:bg-violet-700">
                <Target className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            )}
          </div>
        </div>

        {/* Admin Controls (Conditional) */}
        {isAdmin && <AdminControls />}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Tournaments Joined"
            value={stats.tournaments}
            icon={Trophy}
            color="bg-yellow-500"
            delay={0.1}
          />
          <StatCard
            title="Upcoming Matches"
            value={stats.matches}
            icon={Gamepad2}
            color="bg-violet-500"
            delay={0.2}
          />
          <StatCard
            title="Community Rank"
            value="#42"
            icon={Target}
            color="bg-emerald-500"
            delay={0.3}
          />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Swords className="w-5 h-5 text-violet-400" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickAction title="Find Team" icon={Users} href="/teams" color="bg-blue-500" />
                <QuickAction title="Create Team" icon={Plus} href="/teams/create" color="bg-green-500" />
                <QuickAction title="Join Scrim" icon={Swords} href="/games/pubg" color="bg-red-500" />
                <QuickAction title="View Bracket" icon={Trophy} href="/tournaments" color="bg-yellow-500" />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-semibold">Recent Activity</h3>
                <button className="text-xs text-violet-400 hover:text-violet-300">View All</button>
              </div>
              <div className="divide-y divide-white/5">
                <ActivityItem
                  title="Internal Scrim #42"
                  subtitle="Registered for PUBG Mobile Tournament"
                  time="2h ago"
                  icon={Trophy}
                />
                <ActivityItem
                  title="New Team Member"
                  subtitle="Tanvir joined 'DIU Gladiators'"
                  time="5h ago"
                  icon={Users}
                />
                <ActivityItem
                  title="System Update"
                  subtitle="Profile picture updated successfully"
                  time="1d ago"
                  icon={Sparkles}
                />
                {/* Placeholder if empty */}
                {/* <div className="p-8 text-center text-gray-500 text-sm">No recent activity</div> */}
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Announcements */}
            <div className="bg-gradient-to-b from-violet-950/20 to-black border border-violet-500/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-violet-400" />
                Announcements
              </h2>
              <div className="space-y-6">
                {announcements.length > 0 ? announcements.map((ann) => (
                  <div key={ann.id} className="relative pl-6 border-l-2 border-violet-500/30">
                    <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-violet-500 ring-4 ring-black" />
                    <h4 className="font-semibold text-white/90 text-sm">{ann.title}</h4>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ann.content}</p>
                    <span className="text-[10px] text-zinc-500 mt-2 block">
                      {new Date(ann.createdAt?.seconds * 1000).toLocaleDateString()}
                    </span>
                  </div>
                )) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">No new announcements</p>
                  </div>
                )}
              </div>
              <Button variant="ghost" className="w-full mt-6 text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-950/30">
                View All Updates
                <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            </div>

            {/* Upcoming Events Mini-Calendar Concept */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-400" />
                Upcoming Events
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4 items-center p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="bg-white/10 rounded-lg p-2 text-center min-w-[3.5rem]">
                    <span className="block text-xs text-gray-400">DEC</span>
                    <span className="block text-xl font-bold text-white">31</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">New Year Scrim</h4>
                    <p className="text-xs text-gray-400">8:00 PM • Valorant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}