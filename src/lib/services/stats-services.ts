import { db } from '@/lib/firebase'
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    query,
    where,
    getDocs,
    orderBy,
    increment
} from 'firebase/firestore'
import {
    PlayerStats,
    TeamStatsDetailed,
    PlayerMatchStats,
    GameType,
    LeaderboardEntry
} from '@/lib/models/match-stats'
import { calculateKD, calculateAverage, calculateWinRate } from '@/lib/point-schemas'

// Update player aggregate stats after match approval
export async function updatePlayerStats(
    userId: string,
    game: GameType,
    matchStats: PlayerMatchStats,
    didWin: boolean,
    points: number
): Promise<void> {
    try {
        const statsId = `${userId}_${game}`
        const statsRef = doc(db, 'player_stats', statsId)
        const statsDoc = await getDoc(statsRef)

        if (!statsDoc.exists()) {
            // Create new player stats
            const newStats: PlayerStats = {
                userId,
                game,
                matchesPlayed: 1,
                wins: didWin ? 1 : 0,
                losses: didWin ? 0 : 1,
                draws: 0,
                totalKills: matchStats.kills,
                totalDeaths: matchStats.deaths,
                totalAssists: matchStats.assists,
                totalDamage: matchStats.damage || 0,
                totalPoints: points,
                mvpCount: matchStats.isMVP ? 1 : 0,
                totalHeadshots: matchStats.headshots || 0,
                totalGold: matchStats.gold || 0,
                totalSurvivalTime: matchStats.survivalTime || 0,
                kdRatio: calculateKD(matchStats.kills, matchStats.deaths),
                averageKills: matchStats.kills,
                averageDamage: matchStats.damage || 0,
                winRate: didWin ? 100 : 0,
                updatedAt: new Date()
            }

            await setDoc(statsRef, newStats)
        } else {
            // Update existing stats
            const currentStats = statsDoc.data() as PlayerStats
            const newMatchCount = currentStats.matchesPlayed + 1
            const newWins = currentStats.wins + (didWin ? 1 : 0)
            const newLosses = currentStats.losses + (didWin ? 0 : 1)
            const newKills = currentStats.totalKills + matchStats.kills
            const newDeaths = currentStats.totalDeaths + matchStats.deaths
            const newAssists = currentStats.totalAssists + matchStats.assists
            const newDamage = currentStats.totalDamage + (matchStats.damage || 0)
            const newPoints = currentStats.totalPoints + points

            await updateDoc(statsRef, {
                matchesPlayed: newMatchCount,
                wins: newWins,
                losses: newLosses,
                totalKills: newKills,
                totalDeaths: newDeaths,
                totalAssists: newAssists,
                totalDamage: newDamage,
                totalPoints: newPoints,
                mvpCount: increment(matchStats.isMVP ? 1 : 0),
                totalHeadshots: increment(matchStats.headshots || 0),
                totalGold: increment(matchStats.gold || 0),
                totalSurvivalTime: increment(matchStats.survivalTime || 0),
                kdRatio: calculateKD(newKills, newDeaths),
                averageKills: calculateAverage(newKills, newMatchCount),
                averageDamage: calculateAverage(newDamage, newMatchCount),
                winRate: calculateWinRate(newWins, newMatchCount),
                updatedAt: new Date()
            })
        }
    } catch (error) {
        console.error('Error updating player stats:', error)
        throw error
    }
}

