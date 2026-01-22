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
import { SoloRegistrationModal } from '@/components/tournaments/SoloRegistrationModal'
import { GroupsDisplay } from '@/components/tournaments/GroupsDisplay'
import { Card } from '@/components/ui/card'
import Leaderboard from '@/components/tournaments/Leaderboard'
import { TournamentDetailsModal } from '@/components/tournaments/TournamentDetailsModal'
import { SymmetricBracket } from '@/components/tournaments/SymmetricBracket'
import { PaymentSubmissionModal } from '@/components/tournaments/PaymentSubmissionModal'
import { ResultSubmissionModal } from '@/components/tournaments/ResultSubmissionModal'

export default function TournamentsPage() {
  const { user } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState<string>('ALL')
  const [games, setGames] = useState<Game[]>([])
  const [registeredTournaments, setRegisteredTournaments] = useState<string[]>([])
  const [userTeams, setUserTeams] = useState<Team[]>([])

  // Modals State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [teamSelectionOpen, setTeamSelectionOpen] = useState(false)
  const [soloRegistrationOpen, setSoloRegistrationOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)

  // Staging for payment flow
  const [pendingRegistration, setPendingRegistration] = useState<{ team: Team | null, ingameName?: string } | null>(null)

  // For dashboard redirection
  const [viewMode, setViewMode] = useState<'details' | 'browse'>('browse') // Keeping for now if we want to redirect to a totally different page later, but for now we are fixing the POPUP requirement. Wait, user wants popup for DETAILS. 
  // User said: "click tournament card to pop up a window where showing all details... then register".
  // The Dashboard for a registered user should probably still be a full page or a big view.
  // Let's keep the dashboard view logic for REGISTERED users who want to see brackets/matches.
  // BUT, the initial click (browse) -> Popup Details.

  // Correction: User said "click tournament card to pop up a window where showing all details".
  // This implies the Browse view cards open the Details Modal.

  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'matches' | 'groups' | 'bracket'>('overview')

  const fetchTournaments = useCallback(async () => {
    try {
      const q = query(collection(db, 'tournaments'), orderBy('startDate', 'asc'))
      const querySnapshot = await getDocs(q)
      const fetchedTournaments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate,
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
      // 1. Fetch direct registrations (Solo or Captain)
      const qUser = query(
        collection(db, 'tournament_registrations'),
        where('userId', '==', user.uid)
      )
      const snapUser = await getDocs(qUser)
      const directRegs = snapUser.docs.map(doc => doc.data().tournamentId)

      // 2. Fetch registrations for teams I am part of
      const myTeams = await getMyTeams(user.uid)
      const teamIds = myTeams.map(t => t.id)

      let teamRegs: string[] = []
      if (teamIds.length > 0) {
        // Firestore 'in' limit is 10. Chunk it if needed, but for now assuming < 10 active teams per user usually.
        // If > 10, just slice first 10 or do multiple queries. Let's do batches of 10.
        const chunks = []
        for (let i = 0; i < teamIds.length; i += 10) {
          chunks.push(teamIds.slice(i, i + 10))
        }

        for (const chunk of chunks) {
          const qTeam = query(
            collection(db, 'tournament_registrations'),
            where('teamId', 'in', chunk)
          )
          const snapTeam = await getDocs(qTeam)
          snapTeam.docs.forEach(doc => teamRegs.push(doc.data().tournamentId))
        }
      }

      // Merge and unique
      const allRegs = Array.from(new Set([...directRegs, ...teamRegs]))
      setRegisteredTournaments(allRegs)
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

  // Open Details Modal
  const handleCardClick = (tournament: Tournament) => {
    setSelectedTournament(tournament)
    setDetailsModalOpen(true)
  }

  // Handle "Register" click from Details Modal
  const handleRegisterStart = () => {
    if (!user) {
      toast.error('Please sign in to register')
      return
    }
    if (!selectedTournament) return

    // Close details, open team selection
    setDetailsModalOpen(false)

    if (selectedTournament.format === 'SOLO') {
      setSoloRegistrationOpen(true)
    } else {
      setTeamSelectionOpen(true)
    }
  }

  const confirmRegister = async (tournament: Tournament, team: Team | null, ingameName?: string) => {
    if (!user) return

    if (team && team.members.length < (tournament.teamSize || 1)) {
      toast.error(`Team needs at least ${tournament.teamSize} members`)
      return
    }

    // CHECK FOR PAYMENT Requirement
    const isPaid = tournament.entryFee && tournament.entryFee.toLowerCase() !== 'free' && tournament.entryFee !== '0'
    if (isPaid) {
      setPendingRegistration({ team, ingameName })
      setTeamSelectionOpen(false)
      setSoloRegistrationOpen(false)
      setPaymentModalOpen(true)
      return
    }

    // Free Registration Flow
    await executeRegistration(tournament, team, ingameName)
  }

  const handlePaymentConfirm = async (transactionId: string, paymentNumber: string) => {
    if (!selectedTournament || !pendingRegistration || !user) return

    const paymentDetails = {
      transactionId,
      paymentNumber,
      captainEmail: user.email || ''
    }

    await executeRegistration(selectedTournament, pendingRegistration.team, pendingRegistration.ingameName, paymentDetails)
    setPaymentModalOpen(false)
    setPendingRegistration(null)
  }

  const executeRegistration = async (tournament: Tournament, team: Team | null, ingameName?: string, paymentDetails?: any) => {
    if (!user) return
    try {
      await registerForTournament(tournament.id, team ? team.id : null, user.uid, ingameName, paymentDetails)
      toast.success(paymentDetails ? 'Registration submitted! Pending payment verification.' : 'Successfully registered!')
      setRegisteredTournaments(prev => [...prev, tournament.id])
      setTournaments(prev => prev.map(t =>
        t.id === tournament.id ? { ...t, registeredTeams: t.registeredTeams + 1 } : t
      ))
      setTeamSelectionOpen(false)
      setSoloRegistrationOpen(false)

      setDetailsModalOpen(false)
      setSelectedTournament(tournament)
      setViewMode('details') // Switch to dashboard view

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

  // Render Dashboard View if viewMode is details AND selectedTournament is registered (or we just want to view brackets)
  // Actually, the user requirement is mainly about the listing card pop-up.
  // The existing logic used viewMode to swap the whole right panel.
  // We will keep that for the "My Tournaments" sidebar clicks or "Go to Dashboard".

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-8 px-4 md:px-0">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-8 pl-1">Tournaments</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT SIDEBAR: Navigation & Registered List */}
          <div className="lg:col-span-3 space-y-6">
            <div
              onClick={() => { setSelectedTournament(null); setViewMode('browse'); }}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${viewMode === 'browse' ? 'bg-violet-900/20 border-violet-500 text-white' : 'bg-zinc-900 border-zinc-800 text-gray-400 hover:border-violet-500/50'}`}
            >
              <span className="font-medium flex items-center gap-2"><Trophy className="w-5 h-5" /> Browse All</span>
              <ChevronRight className="w-4 h-4" />
            </div>

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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredTournaments.map((tournament) => (
                    <motion.div
                      key={tournament.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => handleCardClick(tournament)}
                      className="bg-black border border-violet-500/20 rounded-lg overflow-hidden hover:border-violet-500/40 transition-all duration-300 flex flex-col group cursor-pointer"
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
                        <h3 className="text-lg font-bold mb-2 line-clamp-1 group-hover:text-violet-400 transition-colors">{tournament.title}</h3>
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
                          <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-gray-300">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : selectedTournament ? (
              // DASHBOARD DETAILS VIEW (Existing)
              <div className="h-[calc(100vh-140px)] flex flex-col bg-zinc-900/30 rounded-2xl border border-zinc-800/50 overflow-hidden">
                {/* Fixed Header Part */}
                <div className="flex-none">
                  <div className="relative h-48 md:h-56 w-full">
                    <Image
                      src={getValidImageUrl(selectedTournament.image, 'tournament')}
                      alt={selectedTournament.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                      <span className="px-3 py-1 rounded-full bg-violet-600 text-white text-xs font-bold mb-3 inline-block">
                        {selectedTournament.status.toUpperCase()}
                      </span>
                      <h2 className="text-3xl md:text-4xl font-bold">{selectedTournament.title}</h2>
                    </div>
                  </div>

                  {/* Winner Banner */}
                  {selectedTournament.status === 'completed' && selectedTournament.winner && (
                    <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-6 flex flex-col md:flex-row items-center justify-center gap-6 text-white border-y border-yellow-500/30">
                      <div className="bg-yellow-500/20 p-4 rounded-full ring-4 ring-yellow-500/20">
                        <Trophy className="w-12 h-12 text-yellow-200" />
                      </div>
                      <div className="text-center md:text-left">
                        <div className="text-yellow-200 text-sm font-bold uppercase tracking-widest mb-1">Tournament Champion</div>
                        <h3 className="text-3xl md:text-4xl font-black">{selectedTournament.winner.name}</h3>
                      </div>
                      {selectedTournament.winner.logo && (
                        <div className="w-20 h-20 rounded-full bg-black/30 relative overflow-hidden ring-4 ring-yellow-500/40">
                          <Image src={getValidImageUrl(selectedTournament.winner.logo, 'avatar')} alt={selectedTournament.winner.name} fill className="object-cover" />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-10">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'overview' ? 'border-violet-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('groups')}
                      className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'groups' ? 'border-violet-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                    >
                      Groups
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
                    <button
                      onClick={() => setActiveTab('bracket')}
                      className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'bracket' ? 'border-violet-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                    >
                      Bracket
                    </button>
                  </div>
                </div>

                {/* Scrollable Content Part */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                  <div className="min-h-[400px]">
                    {activeTab === 'groups' && (
                      <div className="animate-in fade-in">
                        <GroupsDisplay tournamentId={selectedTournament.id} />
                      </div>
                    )}

                    {activeTab === 'bracket' && (
                      <div className="animate-in fade-in">
                        <BracketView tournamentId={selectedTournament.id} />
                      </div>
                    )}

                    {activeTab === 'overview' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-zinc-900 border-zinc-800 transition-all hover:border-zinc-700">
                          <div className="p-6 space-y-4">
                            <h3 className="font-bold flex items-center gap-2 mb-4 text-violet-400"><Info className="w-5 h-5" /> Info</h3>
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
                        <Card className="bg-zinc-900 border-zinc-800 transition-all hover:border-zinc-700">
                          <div className="p-6">
                            <h3 className="font-bold mb-4 text-violet-400">Description</h3>
                            <p className="text-gray-400 leading-relaxed text-sm whitespace-pre-wrap">
                              {selectedTournament.description}
                            </p>
                          </div>
                        </Card>
                      </div>
                    )}

                    {activeTab === 'leaderboard' && (
                      <Leaderboard tournamentId={selectedTournament.id} game={selectedTournament.game as any} />
                    )}

                    {/* Duplicate GroupsDisplay Removed */}

                    {activeTab === 'matches' && (
                      <MatchesList tournamentId={selectedTournament.id} />
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <TournamentDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        tournament={selectedTournament}
        onRegister={handleRegisterStart}
        isRegistered={selectedTournament ? registeredTournaments.includes(selectedTournament.id) : false}
        onDashboard={() => {
          setDetailsModalOpen(false)
          setViewMode('details')
        }}
      />

      {/* Team Selection Modal */}
      <TeamSelectionModal
        isOpen={teamSelectionOpen}
        onClose={() => setTeamSelectionOpen(false)}
        onSelect={(team) => confirmRegister(selectedTournament!, team)}
        tournament={selectedTournament}
        userTeams={userTeams}
      />

      <SoloRegistrationModal
        isOpen={soloRegistrationOpen}
        onClose={() => setSoloRegistrationOpen(false)}
        onConfirm={(name) => confirmRegister(selectedTournament!, null, name)}
        tournament={selectedTournament}
      />

      <PaymentSubmissionModal
        isOpen={paymentModalOpen}
        onClose={() => { setPaymentModalOpen(false); setPendingRegistration(null); }}
        onConfirm={handlePaymentConfirm}
        tournament={selectedTournament}
        team={pendingRegistration?.team || null}
      />
    </div>
  )
}

function MatchesList({ tournamentId }: { tournamentId: string }) {
  const { user } = useAuth()
  const [matches, setMatches] = useState<any[]>([]) // MatchDetailed[]
  const [loading, setLoading] = useState(true)
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<any>(null)

  const loadMatches = useCallback(async () => {
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
  }, [tournamentId])

  useEffect(() => {
    loadMatches()
  }, [loadMatches])

  const handleSubmitClick = (match: any) => {
    setSelectedMatch(match)
    setSubmissionModalOpen(true)
  }

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
      {matches.map((match) => {
        const isParticipant = user && (match.teamA?.captainId === user.uid || match.teamB?.captainId === user.uid || match.teamA?.id === user.uid || match.teamB?.id === user.uid);
        const canSubmit = isParticipant && (match.status === 'scheduled' || match.status === 'disputed');

        return (
          <div key={match.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest w-full md:w-auto text-center md:text-left">
              Match #{match.matchNumber} <span className={`ml-2 px-2 py-0.5 rounded ${match.status === 'completed' || match.status === 'approved' ? 'bg-green-900/30 text-green-400' :
                match.status === 'scheduled' ? 'bg-blue-900/30 text-blue-400' :
                  match.status === 'submitted' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-zinc-800 text-gray-400'
                }`}>{match.status}</span>
            </div>

            {match.type === 'BATTLE_ROYALE' ? (
              <div className="flex flex-col items-center gap-2 flex-1 justify-center py-4">
                <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold tracking-wider">
                  BATTLE ROYALE
                </span>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">Group {match.group} Match</h3>
                  <p className="text-sm text-gray-500 mt-1">{match.participants?.length || 0} Squads Participating</p>
                </div>
                {match.scheduledAt && (
                  <p className="text-xs text-violet-400 mt-2">
                    {new Date(match.scheduledAt.toDate ? match.scheduledAt.toDate() : match.scheduledAt).toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-8 flex-1 justify-center">
                {/* Team A */}
                <div className="flex flex-col items-center gap-2 w-32">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 relative overflow-hidden ring-2 ring-transparent hover:ring-violet-500 transition-all">
                    <Image src={getValidImageUrl(match.teamA?.logo, 'avatar')} alt={match.teamA?.name || 'TBD'} fill className="object-cover" />
                  </div>
                  <span className="font-bold text-sm text-center line-clamp-1">{match.teamA?.name || 'TBD'}</span>
                  {match.result && <span className="text-2xl font-bold font-mono text-white">{match.result.scoreA !== undefined ? match.result.scoreA : (match.result.teamAStats?.totalPoints || 0)}</span>}
                </div>

                <div className="text-center px-4">
                  <span className="text-gray-600 font-bold text-xl">VS</span>
                  {match.scheduledAt && (
                    <p className="text-xs text-violet-400 mt-1">
                      {new Date(match.scheduledAt.toDate ? match.scheduledAt.toDate() : match.scheduledAt).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Team B */}
                <div className="flex flex-col items-center gap-2 w-32">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 relative overflow-hidden ring-2 ring-transparent hover:ring-violet-500 transition-all">
                    <Image src={getValidImageUrl(match.teamB?.logo, 'avatar')} alt={match.teamB?.name || 'TBD'} fill className="object-cover" />
                  </div>
                  <span className="font-bold text-sm text-center line-clamp-1">{match.teamB?.name || 'TBD'}</span>
                  {match.result && <span className="text-2xl font-bold font-mono text-white">{match.result.scoreB !== undefined ? match.result.scoreB : (match.result.teamBStats?.totalPoints || 0)}</span>}
                </div>
              </div>
            )}

            <div className="w-full md:w-auto flex justify-center min-w-[120px]">
              {canSubmit && (
                <Button size="sm" onClick={() => handleSubmitClick(match)} className="bg-violet-600 hover:bg-violet-700">
                  Submit Result
                </Button>
              )}
              {match.status === 'submitted' && (
                <span className="text-xs text-yellow-500">Pending Review</span>
              )}
            </div>
          </div>
        )
      })}

      <ResultSubmissionModal
        isOpen={submissionModalOpen}
        onClose={() => setSubmissionModalOpen(false)}
        match={selectedMatch}
        onSuccess={loadMatches}
      />
    </div>
  )
}

function BracketView({ tournamentId }: { tournamentId: string }) {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { collection, query, where, getDocs } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')

        const q = query(collection(db, 'matches_detailed'), where('tournamentId', '==', tournamentId))
        const snap = await getDocs(q)
        const data = snap.docs.map((d: any) => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => a.matchNumber - b.matchNumber)
        setMatches(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [tournamentId])

  if (loading) return <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500 mx-auto"></div></div>

  if (matches.length === 0) return (
    <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
      <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-400">Bracket Coming Soon</h3>
      <p className="text-sm text-gray-600">The knockout bracket has not been generated yet.</p>
    </div>
  )

  const isBattleRoyale = matches.some(m => m.type === 'BATTLE_ROYALE')

  if (isBattleRoyale) return (
    <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
      <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-400">Battle Royale Format</h3>
      <p className="text-sm text-gray-600 mt-2">
        This tournament uses a Battle Royale format.<br />
        Please check the <span className="text-violet-400 font-bold">Matches</span> tab for schedule and <span className="text-violet-400 font-bold">Groups</span> tab for standings.
      </p>
    </div>
  )

  return (
    <div className="overflow-x-auto pb-4">
      <SymmetricBracket matches={matches} />
    </div>
  )
}
