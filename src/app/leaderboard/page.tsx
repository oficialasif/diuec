'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getActiveGames, Game } from '@/lib/game-services'
import { Trophy, Medal, Crown, Skull, ChevronDown, ChevronUp, User, Crosshair, Shield, Activity, Target, Swords, Goal } from 'lucide-react'

// --- Types & Config ---

type LeaderboardColumn = {
    key: string
    label: string
    align?: 'left' | 'center' | 'right'
}

type GameConfig = {
    formats: string[]
    columns: LeaderboardColumn[]
    memberColumns: { key: string, label: string, icon: any }[] // New: Define what to show for members
    icon: any
}

const DEFAULT_CONFIG: GameConfig = {
    formats: ['SQUAD', 'SOLO'],
    columns: [
        { key: 'matches', label: 'Matches', align: 'center' },
        { key: 'wins', label: 'Wins', align: 'center' },
        { key: 'losses', label: 'Losses', align: 'center' },
        { key: 'points', label: 'Points', align: 'right' },
    ],
    memberColumns: [],
    icon: Trophy
}

const LEADERBOARD_CONFIG: Record<string, GameConfig> = {
    'efootball': {
        formats: ['SOLO', 'DUO'],
        columns: [
            { key: 'matches', label: 'Matches Played', align: 'center' },
            { key: 'wins', label: 'Wins', align: 'center' },
            { key: 'losses', label: 'Losses', align: 'center' },
            { key: 'goals', label: 'Goals', align: 'center' },
            { key: 'assists', label: 'Assists', align: 'center' },
            { key: 'goal_diff', label: 'Goal Difference', align: 'center' },
            { key: 'points', label: 'Points', align: 'right' },
        ],
        memberColumns: [
            { key: 'goals', label: 'Goals', icon: Goal },
            { key: 'assists', label: 'Assists', icon: Crosshair }
        ],
        icon: Goal
    },
    'freefire': {
        formats: ['SQUAD', 'SOLO'],
        columns: [
            { key: 'matches', label: 'Matches', align: 'center' },
            { key: 'wins', label: 'Wins', align: 'center' },
            { key: 'losses', label: 'Losses', align: 'center' },
            { key: 'kills', label: 'Kills', align: 'center' },
            { key: 'assists', label: 'Assists', align: 'center' },
            { key: 'damage', label: 'Damage', align: 'center' },
            { key: 'points', label: 'Points', align: 'right' },
        ],
        memberColumns: [
            { key: 'kills', label: 'Kills', icon: Skull },
            { key: 'assists', label: 'Ast', icon: Crosshair },
            { key: 'damage', label: 'Dmg', icon: Target }
        ],
        icon: Crosshair
    },
    'pubg': {
        formats: ['SQUAD', 'DUO', 'SOLO'],
        columns: [
            { key: 'matches', label: 'Matches', align: 'center' },
            { key: 'wins', label: 'Wins', align: 'center' },
            { key: 'losses', label: 'Losses', align: 'center' },
            { key: 'kills', label: 'Kills', align: 'center' },
            { key: 'assists', label: 'Assists', align: 'center' },
            { key: 'damage', label: 'Damage', align: 'center' },
            { key: 'points', label: 'Points', align: 'right' },
        ],
        memberColumns: [
            { key: 'kills', label: 'Kills', icon: Skull },
            { key: 'assists', label: 'Ast', icon: Crosshair },
            { key: 'damage', label: 'Dmg', icon: Target }
        ],
        icon: Crosshair
    },
    'valorant': {
        formats: ['5v5'],
        columns: [
            { key: 'matches', label: 'Matches', align: 'center' },
            { key: 'wins', label: 'Wins', align: 'center' },
            { key: 'losses', label: 'Losses', align: 'center' },
            { key: 'rounds_won', label: 'R Won', align: 'center' },
            { key: 'rounds_lost', label: 'R Lost', align: 'center' },
            { key: 'round_diff', label: 'R Diff', align: 'center' },
            { key: 'points', label: 'Points', align: 'right' },
        ],
        memberColumns: [
            { key: 'rating', label: 'ACS', icon: Activity },
            { key: 'kd', label: 'K/D', icon: Crosshair }
        ],
        icon: Swords
    },
    'mobilelegends': {
        formats: ['5v5'],
        columns: [
            { key: 'matches', label: 'Matches', align: 'center' },
            { key: 'wins', label: 'Wins', align: 'center' },
            { key: 'losses', label: 'Losses', align: 'center' },
            { key: 'kills', label: 'Kills', align: 'center' },
            { key: 'assists', label: 'Assists', align: 'center' },
            { key: 'kill_diff', label: 'K Diff', align: 'center' },
            { key: 'points', label: 'Points', align: 'right' },
        ],
        memberColumns: [
            { key: 'kills', label: 'Kills', icon: Skull },
            { key: 'assists', label: 'Ast', icon: Shield }
        ],
        icon: Shield
    },
    'cs2': {
        formats: ['5v5'],
        columns: [
            { key: 'matches', label: 'Matches', align: 'center' },
            { key: 'wins', label: 'Wins', align: 'center' },
            { key: 'losses', label: 'Losses', align: 'center' },
            { key: 'rounds_won', label: 'R Won', align: 'center' },
            { key: 'rounds_lost', label: 'R Lost', align: 'center' },
            { key: 'round_diff', label: 'R Diff', align: 'center' },
            { key: 'points', label: 'Points', align: 'right' },
        ],
        memberColumns: [
            { key: 'rating', label: 'Rating', icon: Activity },
            { key: 'kd', label: 'K/D', icon: Crosshair }
        ],
        icon: Target
    },
    'chess': {
        formats: ['RAPID', 'BLITZ', 'CLASSICAL'],
        columns: [
            { key: 'matches', label: 'Matches', align: 'center' },
            { key: 'wins', label: 'Wins', align: 'center' },
            { key: 'losses', label: 'Losses', align: 'center' },
            { key: 'draws', label: 'Draws', align: 'center' },
            { key: 'rating_change', label: 'Rating +/-', align: 'center' },
            { key: 'points', label: 'Total Pts', align: 'right' },
        ],
        memberColumns: [],
        icon: Activity
    },
    'fcmobile': {
        formats: ['1v1'],
        columns: [
            { key: 'matches', label: 'Matches', align: 'center' },
            { key: 'wins', label: 'Wins', align: 'center' },
            { key: 'losses', label: 'Losses', align: 'center' },
            { key: 'goals', label: 'Goals', align: 'center' },
            { key: 'assists', label: 'Assists', align: 'center' },
            { key: 'goal_diff', label: 'GD', align: 'center' },
            { key: 'points', label: 'Points', align: 'right' },
        ],
        memberColumns: [],
        icon: Goal
    }
}