// Update team aggregate stats after match approval
export async function updateTeamStats(
    teamId: string,
    teamName: string,
    game: GameType,
    matchPoints: number,
    didWin: boolean,
    didDraw: boolean = false,
    tournamentId?: string,
    tournamentName?: string,
    tournamentPlacement?: number
): Promise<void> {
    try {
        const statsId = `${teamId}_${game}`
        const statsRef = doc(db, 'team_stats', statsId)
        const statsDoc = await getDoc(statsRef)

        if (!statsDoc.exists()) {
            // Create new team stats
            const newStats: TeamStatsDetailed = {
                teamId,
                teamName,
                game,
                matchesPlayed: 1,
                wins: didWin ? 1 : 0,
                losses: didWin || didDraw ? 0 : 1,
                draws: didDraw ? 1 : 0,
                totalPoints: matchPoints,
                averagePoints: matchPoints,
                highestPoints: matchPoints,
                tournamentPlacements: tournamentId && tournamentName && tournamentPlacement ? [{
                    tournamentId,
                    tournamentName,
                    placement: tournamentPlacement,
                    points: matchPoints,
                    completedAt: new Date()
                }] : [],
                winRate: didWin ? 100 : 0,
                updatedAt: new Date()
            }

            await setDoc(statsRef, newStats)
        } else {
            // Update existing stats
            const currentStats = statsDoc.data() as TeamStatsDetailed
            const newMatchCount = currentStats.matchesPlayed + 1
            const newWins = currentStats.wins + (didWin ? 1 : 0)
            const newLosses = currentStats.losses + (didWin || didDraw ? 0 : 1)
            const newDraws = currentStats.draws + (didDraw ? 1 : 0)
            const newTotalPoints = currentStats.totalPoints + matchPoints
            const newAveragePoints = calculateAverage(newTotalPoints, newMatchCount)
            const newHighestPoints = Math.max(currentStats.highestPoints, matchPoints)

            const updates: any = {
                matchesPlayed: newMatchCount,
                wins: newWins,
                losses: newLosses,
                draws: newDraws,
                totalPoints: newTotalPoints,
                averagePoints: newAveragePoints,
                highestPoints: newHighestPoints,
                winRate: calculateWinRate(newWins, newMatchCount),
                updatedAt: new Date()
            }

            // Add tournament placement if provided
            if (tournamentId && tournamentName && tournamentPlacement) {
                const newPlacement = {
                    tournamentId,
                    tournamentName,
                    placement: tournamentPlacement,
                    points: matchPoints,
                    completedAt: new Date()
                }
                updates.tournamentPlacements = [...(currentStats.tournamentPlacements || []), newPlacement]
            }

            await updateDoc(statsRef, updates)
        }
    } catch (error) {
        console.error('Error updating team stats:', error)
        throw error
    }
}

// Get player stats
export async function getPlayerStats(userId: string, game: GameType): Promise<PlayerStats | null> {
    try {
        const statsId = `${userId}_${game}`
        const statsDoc = await getDoc(doc(db, 'player_stats', statsId))
        if (!statsDoc.exists()) return null
        return statsDoc.data() as PlayerStats
    } catch (error) {
        console.error('Error getting player stats:', error)
        throw error
    }
}

// Get all player stats for a user (across all games)
export async function getAllPlayerStats(userId: string): Promise<PlayerStats[]> {
    try {
        const q = query(
            collection(db, 'player_stats'),
            where('userId', '==', userId)
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => doc.data() as PlayerStats)
    } catch (error) {
        console.error('Error getting all player stats:', error)
        throw error
    }
}

// Get team stats
export async function getTeamStats(teamId: string, game: GameType): Promise<TeamStatsDetailed | null> {
    try {
        const statsId = `${teamId}_${game}`
        const statsDoc = await getDoc(doc(db, 'team_stats', statsId))
        if (!statsDoc.exists()) return null
        return statsDoc.data() as TeamStatsDetailed
    } catch (error) {
        console.error('Error getting team stats:', error)
        throw error
    }
}

