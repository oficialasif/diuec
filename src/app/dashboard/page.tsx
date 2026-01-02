'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { motion, AnimatePresence } from 'framer-motion'
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
  Sparkles,
  Shield,
  ChevronDown,
  ChevronUp,
  Settings,
  BarChart2,
  User,
  LogOut
} from 'lucide-react'
import Link from 'next/link'
import TeamJoinRequests from '@/components/dashboard/TeamJoinRequests'
import NewsTicker from '@/components/dashboard/NewsTicker'
import { getTeamsByUser, getRecentTeamActivity } from '@/lib/team-helpers'
import { Team } from '@/lib/models'
import Image from 'next/image'
import { getValidImageUrl } from '@/lib/utils/image'

const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-violet-500/30 transition-all"
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-5 blur-2xl ${color}`} />
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2.5 rounded-xl bg-white/5 ${color.replace('bg-', 'text-')} group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="relative">
      <h3 className="text-2xl font-bold text-white mb-0.5 group-hover:text-violet-200 transition-colors">{value}</h3>
      <p className="text-xs text-gray-400 font-medium">{title}</p>
    </div>
  </motion.div>
)

const QuickAction = ({ title, icon: Icon, href, color, description }: any) => (
  <Link href={href} className="block group">
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      className="h-full bg-zinc-900/40 border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-zinc-800/60 hover:border-violet-500/30 transition-all cursor-pointer relative overflow-hidden"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${color} transition-opacity`} />

      <Icon className={`w-8 h-8 relative z-10 ${color.replace('bg-', 'text-')} group-hover:scale-110 transition-transform`} />

      <div className="text-center relative z-10">
        <span className="font-semibold text-gray-200 text-sm group-hover:text-white block">{title}</span>
        {description && <span className="text-[10px] text-gray-500 mt-1 block px-2 leading-tight">{description}</span>}
      </div>
    </motion.div>
  </Link >
)

const ActivityItem = ({ title, subtitle, time, icon: Icon }: any) => (
  <div className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors border-b border-white/5 last:border-0 last:rounded-b-xl">
    <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-violet-400" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-medium text-white truncate">{title}</h4>
      <p className="text-xs text-gray-400 truncate">{subtitle}</p>
    </div>
    <span className="text-[10px] text-gray-500 whitespace-nowrap">{time}</span>
  </div>
)