// Helper to match game ID to config key
const getConfigForGame = (gameId: string): GameConfig => {
    // Robust normalization: lower case, remove all non-alphanumeric characters
    const normalizedId = gameId.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Check for exact match first
    if (LEADERBOARD_CONFIG[normalizedId]) return LEADERBOARD_CONFIG[normalizedId];

    // Check if normalized ID contains the key or vice-versa
    const key = Object.keys(LEADERBOARD_CONFIG).find(k =>
        normalizedId.includes(k) || k.includes(normalizedId)
    );

    if (key) return LEADERBOARD_CONFIG[key];

    // Special aliases fallback
    if (normalizedId.includes('football') && !normalizedId.includes('manager')) return LEADERBOARD_CONFIG['efootball'];

    return DEFAULT_CONFIG;
}


// --- Mock Data Generator ---

// Mock Generator Removed



export default function LeaderboardPage() {
    const [games, setGames] = useState<Game[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedGame, setSelectedGame] = useState<Game | null>(null)
    const [selectedFormat, setSelectedFormat] = useState<string>('')
    const [leaderboardData, setLeaderboardData] = useState<any[]>([])
    const [expandedRows, setExpandedRows] = useState<number[]>([])
    const [currentConfig, setCurrentConfig] = useState<GameConfig>(DEFAULT_CONFIG)

    useEffect(() => {
        fetchGames()
    }, [])

    useEffect(() => {
        if (selectedGame) {
            const config = getConfigForGame(selectedGame.name);
            setCurrentConfig(config);

            // Set default format if current selection is invalid for this game
            if (!config.formats.includes(selectedFormat)) {
                setSelectedFormat(config.formats[0]);
            }
        }
    }, [selectedGame])

    useEffect(() => {
        if (selectedGame && selectedFormat) {
            const fetchLeaderboard = async () => {
                try {
                    // Fetch teams for this game
                    const { collection, query, where, getDocs, orderBy, limit } = await import('firebase/firestore')
                    const { db } = await import('@/lib/firebase')

                    // Simple query: get teams for this game, sort by wins (since we don't have points yet, or calc points)
                    // Currently we only track wins/loss. 
                    const q = query(
                        collection(db, 'teams'),
                        where('game', '==', selectedGame.name.toUpperCase()), // Ensure Case matches model
                        orderBy('stats.wins', 'desc'),
                        limit(50)
                    )

                    const snapshot = await getDocs(q)
                    const data = snapshot.docs.map((doc, index) => {
                        const team = doc.data()
                        return {
                            id: doc.id,
                            rank: index + 1,
                            name: team.name,
                            isTeam: true,
                            matches: team.stats?.matchesPlayed || 0,
                            wins: team.stats?.wins || 0,
                            losses: team.stats?.losses || 0,
                            points: (team.stats?.wins || 0) * 3, // Simple points logic
                            members: team.members || []
                        }
                    })

                    setLeaderboardData(data)
                    setExpandedRows([])
                } catch (error) {
                    console.error("Error fetching leaderboard", error)
                }
            }
            fetchLeaderboard()
        }
    }, [selectedGame, selectedFormat])

    const fetchGames = async () => {
        try {
            const activeGames = await getActiveGames()
            setGames(activeGames)
            if (activeGames.length > 0) {
                const firstGame = activeGames[0];
                setSelectedGame(firstGame);
                const config = getConfigForGame(firstGame.name);
                setSelectedFormat(config.formats[0]);
            }
            setLoading(false)
        } catch (error) {
            console.error('Failed to fetch games', error)
            setLoading(false)
        }
    }

    const toggleRow = (id: number) => {
        setExpandedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-t-2 border-violet-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-violet-500 to-violet-200 bg-clip-text text-transparent mb-4">
                        GLOBAL LEADERBOARD
                    </h1>
                    <p className="text-gray-400 text-lg">Top performers across all games and formats</p>
                </div>

                {/* Game Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    {games.map((game) => (
                        <button
                            key={game.id}
                            onClick={() => setSelectedGame(game)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${selectedGame?.id === game.id
                                ? 'bg-violet-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.5)] scale-105'
                                : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800 hover:text-white'
                                }`}
                        >
                            <span className="uppercase">{game.displayName}</span>
                        </button>
                    ))}
                </div>

                {/* Format Sub-tabs */}
                {currentConfig.formats.length > 0 && (
                    <div className="flex justify-center gap-2 mb-12 bg-zinc-900/50 p-2 rounded-lg w-fit mx-auto border border-zinc-800">
                        {currentConfig.formats.map((format) => (
                            <button
                                key={format}
                                onClick={() => setSelectedFormat(format)}
                                className={`px-6 py-2 rounded-lg font-medium transition-all ${selectedFormat === format
                                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {format}
                            </button>
                        ))}
                    </div>
                )}

                {/* Leaderboard Table */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                    {/* Top 3 Highlight */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 border-b border-zinc-800 bg-gradient-to-b from-violet-900/10 to-transparent">
                        {leaderboardData.slice(0, 3).map((item) => (
                            <div key={item.id} className={`relative p-6 rounded-xl border ${item.rank === 1 ? 'bg-yellow-500/10 border-yellow-500/30 order-first md:order-2 scale-105' :
                                item.rank === 2 ? 'bg-gray-400/10 border-gray-400/30 order-2 md:order-1' :
                                    'bg-orange-700/10 border-orange-700/30 order-3'
                                } flex flex-col items-center text-center`}>
                                <div className="absolute -top-4">
                                    {item.rank === 1 && <Crown className="w-8 h-8 text-yellow-500 fill-yellow-500 animate-bounce" />}
                                    {item.rank === 2 && <Medal className="w-8 h-8 text-gray-400" />}
                                    {item.rank === 3 && <Medal className="w-8 h-8 text-orange-700" />}
                                </div>
                                <div className="w-16 h-16 rounded-full bg-zinc-800 mb-3 flex items-center justify-center text-xl font-bold border-2 border-dashed border-gray-700">
                                    {item.name.charAt(0)}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
                                <p className="text-violet-400 font-mono text-2xl font-bold">{item.points} PTS</p>
                            </div>
                        ))}
                    </div>

                    {/* Full List */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-zinc-900/80 text-gray-400 text-sm uppercase tracking-wider">
                                    <th className="py-4 px-6 text-left w-24">Rank</th>
                                    <th className="py-4 px-6 text-left">Team/Player Name</th>
                                    {currentConfig.columns.map(col => (
                                        <th key={col.key} className={`py-4 px-6 text-${col.align || 'center'}`}>
                                            {col.label}
                                        </th>
                                    ))}
                                    <th className="py-4 px-6 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {leaderboardData.slice(3).map((item) => (
                                    <>
                                        <motion.tr
                                            key={item.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            onClick={() => item.isTeam && item.rank > 3 && toggleRow(item.id)}
                                            className={`transition-colors group ${item.isTeam && item.rank > 3 ? 'cursor-pointer hover:bg-zinc-800/50' : 'hover:bg-zinc-800/20'
                                                } ${expandedRows.includes(item.id) ? 'bg-zinc-800/40' : ''}`}
                                        >
                                            <td className="py-4 px-6">
                                                <span className="font-mono font-bold text-gray-500 text-lg">#{item.rank}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold ring-1 ring-zinc-700 group-hover:ring-violet-500 transition-all">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                    <span className="font-semibold text-white group-hover:text-violet-300 transition-colors">{item.name}</span>
                                                </div>
                                            </td>

                                            {/* Dynamic Columns Rendering */}
                                            {currentConfig.columns.map(col => (
                                                <td key={col.key} className={`py-4 px-6 text-${col.align || 'center'} ${col.key === 'points' ? 'font-bold text-violet-400 font-mono' : 'text-gray-400'}`}>
                                                    {item[col.key] !== undefined ? item[col.key] : '-'}
                                                </td>
                                            ))}

                                            <td className="py-4 px-6 text-center text-gray-500">
                                                {item.isTeam && item.rank > 3 && (
                                                    expandedRows.includes(item.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                                )}
                                            </td>
                                        </motion.tr>

                                        {/* EXPANDED ROW DETAILS */}
                                        <AnimatePresence>
                                            {item.isTeam && expandedRows.includes(item.id) && (
                                                <motion.tr
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="bg-zinc-900/30 overflow-hidden"
                                                >
                                                    <td colSpan={currentConfig.columns.length + 3} className="p-0">
                                                        <div className="p-6 border-b border-zinc-800/50">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                                                {item.members.map((member: any, idx: number) => (
                                                                    <div key={idx} className="bg-black/40 rounded-lg p-3 border border-zinc-800 flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                                                            <User size={18} className="text-gray-400" />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <p className="font-semibold text-sm text-white mb-1">{member.displayName || member.name}</p>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-gray-300 border border-zinc-700">{member.role}</span>
                                                                                {currentConfig.memberColumns.map(col => (
                                                                                    <span key={col.key} className="flex items-center gap-1 text-xs text-gray-400 bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/50">
                                                                                        <col.icon size={10} className="text-violet-400" />
                                                                                        <span className="font-mono">{member[col.key]}</span>
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    )
}
