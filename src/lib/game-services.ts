import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Game {
    id: string
    name: string // Unique identifier (uppercase, e.g., "VALORANT")
    displayName: string // Human-readable name (e.g., "Valorant")
    icon?: string // Optional icon URL
    description?: string
    isActive: boolean
    createdAt: Timestamp
    updatedAt: Timestamp
}

export interface GameInput {
    name: string
    displayName: string
    icon?: string
    description?: string
    isActive?: boolean
}

// Get all games
export async function getAllGames(): Promise<Game[]> {
    try {
        const q = query(collection(db, 'games'), orderBy('displayName', 'asc'))
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Game))
    } catch (error) {
        console.error('Error getting games:', error)
        throw error
    }
}

// Get only active games
export async function getActiveGames(): Promise<Game[]> {
    try {
        const q = query(
            collection(db, 'games'),
            where('isActive', '==', true)
        )
        const snapshot = await getDocs(q)
        const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Game))

        // Sort client-side to avoid Firestore index requirement
        return games.sort((a, b) => a.displayName.localeCompare(b.displayName))
    } catch (error) {
        console.error('Error getting active games:', error)
        throw error
    }
}

// Create a new game
export async function createGame(gameData: GameInput): Promise<string> {
    try {
        const gameRef = doc(collection(db, 'games'))
        const game: Omit<Game, 'id'> = {
            name: gameData.name.toUpperCase(),
            displayName: gameData.displayName,
            icon: gameData.icon || '',
            description: gameData.description || '',
            isActive: gameData.isActive !== undefined ? gameData.isActive : true,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        }

        await setDoc(gameRef, game)
        return gameRef.id
    } catch (error) {
        console.error('Error creating game:', error)
        throw error
    }
}

// Update a game
export async function updateGame(gameId: string, gameData: Partial<GameInput>): Promise<void> {
    try {
        const gameRef = doc(db, 'games', gameId)
        const updateData: any = {
            ...gameData,
            updatedAt: Timestamp.now()
        }

        if (gameData.name) {
            updateData.name = gameData.name.toUpperCase()
        }

        await updateDoc(gameRef, updateData)
    } catch (error) {
        console.error('Error updating game:', error)
        throw error
    }
}

// Delete a game
export async function deleteGame(gameId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, 'games', gameId))
    } catch (error) {
        console.error('Error deleting game:', error)
        throw error
    }
}

// Seed initial games (one-time use)
export async function seedInitialGames(): Promise<void> {
    const initialGames: GameInput[] = [
        {
            name: 'PUBG',
            displayName: 'PUBG Mobile',
            description: 'Battle Royale mobile game',
            isActive: true
        },
        {
            name: 'FREE_FIRE',
            displayName: 'Free Fire',
            description: 'Survival shooter game',
            isActive: true
        },
        {
            name: 'VALORANT',
            displayName: 'Valorant',
            description: 'Tactical FPS game',
            isActive: true
        },
        {
            name: 'CS2',
            displayName: 'Counter-Strike 2',
            description: 'Competitive FPS game',
            isActive: true
        },
        {
            name: 'EFOOTBALL',
            displayName: 'eFootball',
            description: 'Football simulation game',
            isActive: true
        },
        {
            name: 'MLBB',
            displayName: 'Mobile Legends: Bang Bang',
            description: 'MOBA mobile game',
            isActive: true
        }
    ]

    try {
        for (const game of initialGames) {
            await createGame(game)
        }
        console.log('Initial games seeded successfully')
    } catch (error) {
        console.error('Error seeding games:', error)
        throw error
    }
}
