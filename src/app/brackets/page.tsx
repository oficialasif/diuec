'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { getActiveGames, Game } from '@/lib/game-services'
import { getTournaments, getTournamentMatches } from '@/lib/services'
import { getMatchesByTournament } from '@/lib/services/match-services'
import { Tournament } from '@/lib/models'
import { MatchDetailed } from '@/lib/models/match-stats'
import { Trophy, Calendar, Users, ChevronRight, Swords, Search, Plus, Minus, RotateCcw } from 'lucide-react'
import Image from 'next/image'
import { getValidImageUrl } from '@/lib/utils/image'
import { SymmetricBracket } from '@/components/tournaments/SymmetricBracket'

function BracketsContent() {
    const searchParams = useSearchParams()
    const initialTournamentId = searchParams.get('tournamentId')

    const [games, setGames] = useState<Game[]>([])
    const [tournaments, setTournaments] = useState<Tournament[]>([])
    const [selectedGame, setSelectedGame] = useState<string>('ALL')
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
    const [bracketMatches, setBracketMatches] = useState<MatchDetailed[]>([])
    const [loading, setLoading] = useState(true)
    const [zoom, setZoom] = useState(1)

    // Sidebar State
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchInitialData()
    }, [])

    useEffect(() => {
        if (selectedTournament) {
            fetchBracket(selectedTournament.id)
        }
    }, [selectedTournament])

    const fetchInitialData = async () => {
        try {
            const [fetchedGames, fetchedTournaments] = await Promise.all([
                getActiveGames(),
                getTournaments()
            ])
            setGames(fetchedGames)
            // Filter only ongoing or completed tournaments for brackets
            const validTournaments = fetchedTournaments.filter(t => t.status === 'ongoing' || t.status === 'completed')
            setTournaments(validTournaments)

            if (initialTournamentId) {
                const preselected = validTournaments.find(t => t.id === initialTournamentId)
                if (preselected) {
                    setSelectedTournament(preselected)
                    setSelectedGame(preselected.game) // Auto-switch game filter too
                } else if (fetchedGames.length > 0) {
                    setSelectedGame(fetchedGames[0].name)
                }
            } else {
                if (fetchedGames.length > 0) setSelectedGame(fetchedGames[0].name)
            }

            setLoading(false)
        } catch (error) {
            console.error('Error fetching data:', error)
            setLoading(false)
        }
    }

    const fetchBracket = async (tournamentId: string) => {
        try {
            // Using the match-services function which returns MatchDetailed[]
            const data = await getMatchesByTournament(tournamentId)
            setBracketMatches(data) // MatchDetailed matches
        } catch (error) {
            console.error('Error fetching bracket:', error)
        }
    }

    // Filter tournaments based on selection
    const displayedTournaments = tournaments.filter(t =>
        (selectedGame === 'ALL' || t.game === selectedGame) &&
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-black text-white pt-20">
            <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">

                {/* SIDEBAR: Tournament Selector */}
                <div className="lg:w-80 border-r border-zinc-800 bg-zinc-900/30 flex flex-col h-full shrink-0">
                    <div className="p-4 border-b border-zinc-800">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Trophy className="text-violet-500 w-5 h-5" />
                            Tournaments
                        </h2>
                    </div>

                    <div className="p-4 space-y-4 flex-1 overflow-hidden flex flex-col">
                        {/* Game Filters (Pills) */}
                        <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setSelectedGame('ALL')}
                                className={`text-[10px] whitespace-nowrap px-3 py-1 rounded-full border ${selectedGame === 'ALL' ? 'bg-violet-900 border-violet-500 text-white' : 'bg-zinc-800 border-zinc-700 text-gray-400'}`}
                            >
                                ALL
                            </button>
                            {games.map(game => (
                                <button
                                    key={game.id}
                                    onClick={() => setSelectedGame(game.name)}
                                    className={`text-[10px] whitespace-nowrap px-3 py-1 rounded-full border ${selectedGame === game.name ? 'bg-violet-900 border-violet-500 text-white' : 'bg-zinc-800 border-zinc-700 text-gray-400'}`}
                                >
                                    {game.displayName}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-3 h-3 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-black/40 border border-zinc-700 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:border-violet-500 focus:outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* List */}
                        <div className="space-y-1 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                            {displayedTournaments.map(t => (
                                <div
                                    key={t.id}
                                    onClick={() => setSelectedTournament(t)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-zinc-800 ${selectedTournament?.id === t.id
                                        ? 'bg-zinc-800 border-l-2 border-l-violet-500 border-t-zinc-700 border-r-zinc-700 border-b-zinc-700'
                                        : 'bg-transparent border-transparent hover:border-zinc-800'
                                        }`}
                                >
                                    <p className="font-medium text-xs text-gray-200 line-clamp-1">{t.title}</p>
                                    <div className="flex justify-between items-center mt-1 text-[10px] text-gray-500">
                                        <span>{t.format}</span>
                                        <span className={`px-1.5 py-0.5 rounded ${t.status === 'ongoing' ? 'bg-green-900/30 text-green-400' : 'bg-zinc-800'}`}>
                                            {t.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {displayedTournaments.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-xs">
                                    No tournaments found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* MAIN: Bracket View */}
                <div className="flex-1 bg-black overflow-hidden flex flex-col h-full relative">
                    {selectedTournament ? (
                        <>
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/20 flex justify-between items-center shrink-0 z-20">
                                <div>
                                    <h1 className="text-xl font-bold flex items-center gap-3">
                                        {selectedTournament.title}
                                        <span className="bg-violet-600 px-2 py-0.5 rounded text-white font-bold text-[10px]">{selectedTournament.game}</span>
                                    </h1>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3 text-violet-400" /> {selectedTournament.registeredTeams} Teams</span>
                                    <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-400" /> {selectedTournament.prizePool}</span>
                                </div>
                            </div>

                            {/* BRACKET VISUALIZER */}
                            <div className="flex-1 overflow-auto bg-[#0b101b] relative custom-scrollbar">
                                <div className="min-w-full min-h-full p-8 flex items-center justify-center">
                                    {bracketMatches.length > 0 ? (
                                        <SymmetricBracket matches={bracketMatches} />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-gray-500 opacity-50">
                                            <Swords className="w-12 h-12 mb-2" />
                                            <p className="text-sm">Bracket not generated</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                            <Trophy className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-sm">Select a tournament</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default function BracketsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white pt-24 flex justify-center"><div className="animate-spin h-8 w-8 border-t-2 border-violet-500 rounded-full"></div></div>}>
            <BracketsContent />
        </Suspense>
    )
}
