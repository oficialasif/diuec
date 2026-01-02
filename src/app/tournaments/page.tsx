'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getActiveGames, Game } from '@/lib/game-services'
import { Button } from '@/components/shared/ui/button'
import { Trophy, Users, Calendar, ChevronRight, X, Shield, AlertCircle, BarChart3, Sword, Info } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { getValidImageUrl } from '@/lib/utils/image'
import { registerForTournament, getMyTeams } from '@/lib/services'
import { Tournament, Team } from '@/lib/models'
import { TeamSelectionModal } from '@/components/tournaments/TeamSelectionModal'
import { Card } from '@/components/ui/card'
import Leaderboard from '@/components/tournaments/Leaderboard'

export default function TournamentsPage() {
  const { user } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState<string>('ALL')
  const [games, setGames] = useState<Game[]>([])
  const [registeredTournaments, setRegisteredTournaments] = useState<string[]>([])
  const [userTeams, setUserTeams] = useState<Team[]>([])
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Dashboard view state
  const [viewMode, setViewMode] = useState<'details' | 'browse'>('browse')
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'matches'>('overview')

  const fetchTournaments = useCallback(async () => {
    try {
      const q = query(collection(db, 'tournaments'), orderBy('startDate', 'asc'))
      const querySnapshot = await getDocs(q)
      const fetchedTournaments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate, // Keep as Timestamp for formatDate
        endDate: doc.data().endDate
      })) as Tournament[]
      setTournaments(fetchedTournaments)
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      toast.error('Failed to fetch tournaments')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchUserRegistrations = useCallback(async () => {
    if (!user) return
    try {
      const q = query(
        collection(db, 'tournament_registrations'),
        where('userId', '==', user.uid)
      )
      const querySnapshot = await getDocs(q)
      const registrations = querySnapshot.docs.map(doc => doc.data().tournamentId)
      setRegisteredTournaments(registrations)
    } catch (error) {
      console.error('Error fetching user registrations:', error)
    }
  }, [user])

  const fetchUserTeams = useCallback(async () => {
    if (!user) return
    try {
      const teams = await getMyTeams(user.uid)
      const myCaptainTeams = teams.filter(t => t.captainId === user.uid)
      setUserTeams(myCaptainTeams)
    } catch (e) {
      console.error("Error fetching teams", e)
    }
  }, [user])

  useEffect(() => {
    fetchTournaments()
    fetchGames()
    if (user) {
      fetchUserRegistrations()
      fetchUserTeams()
    }
  }, [user, fetchTournaments, fetchUserRegistrations, fetchUserTeams])

  const fetchGames = async () => {
    try {
      const data = await getActiveGames()
      setGames(data)
    } catch (error) {
      console.error('Error fetching games:', error)
    }
  }

  useEffect(() => {
    const filtered = tournaments.filter(t => selectedGame === 'ALL' || t.game === selectedGame)
    setFilteredTournaments(filtered)
  }, [selectedGame, tournaments])

  const handleRegisterClick = (tournament: Tournament) => {
    if (!user) {
      toast.error('Please sign in to register for tournaments')
      return
    }

    if (registeredTournaments.includes(tournament.id)) {
      // Already registered, view details
      setSelectedTournament(tournament);
      setViewMode('details');
      return;
    }

    if (tournament.format === 'SOLO') {
      confirmRegister(tournament, null)
    } else {
      setSelectedTournament(tournament)
      setIsModalOpen(true)
    }
  }

  const confirmRegister = async (tournament: Tournament, team: Team | null) => {
    if (!user) return

    if (team && team.members.length < (tournament.teamSize || 1)) {
      toast.error(`Team needs at least ${tournament.teamSize} members`)
      return
    }

    try {
      await registerForTournament(tournament.id, team ? team.id : null, user.uid)
      toast.success('Successfully registered!')
      setRegisteredTournaments(prev => [...prev, tournament.id])
      setTournaments(prev => prev.map(t =>
        t.id === tournament.id ? { ...t, registeredTeams: t.registeredTeams + 1 } : t
      ))
      setIsModalOpen(false)
      // Switch to details view for the newly registered tournament
      setSelectedTournament(tournament)
      setViewMode('details')

    } catch (error: any) {
      console.error("Registration failed", error)
      toast.error(error.message || 'Registration failed')
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return 'TBA';
    return new Date(timestamp.toDate()).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    })
  }

  const registeredList = tournaments.filter(t => registeredTournaments.includes(t.id));

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-8 px-4 md:px-0">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-8 pl-1">Tournaments</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT SIDEBAR: Navigation & Registered List */}
          <div className="lg:col-span-3 space-y-6">
            {/* Browse Button */}
            <div
              onClick={() => { setSelectedTournament(null); setViewMode('browse'); }}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${viewMode === 'browse' ? 'bg-violet-900/20 border-violet-500 text-white' : 'bg-zinc-900 border-zinc-800 text-gray-400 hover:border-violet-500/50'}`}
            >
              <span className="font-medium flex items-center gap-2"><Trophy className="w-5 h-5" /> Browse All</span>
              <ChevronRight className="w-4 h-4" />
            </div>

            {/* Registered Tournaments List */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-zinc-800">
                <h3 className="font-semibold text-gray-200">My Tournaments</h3>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {registeredList.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    No active tournaments.
                  </div>
                ) : (
                  registeredList.map(t => (
                    <div
                      key={t.id}
                      onClick={() => { setSelectedTournament(t); setViewMode('details'); }}
                      className={`p-4 border-b border-zinc-800 cursor-pointer transition-colors hover:bg-zinc-800 ${selectedTournament?.id === t.id && viewMode === 'details' ? 'bg-zinc-800 border-l-4 border-l-violet-500' : 'border-l-4 border-l-transparent'}`}
                    >
                      <p className="font-medium text-sm text-gray-200 line-clamp-1">{t.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{t.game}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Main Content */}
          <div className="lg:col-span-9">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500"></div>
              </div>
            ) : viewMode === 'browse' ? (
              // BROWSE GRID VIEW
              <div className="space-y-6">
                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedGame('ALL')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedGame === 'ALL' ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'}`}
                  >
                    ALL
                  </button>
                  {games.map(game => (
                    <button
                      key={game.id}
                      onClick={() => setSelectedGame(game.name)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedGame === game.name ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'}`}
                    >
                      {game.displayName}
                    </button>
                  ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredTournaments.map((tournament) => (
                    <motion.div
                      key={tournament.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-black border border-violet-500/20 rounded-lg overflow-hidden hover:border-violet-500/40 transition-all duration-300 flex flex-col group"
                    >
                      <div className="relative h-40 shrink-0">
                        <Image
                          src={getValidImageUrl(tournament.image, 'tournament')}
                          alt={tournament.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                        <div className="absolute top-2 right-2">
                          <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold border border-white/10 uppercase">
                            {tournament.game}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-lg font-bold mb-2 line-clamp-1">{tournament.title}</h3>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <Trophy className="w-3.5 h-3.5 text-violet-400" />
                            Prize: {tournament.prizePool}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <Calendar className="w-3.5 h-3.5 text-violet-400" />
                            {formatDate(tournament.startDate)}
                          </div>
                        </div>
                        <div className="mt-auto">
                          {registeredTournaments.includes(tournament.id) ? (
                            <Button className="w-full bg-violet-900/50 text-violet-200 hover:bg-violet-900" onClick={() => { setSelectedTournament(tournament); setViewMode('details'); }}>
                              View Dashboard
                            </Button>
                          ) : (
                            <Button className="w-full bg-zinc-800 hover:bg-zinc-700" onClick={() => handleRegisterClick(tournament)}>
                              Register
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : selectedTournament ? (
              // DASHBOARD DETAILS VIEW
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden border border-zinc-800">
                  <Image
                    src={getValidImageUrl(selectedTournament.image, 'tournament')}
                    alt={selectedTournament.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 md:p-8">
                    <span className="px-3 py-1 rounded-full bg-violet-600 text-white text-xs font-bold mb-3 inline-block">
                      {selectedTournament.status.toUpperCase()}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold">{selectedTournament.title}</h2>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-zinc-800">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'overview' ? 'border-violet-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'leaderboard' ? 'border-violet-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                  >
                    Leaderboard
                  </button>
                  <button
                    onClick={() => setActiveTab('matches')}
                    className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'matches' ? 'border-violet-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                  >
                    Matches
                  </button>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-zinc-900 border-zinc-800">
                        <div className="p-6 space-y-4">
                          <h3 className="font-bold flex items-center gap-2 mb-4"><Info className="w-5 h-5 text-violet-400" /> Info</h3>
                          <div className="flex justify-between py-2 border-b border-zinc-800/50">
                            <span className="text-gray-400">Game</span>
                            <span>{selectedTournament.game}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-zinc-800/50">
                            <span className="text-gray-400">Format</span>
                            <span>{selectedTournament.format}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-zinc-800/50">
                            <span className="text-gray-400">Teams</span>
                            <span>{selectedTournament.registeredTeams} / {selectedTournament.maxTeams}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-gray-400">Prize Pool</span>
                            <span className="text-yellow-400 font-bold">{selectedTournament.prizePool}</span>
                          </div>
                        </div>
                      </Card>
                      <Card className="bg-zinc-900 border-zinc-800">
                        <div className="p-6">
                          <h3 className="font-bold mb-4">Description</h3>
                          <p className="text-gray-400 leading-relaxed text-sm">
                            {selectedTournament.description}
                          </p>
                        </div>
                      </Card>
                    </div>
                  )}

                  {activeTab === 'leaderboard' && (
                    <Leaderboard tournamentId={selectedTournament.id} game={selectedTournament.game as any} />
                  )}

                  {activeTab === 'matches' && (
                    <MatchesList tournamentId={selectedTournament.id} />
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <TeamSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(team) => confirmRegister(selectedTournament!, team)}
        tournament={selectedTournament}
        userTeams={userTeams}
      />
    </div>
  )
}

function MatchesList({ tournamentId }: { tournamentId: string }) {
  const [matches, setMatches] = useState<any[]>([]) // MatchDetailed[]
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const { getMatchesByTournament } = await import('@/lib/services/match-services')
        const data = await getMatchesByTournament(tournamentId)
        setMatches(data)
      } catch (error) {
        console.error("Failed to load matches", error)
        toast.error("Failed to load matches")
      } finally {
        setLoading(false)
      }
    }
    loadMatches()
  }, [tournamentId])

  if (loading) {
    return <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500 mx-auto"></div></div>
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
        <Sword className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-400">No Matches Scheduled</h3>
        <p className="text-sm text-gray-600">Matches will appear here once the bracket is generated.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <div key={match.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest w-full md:w-auto text-center md:text-left">
            Match #{match.matchNumber} <span className={`ml-2 px-2 py-0.5 rounded ${match.status === 'completed' || match.status === 'approved' ? 'bg-green-900/30 text-green-400' :
                match.status === 'scheduled' ? 'bg-blue-900/30 text-blue-400' : 'bg-zinc-800 text-gray-400'
              }`}>{match.status}</span>
          </div>

          <div className="flex items-center gap-8 flex-1 justify-center">
            {/* Team A */}
            <div className="flex flex-col items-center gap-2 w-32">
              <div className="w-12 h-12 rounded-full bg-zinc-800 relative overflow-hidden ring-2 ring-transparent hover:ring-violet-500 transition-all">
                <Image src={getValidImageUrl(match.teamA.logo, 'avatar')} alt={match.teamA.name} fill className="object-cover" />
              </div>
              <span className="font-bold text-sm text-center line-clamp-1">{match.teamA.name}</span>
              {match.result && <span className="text-2xl font-bold font-mono text-white">{match.result.teamAStats?.totalPoints || 0}</span>}
            </div>

            <div className="text-center px-4">
              <span className="text-gray-600 font-bold text-xl">VS</span>
              {match.scheduledAt && (
                <p className="text-xs text-violet-400 mt-1">
                  {new Date(match.scheduledAt.toDate()).toLocaleDateString()}<br />
                  {new Date(match.scheduledAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>

            {/* Team B */}
            <div className="flex flex-col items-center gap-2 w-32">
              <div className="w-12 h-12 rounded-full bg-zinc-800 relative overflow-hidden ring-2 ring-transparent hover:ring-violet-500 transition-all">
                <Image src={getValidImageUrl(match.teamB.logo, 'avatar')} alt={match.teamB.name} fill className="object-cover" />
              </div>
              <span className="font-bold text-sm text-center line-clamp-1">{match.teamB.name}</span>
              {match.result && <span className="text-2xl font-bold font-mono text-white">{match.result.teamBStats?.totalPoints || 0}</span>}
            </div>
          </div>

          <div className="w-full md:w-auto flex justify-center">
            {/* Action buttons could go here (e.g., View Details) */}
          </div>
        </div>
      ))}
    </div>
  )
}
