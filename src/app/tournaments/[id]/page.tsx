'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getTournament, getTournamentMatches, registerForTournament, getMyTeams, generateBracket, updateMatchResult } from '@/lib/services'
import { Tournament, Match, Team } from '@/lib/models'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/shared/ui/button'
import { Trophy, Users, Calendar, Shield, Swords, Edit2, X, Save } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function TournamentDetailsPage() {
    const params = useParams()
    const { user, isAdmin } = useAuth()
    const [tournament, setTournament] = useState<Tournament | null>(null)
    const [matches, setMatches] = useState<Match[]>([])
    const [myTeams, setMyTeams] = useState<Team[]>([])
    const [selectedTeam, setSelectedTeam] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [registering, setRegistering] = useState(false)
    const [editingMatch, setEditingMatch] = useState<Match | null>(null)

    const tournamentId = params?.id as string

    useEffect(() => {
        async function fetchData() {
            if (!tournamentId) return
            try {
                const [tData, mData] = await Promise.all([
                    getTournament(tournamentId),
                    getTournamentMatches(tournamentId)
                ])
                setTournament(tData)
                setMatches(mData)

                if (user) {
                    const teams = await getMyTeams(user.uid)
                    setMyTeams(teams)
                    if (teams.length > 0) setSelectedTeam(teams[0].id)
                }
            } catch (error) {
                console.error('Error fetching tournament:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [tournamentId, user])

    const handleRegister = async () => {
        if (!user || !selectedTeam) return
        setRegistering(true)
        try {
            await registerForTournament(tournamentId, selectedTeam, user.uid)
            toast.success('Registered successfully!')
            // Refresh
            const t = await getTournament(tournamentId)
            setTournament(t)
        } catch (error: any) {
            toast.error(error.message || 'Failed to register')
        } finally {
            setRegistering(false)
        }
    }

    const handleStartTournament = async () => {
        try {
            await generateBracket(tournamentId)
            toast.success('Bracket generated!')
            const m = await getTournamentMatches(tournamentId)
            setMatches(m)
            const t = await getTournament(tournamentId)
            setTournament(t)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const handleUpdateMatch = async () => {
        if (!editingMatch) return
        try {
            await updateMatchResult(editingMatch.id, editingMatch.scoreA || 0, editingMatch.scoreB || 0, editingMatch.winnerId || null)
            toast.success('Match updated')
            setEditingMatch(null)
            // Refresh matches
            const m = await getTournamentMatches(tournamentId)
            setMatches(m)
        } catch (e: any) {
            toast.error('Failed to update match')
        }
    }

    // ...



    if (loading) return <div className="text-center py-20">Loading...</div>
    if (!tournament) return <div className="text-center py-20">Tournament not found</div>

    return (
        <div className="min-h-screen bg-black text-white pt-20 pb-12">
            {/* Hero Section */}
            <div className="relative h-80 w-full mb-8">
                <Image src={tournament.image || '/placeholder-tournament.jpg'} alt={tournament.title} fill className="object-cover opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 container mx-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="bg-violet-600 px-3 py-1 rounded text-sm font-bold uppercase">{tournament.game}</span>
                        <span className="bg-zinc-800 px-3 py-1 rounded text-sm font-mono border border-zinc-700">{tournament.format}</span>
                        <span className="bg-zinc-800 px-3 py-1 rounded text-sm font-mono border border-zinc-700">{tournament.type}</span>
                    </div>
                    <h1 className="text-5xl font-bold mb-2">{tournament.title}</h1>
                    <div className="flex gap-6 text-gray-300">
                        <span className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> {tournament.prizePool}</span>
                        <span className="flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" /> {tournament.registeredTeams}/{tournament.maxTeams} Teams</span>
                        <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-green-500" /> {
                            tournament.startDate instanceof Date
                                ? tournament.startDate.toLocaleDateString()
                                : new Date((tournament.startDate as any).seconds * 1000).toLocaleDateString()
                        }</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main: Bracket / Matches */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Swords className="text-red-500" />
                            {tournament.status === 'upcoming' ? 'Registration Open' : 'Tournament Bracket'}
                        </h2>

                        {tournament.status === 'upcoming' ? (
                            <div className="text-center py-12">
                                <p className="text-gray-400 mb-6">Tournament has not started yet. Register your team to participate!</p>

                                {user ? (
                                    <div className="max-w-md mx-auto bg-zinc-800 p-6 rounded-lg">
                                        <h3 className="font-bold mb-4">Register Your Team</h3>
                                        {myTeams.length > 0 ? (
                                            <div className="flex gap-2">
                                                <select
                                                    className="flex-1 bg-black border border-zinc-700 rounded p-2 text-white"
                                                    value={selectedTeam}
                                                    onChange={e => setSelectedTeam(e.target.value)}
                                                >
                                                    {myTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                                <Button onClick={handleRegister} disabled={registering} className="bg-violet-600">
                                                    {registering ? '...' : 'Join Now'}
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-yellow-500 text-sm">You need to create a team first.</p>
                                        )}
                                    </div>
                                ) : (
                                    <Button onClick={() => window.location.href = '/login'}>Sign in to Register</Button>
                                )}

                                {isAdmin && (
                                    <div className="mt-8 pt-8 border-t border-zinc-800">
                                        <p className="text-xs text-gray-500 uppercase mb-2">Admin Controls</p>
                                        <Button onClick={handleStartTournament} className="bg-red-600 hover:bg-red-700">
                                            Start Tournament & Generate Bracket
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Bracket Visualizer */
                            <div className="space-y-4">
                                {matches.length === 0 ? (
                                    <p>No matches generated yet.</p>
                                ) : tournament.type === 'ELIMINATION' ? (
                                    <div className="grid gap-4">
                                        {matches.map(match => (
                                            <div key={match.id} className="relative bg-black p-4 rounded border border-zinc-800 flex justify-between items-center group">
                                                <div className="font-mono text-gray-500 w-20">Match #{match.matchNumber}</div>
                                                <div className="flex-1 px-8">
                                                    <div className={`flex justify-between items-center p-2 rounded ${match.winnerId === match.teamAId ? 'bg-green-900/10 border border-green-900/30' : 'hover:bg-zinc-900/50'}`}>
                                                        <span className={match.winnerId === match.teamAId ? 'text-green-400 font-bold' : ''}>
                                                            {match.teamAName || 'TBD'}
                                                        </span>
                                                        <span className="font-mono text-xl">{match.scoreA}</span>
                                                    </div>
                                                    <div className="h-px bg-zinc-800 my-1"></div>
                                                    <div className={`flex justify-between items-center p-2 rounded ${match.winnerId === match.teamBId ? 'bg-green-900/10 border border-green-900/30' : 'hover:bg-zinc-900/50'}`}>
                                                        <span className={match.winnerId === match.teamBId ? 'text-green-400 font-bold' : ''}>
                                                            {match.teamBName || 'TBD'}
                                                        </span>
                                                        <span className="font-mono text-xl">{match.scoreB}</span>
                                                    </div>
                                                </div>
                                                <div className="w-24 text-right">
                                                    <span className={`text-xs px-2 py-1 rounded ${match.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-gray-400'}`}>
                                                        {match.status}
                                                    </span>
                                                </div>

                                                {isAdmin && (
                                                    <button
                                                        onClick={() => setEditingMatch(match)}
                                                        className="absolute top-2 right-2 p-1 bg-zinc-800 rounded hover:bg-violet-600 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    /* Battle Royale Lobby View */
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold mb-4">Lobby Stats</h3>
                                        <p className="text-gray-400">Battle Royale Leaderboard implementation coming soon.</p>
                                        <div className="grid grid-cols-1 gap-2 mt-4">
                                            {matches[0]?.participants?.map(p => (
                                                <div key={p} className="p-3 bg-zinc-800 rounded">Team ID: {p}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Details */}
                <div className="space-y-6">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <h3 className="font-bold mb-4 text-violet-400">Description</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{tournament.description}</p>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <h3 className="font-bold mb-4 text-violet-400">Rules</h3>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
                            {tournament.rules?.map((rule, i) => (
                                <li key={i}>{rule}</li>
                            )) || <li>No specific rules listed.</li>}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Admin Match Edit Modal */}
            {editingMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Update Match Result</h3>
                            <button onClick={() => setEditingMatch(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-black p-4 rounded-lg flex justify-between items-center gap-4">
                                <div className="text-center flex-1">
                                    <div className="text-sm text-gray-400 mb-1">Team A</div>
                                    <div className="font-bold mb-2 truncate">{editingMatch.teamAName || 'TBD'}</div>
                                    <input
                                        type="number"
                                        className="w-16 bg-zinc-800 border border-zinc-700 rounded p-1 text-center"
                                        value={editingMatch.scoreA || 0}
                                        onChange={e => setEditingMatch({ ...editingMatch, scoreA: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="text-xl font-bold text-gray-600">VS</div>
                                <div className="text-center flex-1">
                                    <div className="text-sm text-gray-400 mb-1">Team B</div>
                                    <div className="font-bold mb-2 truncate">{editingMatch.teamBName || 'TBD'}</div>
                                    <input
                                        type="number"
                                        className="w-16 bg-zinc-800 border border-zinc-700 rounded p-1 text-center"
                                        value={editingMatch.scoreB || 0}
                                        onChange={e => setEditingMatch({ ...editingMatch, scoreB: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Winner</label>
                                <select
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2"
                                    value={editingMatch.winnerId || ''}
                                    onChange={e => setEditingMatch({ ...editingMatch, winnerId: e.target.value || undefined })}
                                >
                                    <option value="">Select Winner</option>
                                    {editingMatch.teamAId && <option value={editingMatch.teamAId}>{editingMatch.teamAName}</option>}
                                    {editingMatch.teamBId && <option value={editingMatch.teamBId}>{editingMatch.teamBName}</option>}
                                </select>
                            </div>

                            <Button onClick={handleUpdateMatch} className="w-full bg-green-600 hover:bg-green-700 mt-2">
                                <Save className="w-4 h-4 mr-2" /> Save Result
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