export default function Dashboard() {
  const { user, userProfile, isAdmin } = useAuth()
  const [stats, setStats] = useState({ tournaments: 0, matches: 0, teams: 0 })
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [myTeams, setMyTeams] = useState<Team[]>([])
  const [teamActivities, setTeamActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // UI States
  const [isTeamsExpanded, setIsTeamsExpanded] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch stats (mocked logic + some real queries)
        const tournamentsQuery = query(collection(db, 'tournament_registrations'), where('userId', '==', user.uid))
        const tournamentsSnap = await getDocs(tournamentsQuery)

        const teams = await getTeamsByUser(user.uid)
        setMyTeams(teams)

        if (teams.length > 0) {
          const activities = await getRecentTeamActivity(teams[0].id, 5)
          setTeamActivities(activities)
        }

        const announcementsQuery = query(
          collection(db, 'announcements'),
          orderBy('createdAt', 'desc'),
          limit(5)
        )
        const announcementsSnap = await getDocs(announcementsQuery)

        setStats({
          tournaments: tournamentsSnap.size,
          matches: 0,
          teams: teams.length
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

  // Combine announcements and events for NewsTicker
  const tickerItems: Array<{ id: string; title: string; type: 'announcement' | 'event' }> = announcements.map(a => ({
    id: a.id,
    title: `${a.title}: ${a.content.substring(0, 50)}...`,
    type: 'announcement' as const
  }))
  // Mock some upcoming events for ticker if none
  if (tickerItems.length === 0) {
    tickerItems.push({ id: 'e1', title: 'Upcoming Tournament: Winter Split 2024 Registration Open!', type: 'event' })
    tickerItems.push({ id: 'e2', title: 'Server Maintenance scheduled for Jan 10th.', type: 'announcement' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-violet-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* News Ticker - Fixed below navbar */}
      <div className="fixed top-16 left-0 right-0 z-40">
        <NewsTicker items={tickerItems} />
      </div>

      <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto space-y-8 pt-28">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-white/5">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl md:text-4xl font-bold text-white mb-2"
            >
              Overview
            </motion.h1>
            <p className="text-gray-400 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {getGreeting()}, <span className="text-violet-400 font-semibold">{userProfile?.displayName?.split(' ')[0]}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-white/10 hover:bg-white/5 text-xs h-9">
              <Settings className="w-3.5 h-3.5 mr-2" />
              Settings
            </Button>
            <Button className="bg-violet-600 hover:bg-violet-700 text-xs h-9">
              <Plus className="w-3.5 h-3.5 mr-2" />
              Start Team
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tournaments"
            value={stats.tournaments}
            icon={Trophy}
            color="bg-yellow-500"
            delay={0.1}
          />
          <StatCard
            title="Matches"
            value={stats.matches}
            icon={Swords}
            color="bg-red-500"
            delay={0.2}
          />
          <StatCard
            title="My Teams"
            value={stats.teams}
            icon={Shield}
            color="bg-blue-500"
            delay={0.3}
          />
          <StatCard
            title="Rank"
            value="#--"
            icon={BarChart2}
            color="bg-emerald-500"
            delay={0.4}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">

            {/* QUICK ACTIONS */}
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-200">
                <Target className="w-4 h-4 text-violet-400" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <QuickAction title="Find Team" description="Browse & join teams" icon={Users} href="/teams" color="bg-blue-500" />
                <QuickAction title="Create Team" description="Start your own squad" icon={Plus} href="/teams/create" color="bg-green-500" />
                <QuickAction title="Tournament Brackets" description="View live brackets" icon={Trophy} href="/brackets" color="bg-yellow-500" />
                <QuickAction title="My Matches" description="Report results" icon={Gamepad2} href="/dashboard/matches" color="bg-red-500" />
                <QuickAction title="Leaderboard" description="See top players" icon={BarChart2} href="/leaderboard" color="bg-purple-500" />
                <QuickAction title="Profile" description="Edit your info" icon={User} href="/profile" color="bg-zinc-500" />
              </div>
            </div>

            {/* MY TEAMS (Foldable) */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setIsTeamsExpanded(!isTeamsExpanded)}
              >
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-200">
                  <Shield className="w-4 h-4 text-violet-400" />
                  My Teams
                  <span className="text-xs font-normal text-gray-500 ml-2 bg-white/5 px-2 py-0.5 rounded-full">{myTeams.length} Active</span>
                </h2>
                {isTeamsExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </div>

              <AnimatePresence>
                {isTeamsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-white/5"
                  >
                    <div className="p-4 space-y-4">
                      {myTeams.length > 0 ? (
                        myTeams.map((team) => {
                          const isCaptain = team.captainId === user?.uid
                          return (
                            <div key={team.id} className="space-y-4">
                              {/* Team Row */}
                              <Link href={`/teams/${team.id}`}>
                                <div className="bg-black/40 border border-white/5 rounded-xl p-4 hover:border-violet-500/30 transition-all cursor-pointer group flex items-center gap-4">
                                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                                    <Image
                                      src={getValidImageUrl(team.logo, 'avatar')}
                                      alt={team.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-bold text-base truncate group-hover:text-violet-300 transition-colors">{team.name}</h3>
                                      {isCaptain && (
                                        <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-1.5 py-0.5 rounded-[4px] text-[10px] uppercase font-bold tracking-wider">
                                          CPT
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                                      <span>{team.members.length} Members</span>
                                      <span className="w-1 h-1 rounded-full bg-gray-700" />
                                      <span>{team.game}</span>
                                    </p>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                                </div>
                              </Link>

                              {/* Join Requests (Captain Only) */}
                              {isCaptain && (
                                <TeamJoinRequests teamId={team.id} isCaptain={isCaptain} />
                              )}
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-center py-8">
                          <Shield className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
                          <p className="text-gray-500 text-sm mb-4">No active teams found</p>
                          <Link href="/teams/create">
                            <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 text-xs">Create a Team</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Recent Activity */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-bold text-gray-200 flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  Activity Log
                </h3>
              </div>
              <div className="divide-y divide-white/5">
                {teamActivities.length > 0 ? teamActivities.map((activity, idx) => (
                  <ActivityItem
                    key={idx}
                    title={activity.message}
                    subtitle={activity.status ? `Status: ${activity.status}` : 'Team Activity'}
                    time={new Date(activity.time?.seconds * 1000).toLocaleDateString()}
                    icon={Users}
                  />
                )) : (
                  <>
                    <ActivityItem
                      title="Internal Scrim #42"
                      subtitle="Registered for PUBG Mobile Tournament"
                      time="2h ago"
                      icon={Trophy}
                    />
                    <ActivityItem
                      title="Welcome!"
                      subtitle="Joined DIU Esports Community"
                      time="1d ago"
                      icon={Sparkles}
                    />
                  </>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">

            {/* Announcements (Static List) */}
            <div className="bg-gradient-to-br from-violet-950/10 to-black/50 border border-violet-500/10 rounded-2xl p-5">
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-violet-200">
                <Bell className="w-4 h-4" />
                Latest Updates
              </h2>
              <div className="space-y-4">
                {announcements.slice(0, 3).map((ann) => (
                  <div key={ann.id} className="relative pl-4 border-l-2 border-violet-500/20 hover:border-violet-500 transition-colors cursor-default">
                    <h4 className="font-semibold text-gray-200 text-xs">{ann.title}</h4>
                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{ann.content}</p>
                    <span className="text-[9px] text-zinc-600 mt-1 block">
                      {new Date(ann.createdAt?.seconds * 1000).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {announcements.length === 0 && <div className="text-center text-xs text-gray-600 py-4">No updates</div>}
              </div>
            </div>

            {/* Upcoming Events Mini-Calendar */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5">
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-gray-200">
                <Calendar className="w-4 h-4 text-green-400" />
                Calendar
              </h2>
              <div className="space-y-3">
                {[1, 2].map((_, i) => (
                  <div key={i} className="flex gap-3 items-center p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="bg-white/5 group-hover:bg-white/10 rounded-lg p-1.5 text-center min-w-[3rem] transition-colors">
                      <span className="block text-[10px] text-gray-400 uppercase">JAN</span>
                      <span className="block text-lg font-bold text-white leading-none mt-0.5">{10 + i}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors">Scrim Series #{45 + i}</h4>
                      <p className="text-[10px] text-gray-500">8:00 PM • Valorant</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support / Help */}
            <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-5 text-center">
              <p className="text-xs text-gray-500 mb-3">Need help with registration?</p>
              <Button variant="ghost" className="w-full border border-white/10 hover:bg-white/5 text-xs h-8">
                Contact Support
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
