import { GameType, PointSchema } from './models/match-stats'

// PUBG Point System
export const PUBG_POINTS: PointSchema = {
    game: 'PUBG',
    placements: {
        1: 15,  // Winner Winner Chicken Dinner
        2: 10,  // 2nd Place
        3: 8,   // 3rd Place
        4: 6,   // 4th Place
        5: 4,   // 5th Place
        6: 3,   // 6th Place
        7: 2,   // 7th Place
        8: 1,   // 8th Place
        9: 0,   // 9th-10th
        10: 0,
    },
    killPoint: 1, // 1 point per kill
    bonuses: {
        matchWin: 10,
        mvp: 5
    }
}

// Valorant Point System
export const VALORANT_POINTS: PointSchema = {
    game: 'Valorant',
    placements: {
        1: 20,  // Winner
        2: 10,  // Runner-up
    },
    killPoint: 0.5, // 0.5 points per kill
    bonuses: {
        matchWin: 15,
        ace: 5,
        mvp: 3
    }
}

// Mobile Legends: Bang Bang Point System
export const MLBB_POINTS: PointSchema = {
    game: 'MLBB',
    placements: {
        1: 20,  // Winner
        2: 10,  // Runner-up
    },
    killPoint: 0.5, // 0.5 points per kill
    bonuses: {
        matchWin: 15,
        mvp: 5
    }
}

// CS2 Point System
export const CS2_POINTS: PointSchema = {
    game: 'CS2',
    placements: {
        1: 20,  // Winner
        2: 10,  // Runner-up
    },
    killPoint: 0.5,
    bonuses: {
        matchWin: 15,
        ace: 5,
        mvp: 3
    }
}

// Free Fire Point System
export const FREE_FIRE_POINTS: PointSchema = {
    game: 'Free Fire',
    placements: {
        1: 15,
        2: 10,
        3: 8,
        4: 6,
        5: 4,
        6: 3,
        7: 2,
        8: 1,
        9: 0,
        10: 0,
    },
    killPoint: 1,
    bonuses: {
        matchWin: 10,
        mvp: 5
    }
}

// Get point schema by game type
export function getPointSchema(game: GameType): PointSchema {
    switch (game) {
        case 'PUBG':
            return PUBG_POINTS
        case 'Valorant':
            return VALORANT_POINTS
        case 'MLBB':
            return MLBB_POINTS
        case 'CS2':
            return CS2_POINTS
        case 'Free Fire':
            return FREE_FIRE_POINTS
        default:
            return PUBG_POINTS // Default fallback
    }
}

// Calculate team points based on game type
export function calculateTeamPoints(
    game: GameType,
    placement: number,
    totalKills: number,
    isWinner: boolean = false
): { placementPoints: number; killPoints: number; bonusPoints: number; totalPoints: number } {
    const schema = getPointSchema(game)

    const placementPoints = schema.placements[placement] || 0
    const killPoints = totalKills * schema.killPoint

    let bonusPoints = 0
    if (isWinner && schema.bonuses?.matchWin) {
        bonusPoints += schema.bonuses.matchWin
    }

    const totalPoints = placementPoints + killPoints + bonusPoints

    return {
        placementPoints,
        killPoints,
        bonusPoints,
        totalPoints
    }
}

// Calculate player K/D ratio
export function calculateKD(kills: number, deaths: number): number {
    if (deaths === 0) return kills
    return Math.round((kills / deaths) * 100) / 100 // Round to 2 decimal places
}

// Calculate average
export function calculateAverage(total: number, count: number): number {
    if (count === 0) return 0
    return Math.round((total / count) * 100) / 100
}

// Calculate win rate
export function calculateWinRate(wins: number, totalMatches: number): number {
    if (totalMatches === 0) return 0
    return Math.round((wins / totalMatches) * 10000) / 100 // Percentage with 2 decimals
}
