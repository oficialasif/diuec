// Seed some sample activities for testing
// Run this once to populate the activities collection

import { db } from '@/lib/firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'

export async function seedSampleActivities() {
    const activities = [
        {
            type: 'user_registered',
            userId: 'user1',
            userName: 'John Doe',
            userPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
            message: 'registered as a new user',
            timestamp: Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 1000)) // 5 minutes ago
        },
        {
            type: 'team_created',
            userId: 'user2',
            userName: 'Sarah Smith',
            userPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            teamName: 'Phoenix Squad',
            message: 'created team Phoenix Squad',
            timestamp: Timestamp.fromDate(new Date(Date.now() - 15 * 60 * 1000)) // 15 minutes ago
        },
        {
            type: 'team_joined',
            userId: 'user3',
            userName: 'Mike Johnson',
            userPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
            teamName: 'Phoenix Squad',
            message: 'joined team Phoenix Squad',
            timestamp: Timestamp.fromDate(new Date(Date.now() - 30 * 60 * 1000)) // 30 minutes ago
        },
        {
            type: 'tournament_created',
            userId: 'user4',
            userName: 'Admin User',
            userPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
            tournamentName: 'VALORANT Championship 2026',
            message: 'created tournament VALORANT Championship 2026',
            timestamp: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)) // 2 hours ago
        },
        {
            type: 'user_registered',
            userId: 'user5',
            userName: 'Emma Wilson',
            userPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
            message: 'registered as a new user',
            timestamp: Timestamp.fromDate(new Date(Date.now() - 3 * 60 * 60 * 1000)) // 3 hours ago
        },
        {
            type: 'team_created',
            userId: 'user6',
            userName: 'David Lee',
            userPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
            teamName: 'Dragon Warriors',
            message: 'created team Dragon Warriors',
            timestamp: Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 60 * 1000)) // 5 hours ago
        }
    ]

    try {
        for (const activity of activities) {
            await addDoc(collection(db, 'activities'), activity)
        }
        console.log('✅ Sample activities seeded successfully!')
        return true
    } catch (error) {
        console.error('❌ Error seeding activities:', error)
        return false
    }
}
