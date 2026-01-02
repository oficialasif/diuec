'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Target, TrendingUp, Award } from 'lucide-react'
import { getGlobalLeaderboard, calculateTournamentLeaderboard } from '@/lib/services/stats-services'
// ... (imports remain)

export default function Leaderboard({ game, tournamentId, limit = 20 }: LeaderboardProps) {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLeaderboard()
    }, [game, tournamentId])

    const fetchLeaderboard = async () => {
        setLoading(true)
        try {
            let data: LeaderboardEntry[] = []

            if (tournamentId) {
                // Fetch tournament-specific leaderboard
                data = await calculateTournamentLeaderboard(tournamentId, game)
            } else {
                // Fetch global leaderboard
                data = await getGlobalLeaderboard(game, limit)
            }

            setLeaderboard(data)
        } catch (error) {
            console.error('Error loading leaderboard:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card className="p-8 bg-zinc-900/50 border-violet-500/20">
                <div className="flex justify-center">
                    <div className="w-8 h-8 border-t-2 border-violet-500 rounded-full animate-spin" />
                </div>
            </Card>
        )
    }

    const getMedalColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-400'
        if (rank === 2) return 'text-gray-300'
        if (rank === 3) return 'text-orange-600'
        return 'text-gray-500'
    }

    return (
        <Card className="bg-zinc-900/50 border-violet-500/20 overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-violet-900/30 to-purple-900/30 border-b border-violet-500/20">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Trophy className="text-yellow-500" />
                    {game} Leaderboard
                </h2>
                <p className="text-gray-400 mt-1">Top teams ranked by total points</p>
            </div>

            {/* Leaderboard Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-black/30 border-b border-violet-500/10">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Rank</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Team</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Matches</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">W/L/D</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Points</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Avg</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Win Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((entry) => (
                            <tr
                                key={entry.teamId}
                                className="border-b border-zinc-800 hover:bg-violet-900/10 transition-colors"
                            >
                                {/* Rank */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {entry.rank <= 3 ? (
                                            <Trophy className={`w-6 h-6 ${getMedalColor(entry.rank)}`} />
                                        ) : (
                                            <span className="w-6 text-center font-bold text-gray-400">#{entry.rank}</span>
                                        )}
                                    </div>
                                </td>

                                {/* Team */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-800">
                                            <Image
                                                src={getValidImageUrl(entry.teamLogo, 'avatar')}
                                                alt={entry.teamName}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">{entry.teamName}</p>
                                            {entry.rank <= 3 && (
                                                <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">
                                                    Top {entry.rank}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Matches */}
                                <td className="px-6 py-4 text-center">
                                    <span className="font-medium text-gray-300">{entry.matchesPlayed}</span>
                                </td>

                                {/* W/L/D */}
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-2 text-sm">
                                        <span className="text-green-400">{entry.wins}</span>
                                        <span className="text-gray-500">/</span>
                                        <span className="text-red-400">{entry.losses}</span>
                                        <span className="text-gray-500">/</span>
                                        <span className="text-gray-400">{entry.draws}</span>
                                    </div>
                                </td>

                                {/* Total Points */}
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Target className="w-4 h-4 text-violet-400" />
                                        <span className="font-bold text-lg text-violet-300">{entry.totalPoints}</span>
                                    </div>
                                </td>

                                {/* Average Points */}
                                <td className="px-6 py-4 text-center">
                                    <span className="text-gray-400">{entry.averagePoints.toFixed(1)}</span>
                                </td>

                                {/* Win Rate */}
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <TrendingUp className={`w-4 h-4 ${entry.winRate >= 50 ? 'text-green-400' : 'text-gray-400'}`} />
                                        <span className={`font-semibold ${entry.winRate >= 50 ? 'text-green-400' : 'text-gray-400'}`}>
                                            {entry.winRate.toFixed(1)}%
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {leaderboard.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                    <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>No teams on the leaderboard yet</p>
                </div>
            )}
        </Card>
    )
}
