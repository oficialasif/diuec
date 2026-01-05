import { db } from '@/lib/firebase'
import { collection, query, orderBy, limit, getDocs, addDoc, Timestamp } from 'firebase/firestore'

export interface Activity {
    id: string
    type: 'user_registered' | 'team_created' | 'team_joined' | 'tournament_created'
    userId: string
    userName: string
    userPhoto?: string
    teamName?: string
    tournamentName?: string
    timestamp: Date
    message: string
}

// Log a new activity
export async function logActivity(activity: Omit<Activity, 'id' | 'timestamp'>) {
    try {
        await addDoc(collection(db, 'activities'), {
            ...activity,
            timestamp: Timestamp.now()
        })
    } catch (error) {
        console.error('Error logging activity:', error)
    }
}

// Get recent activities
export async function getRecentActivities(limitCount: number = 20): Promise<Activity[]> {
    try {
        const q = query(
            collection(db, 'activities'),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        )

        const snapshot = await getDocs(q)

        return snapshot.docs.map(doc => {
            const data = doc.data()
            return {
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate() || new Date()
            } as Activity
        })
    } catch (error) {
        console.error('Error fetching activities:', error)
        return []
    }
}

// Format timestamp to relative time
export function formatRelativeTime(date: Date): string {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
        return 'Just now'
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400)
        return `${days} day${days > 1 ? 's' : ''} ago`
    } else {
        return date.toLocaleDateString()
    }
}

// Get activity icon and color based on type
export function getActivityStyle(type: Activity['type']): { icon: string; color: string } {
    switch (type) {
        case 'user_registered':
            return { icon: '👤', color: 'text-blue-400' }
        case 'team_created':
            return { icon: '🛡️', color: 'text-green-400' }
        case 'team_joined':
            return { icon: '👥', color: 'text-violet-400' }
        case 'tournament_created':
            return { icon: '🏆', color: 'text-yellow-400' }
        default:
            return { icon: '📢', color: 'text-gray-400' }
    }
}
