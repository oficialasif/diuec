'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Tournament, Team } from '@/lib/models'
import { Button } from '@/components/shared/ui/button'
import { Calendar, Trophy, Users, Swords, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getActiveGames, Game } from '@/lib/game-services'
import { useAuth } from '@/contexts/auth-context'
import toast from 'react-hot-toast'
import { registerForTournament, getMyTeams } from '@/lib/services'
import { TournamentDetailsModal } from '@/components/tournaments/TournamentDetailsModal'
import { getValidImageUrl } from '@/lib/utils/image'
import { TeamSelectionModal } from '@/components/tournaments/TeamSelectionModal'

export default function GameHubPage() {
    const params = useParams()
    const { user } = useAuth()
    const gameId = params?.id as string

    // State
    const [gameInfo, setGameInfo] = useState<Game | null>(null)
    const [tournaments, setTournaments] = useState<Tournament[]>([])
    const [loading, setLoading] = useState(true)
    const [registeredTournaments, setRegisteredTournaments] = useState<string[]>([])
    const [userTeams, setUserTeams] = useState<Team[]>([])

    // Registration State
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

    // Derived
    const gameName = gameId?.toUpperCase()

    const fetchData = useCallback(async () => {
        if (!gameId) return
        setLoading(true)
        try {
            // 1. Fetch Game Details
            const games = await getActiveGames()
            const foundGame = games.find(g => g.name.toLowerCase() === gameId.toLowerCase())

            // Fallback for hardcoded URLs if DB name differs slightly, or just use what we found
            if (foundGame) {
                setGameInfo(foundGame)
            } else {
                // Determine display name from ID if not found in DB (fallback)
                setGameInfo({
                    id: 'temp',
                    name: gameName,
                    displayName: gameId.charAt(0).toUpperCase() + gameId.slice(1).replace('-', ' '),
                    isActive: true, // assume active if page visited
                    createdAt: { seconds: 0, nanoseconds: 0 } as any,
                    updatedAt: { seconds: 0, nanoseconds: 0 } as any
                })
            }

            // 2. Fetch Tournaments
            // We search by the 'game' field in tournaments. This usually matches the 'name' or 'displayName'.
            // Let's try matching 'name' (e.g. VALORANT) as that's how we save it usually.
            // But legacy might be Mixed Case. 
            // Querying by game name derived from URL for now.
            const tQuery = query(
                collection(db, 'tournaments'),
                // We need to be careful with case sensitivity. 
                // Assuming 'game' field in tournaments matches the gameName (UPPERCASE) or the foundGame.name
                where('game', '==', foundGame ? foundGame.name : gameName),
                orderBy('startDate', 'desc')
            )
            // Note: If no composite index exists for game+startDate, this might fail.
            // If it fails, we catch and try simple where.
            let tList: Tournament[] = []
            try {
                const tSnap = await getDocs(tQuery)
                tList = tSnap.docs.map(d => ({ id: d.id, ...d.data() } as Tournament))
            } catch (idxError) {
                console.warn("Index error, falling back to client sort", idxError)
                const simpleQuery = query(collection(db, 'tournaments'), where('game', '==', foundGame ? foundGame.name : gameName))
                const simpleSnap = await getDocs(simpleQuery)
                tList = simpleSnap.docs.map(d => ({ id: d.id, ...d.data() } as Tournament))
                tList.sort((a, b) => (b.startDate as any).seconds - (a.startDate as any).seconds)
            }
            setTournaments(tList)

        } catch (error) {
            console.error(error)
            toast.error("Failed to load game data")
        } finally {
            setLoading(false)
        }
    }, [gameId, gameName])

    const fetchUserRegistrations = useCallback(async () => {
        if (!user) return
        try {
            const q = query(collection(db, 'tournament_registrations'), where('userId', '==', user.uid))
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
        fetchData()
        if (user) {
            fetchUserRegistrations()
            fetchUserTeams()
        }
    }, [fetchData, fetchUserRegistrations, fetchUserTeams, user])

    // Registration Handlers
    const handleRegisterClick = (tournament: Tournament) => {
        if (!user) {
            toast.error('Please sign in to register')
            return
        }
        if (registeredTournaments.includes(tournament.id)) return // Already registered

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
            setSelectedTournament(null)
        } catch (error: any) {
            console.error("Registration failed", error)
            toast.error(error.message || 'Registration failed')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white pt-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500"></div>
            </div>
        )
    }

    if (!gameInfo) return <div className="min-h-screen bg-black text-white pt-20 text-center">Game not found</div>

    return (
        <div className="min-h-screen bg-black text-white pt-20 pb-12">
            {/* Hero */}
            <div className="relative h-64 w-full mb-12">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-900 via-black to-black opacity-80" />
                {gameInfo.icon && (
                    <Image src={getValidImageUrl(gameInfo.icon, 'game')} alt="bg" fill className="object-cover -z-10 opacity-30" />
                )}
                <div className="container mx-auto px-4 h-full flex items-center relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-zinc-800 rounded-2xl flex items-center justify-center border-2 border-violet-500 shadow-xl overflow-hidden relative">
                            {gameInfo.icon ? (
                                <Image src={getValidImageUrl(gameInfo.icon, 'game')} alt={gameInfo.displayName} fill className="object-cover" />
                            ) : (
                                <Swords className="w-12 h-12 text-violet-500" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold mb-2">{gameInfo.displayName}</h1>
                            <p className="text-gray-400">Official Game Hub • Active Tournaments: {tournaments.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Tournaments */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Trophy className="text-yellow-500" /> Active Tournaments
                        </h2>
                        {tournaments.length > 0 ? (
                            <div className="grid gap-4">
                                {tournaments.map(t => (
                                    <div key={t.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-violet-500 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                {/* Removed Link to avoid style issues/confusion. Title triggers nothing or could trigger details. */}
                                                <h3 className="font-bold text-xl text-white mb-1">
                                                    {t.title || <span className="text-gray-500 italic">Untitled Tournament</span>}
                                                </h3>
                                                <p className="text-gray-400 text-sm line-clamp-2">{t.description}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${t.status === 'upcoming' || t.status === 'ongoing' ? 'bg-green-900/50 text-green-400' : 'bg-zinc-800 text-gray-500'
                                                }`}>
                                                {t.status}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
                                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-violet-500" /> {new Date((t.startDate as any).seconds * 1000).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><Users className="w-4 h-4 text-violet-500" /> {t.registeredTeams}/{t.maxTeams} Teams</span>
                                            <span className="flex items-center gap-1"><Trophy className="w-4 h-4 text-violet-500" /> {t.prizePool}</span>
                                            <span className="bg-zinc-800 px-2 rounded">{t.format}</span>
                                        </div>

                                        <div className="flex gap-3">
                                            {registeredTournaments.includes(t.id) ? (
                                                <Button className="flex-1 bg-violet-900/50 text-violet-200 hover:bg-violet-900" onClick={() => window.location.href = '/tournaments'}>
                                                    View Dashboard
                                                </Button>
                                            ) : (
                                                <Button className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={() => handleRegisterClick(t)}>
                                                    Register Now
                                                </Button>
                                            )}
                                            <Button variant="outline" className="flex-1" onClick={() => { setSelectedTournament(t); setIsDetailsModalOpen(true); }}>View Details</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
                                <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No active tournaments for {gameInfo.displayName} at the moment.</p>
                                <Button className="mt-4" variant="outline">Browse All Games</Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Users className="text-blue-500" /> Top Teams
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Top rated teams in DIU for {gameInfo.displayName}</p>
                        <div className="space-y-2">
                            <p className="text-xs text-gray-600 italic">Leaderboard coming soon...</p>
                        </div>
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

            <TournamentDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => { setIsDetailsModalOpen(false); setSelectedTournament(null); }}
                tournament={selectedTournament}
                onRegister={() => { setIsDetailsModalOpen(false); handleRegisterClick(selectedTournament!); }}
                isRegistered={selectedTournament ? registeredTournaments.includes(selectedTournament.id) : false}
            />
        </div>
    )
}