// Calculate tournament leaderboard
export async function calculateTournamentLeaderboard(
    tournamentId: string,
    game: GameType
): Promise<LeaderboardEntry[]> {
    try {
        // Get all team stats for this game
        const q = query(
            collection(db, 'team_stats'),
            where('game', '==', game)
        )
        const snapshot = await getDocs(q)

        // Filter teams that participated in this tournament
        // and calculate their ranking
        const teams: LeaderboardEntry[] = []

        for (const docSnapshot of snapshot.docs) {
            const teamStats = docSnapshot.data() as TeamStatsDetailed

            // Check if team participated in this tournament
            const tournamentData = teamStats.tournamentPlacements?.find(
                tp => tp.tournamentId === tournamentId
            )

            if (tournamentData) {
                const teamDoc = await getDoc(doc(db, 'teams', teamStats.teamId))
                const teamData = teamDoc.exists() ? teamDoc.data() : null

                teams.push({
                    rank: 0, // Will be calculated after sorting
                    teamId: teamStats.teamId,
                    teamName: teamStats.teamName,
                    teamLogo: teamData?.logo || '',
                    matchesPlayed: teamStats.matchesPlayed,
                    wins: teamStats.wins,
                    losses: teamStats.losses,
                    draws: teamStats.draws,
                    totalPoints: tournamentData.points,
                    averagePoints: teamStats.averagePoints,
                    winRate: teamStats.winRate
                })
            }
        }

        // Sort by total points (descending)
        teams.sort((a, b) => {
            if (b.totalPoints !== a.totalPoints) {
                return b.totalPoints - a.totalPoints
            }
            // Tie-breaker: wins
            if (b.wins !== a.wins) {
                return b.wins - a.wins
            }
            // Tie-breaker: win rate
            return b.winRate - a.winRate
        })

        // Assign ranks
        teams.forEach((team, index) => {
            team.rank = index + 1
        })

        return teams
    } catch (error) {
        console.error('Error calculating leaderboard:', error)
        throw error
    }
}

// Get global leaderboard for a game
export async function getGlobalLeaderboard(game: GameType, limit: number = 50): Promise<LeaderboardEntry[]> {
    try {
        const q = query(
            collection(db, 'team_stats'),
            where('game', '==', game),
            orderBy('totalPoints', 'desc')
        )
        const snapshot = await getDocs(q)

        const teams: LeaderboardEntry[] = []

        for (const docSnapshot of snapshot.docs) {
            const teamStats = docSnapshot.data() as TeamStatsDetailed
            const teamDoc = await getDoc(doc(db, 'teams', teamStats.teamId))
            const teamData = teamDoc.exists() ? teamDoc.data() : null

            teams.push({
                rank: 0,
                teamId: teamStats.teamId,
                teamName: teamStats.teamName,
                teamLogo: teamData?.logo || '',
                matchesPlayed: teamStats.matchesPlayed,
                wins: teamStats.wins,
                losses: teamStats.losses,
                draws: teamStats.draws,
                totalPoints: teamStats.totalPoints,
                averagePoints: teamStats.averagePoints,
                winRate: teamStats.winRate
            })

            if (teams.length >= limit) break
        }

        // Assign ranks
        teams.forEach((team, index) => {
            team.rank = index + 1
        })

        return teams
    } catch (error) {
        console.error('Error getting global leaderboard:', error)
        throw error
    }
}

// Update all stats after match approval (called from match approval)
export async function updateAllMatchStats(
    matchId: string,
    match: any // MatchDetailed type
): Promise<void> {
    try {
        if (!match.result) return

        const result = match.result
        const teamAWon = result.winner === 'teamA'
        const teamBWon = result.winner === 'teamB'
        const isDraw = result.winner === 'draw'

        // Update Team A stats
        await updateTeamStats(
            match.teamA.id,
            match.teamA.name,
            match.game,
            result.teamAStats.totalPoints,
            teamAWon,
            isDraw,
            match.tournamentId,
            match.tournamentName
        )

        // Update Team B stats
        await updateTeamStats(
            match.teamB.id,
            match.teamB.name,
            match.game,
            result.teamBStats.totalPoints,
            teamBWon,
            isDraw,
            match.tournamentId,
            match.tournamentName
        )

        // Update player stats for Team A
        for (const player of result.teamAStats.players) {
            await updatePlayerStats(
                player.userId,
                match.game,
                player,
                teamAWon,
                result.teamAStats.totalPoints / result.teamAStats.players.length
            )
        }

        // Update player stats for Team B
        for (const player of result.teamBStats.players) {
            await updatePlayerStats(
                player.userId,
                match.game,
                player,
                teamBWon,
                result.teamBStats.totalPoints / result.teamBStats.players.length
            )
        }
    } catch (error) {
        console.error('Error updating all match stats:', error)
        throw error
    }
}
