// Match Status Types
export type MatchStatus = 'scheduled' | 'played' | 'submitted' | 'confirmed' | 'disputed' | 'approved' | 'rejected'
export type GameType = 'PUBG' | 'Valorant' | 'MLBB' | 'CS2' | 'Free Fire' | 'EFOOTBALL' | 'FIFA'
export type MatchWinner = 'teamA' | 'teamB' | 'draw'

// Player Match Statistics
export interface PlayerMatchStats {
    userId: string
    displayName: string
    photoURL: string

    // Common stats across all games
    kills: number
    deaths: number
    assists: number

    // Game-specific stats (optional)
    damage?: number // PUBG, Valorant
    survivalTime?: number // PUBG (minutes)
    headshots?: number // Valorant
    acs?: number // Valorant (Average Combat Score)
    gold?: number // MLBB
    role?: string // MLBB (Tank, Mage, Marksman, etc.)

    isMVP: boolean
}

// Team Match Statistics
export interface TeamMatchStats {
    teamId: string
    teamName: string
    placement: number // 1st, 2nd, 3rd, etc.
    totalPoints: number
    placementPoints: number
    killPoints: number
    players: PlayerMatchStats[]
}

// Edit History Entry
export interface EditHistoryEntry {
    editedBy: string
    editedByName: string
    editedAt: Date
    changes: Record<string, any>
    reason?: string
}

// Match Result
export interface MatchResult {
    winner: MatchWinner

    // Submissions & Approvals
    submittedBy: string // Captain user ID
    submittedByName: string
    submittedAt: Date

    confirmedBy?: string // Opponent captain ID
    confirmedByName?: string
    confirmedAt?: Date

    approvedBy?: string // Admin ID
    approvedByName?: string
    approvedAt?: Date

    // Proof (Required)
    proofUrl: string // Screenshot/video URL

    // Team Stats
    teamAStats: TeamMatchStats
    teamBStats: TeamMatchStats

    // Dispute Handling
    disputed: boolean
    disputeReason?: string
    disputedBy?: string
    disputedByName?: string
    disputedAt?: Date

    // Admin Review
    adminNotes?: string
    rejectionReason?: string

    // Audit Trail
    editHistory: EditHistoryEntry[]
}

// Enhanced Match Model
export interface MatchDetailed {
    id: string
    tournamentId: string
    tournamentName: string
    matchNumber: number

    // Teams
    teamA: {
        id: string
        name: string
        logo: string
        captainId: string
        captainName: string
    }
    teamB: {
        id: string
        name: string
        logo: string
        captainId: string
        captainName: string
    }

    // Match Details
    game: GameType
    scheduledAt: Date
    playedAt?: Date

    // Status
    status: MatchStatus

    // Results (populated after submission)
    result?: MatchResult

    // Audit
    createdBy: string
    createdAt: Date
    updatedAt: Date

    // E-Football / Two-Leg support
    leg?: 1 | 2
    aggregateId?: string
    isAggregate?: boolean
}

// Player Aggregate Statistics (per game)
export interface PlayerStats {
    userId: string
    game: GameType

    // Match Record
    matchesPlayed: number
    wins: number
    losses: number
    draws: number

    // Performance Stats
    totalKills: number
    totalDeaths: number
    totalAssists: number
    totalDamage: number
    totalPoints: number
    mvpCount: number

    // Game-specific aggregates
    totalHeadshots?: number // Valorant
    totalGold?: number // MLBB
    totalSurvivalTime?: number // PUBG

    // Calculated Metrics
    kdRatio: number // kills / deaths
    averageKills: number // totalKills / matchesPlayed
    averageDamage: number
    winRate: number // (wins / matchesPlayed) * 100

    // Last Updated
    updatedAt: Date
}

// Team Aggregate Statistics (per game)
export interface TeamStatsDetailed {
    teamId: string
    teamName: string
    game: GameType

    // Match Record
    matchesPlayed: number
    wins: number
    losses: number
    draws: number

    // Points
    totalPoints: number
    averagePoints: number
    highestPoints: number

    // Tournament Performance
    tournamentPlacements: {
        tournamentId: string
        tournamentName: string
        placement: number
        points: number
        completedAt: Date
    }[]

    // Calculated
    winRate: number // (wins / matchesPlayed) * 100

    // E-Football Stats
    totalGoalsFor?: number
    totalGoalsAgainst?: number
    goalDifference?: number

    // Rankings
    currentRank?: number

    // Last Updated
    updatedAt: Date
}

// Point Calculation Schema
export interface PointSchema {
    game: GameType

    // Placement Points (1st place, 2nd place, etc.)
    placements: {
        [key: number]: number
    }

    // Kill Points
    killPoint: number

    // Bonus Points
    bonuses?: {
        matchWin?: number
        ace?: number // All enemies eliminated by one player
        mvp?: number
    }
}

// Leaderboard Entry
export interface LeaderboardEntry {
    rank: number
    teamId: string
    teamName: string
    teamLogo: string

    matchesPlayed: number
    wins: number
    losses: number
    draws: number

    totalPoints: number
    averagePoints: number

    winRate: number

    // E-Football Stats
    goalsFor?: number
    goalsAgainst?: number
    goalDiff?: number

    // Head-to-head (for tie-breaking)
    headToHead?: {
        [opponentTeamId: string]: {
            wins: number
            losses: number
        }
    }
}

// Match Audit Log
export interface MatchAuditLog {
    id: string
    matchId: string
    tournamentId: string

    action: 'created' | 'submitted' | 'confirmed' | 'disputed' | 'approved' | 'rejected' | 'edited'

    performedBy: string
    performedByName: string
    performedAt: Date

    details: {
        previousStatus?: MatchStatus
        newStatus?: MatchStatus
        changes?: Record<string, any>
        reason?: string
        notes?: string
    }
}
