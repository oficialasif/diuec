import { db } from './firebase'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { JoinRequest, Team } from './models'

// Get join requests for a specific team (for captains)
export async function getJoinRequestsByTeam(teamId: string): Promise<JoinRequest[]> {
    try {
        console.log('Fetching join requests for team:', teamId)
        const q = query(
            collection(db, 'join_requests'),
            where('teamId', '==', teamId),
            where('status', '==', 'pending')
        )
        const snapshot = await getDocs(q)
        console.log('Found join requests:', snapshot.size)
        const requests = snapshot.docs.map(doc => {
            console.log('Join request data:', doc.data())
            return doc.data() as JoinRequest
        })
        return requests
    } catch (error) {
        console.error('Error getting join requests:', error)
        return []
    }
}

// Get teams where user is a member
export async function getTeamsByUser(userId: string): Promise<Team[]> {
    try {
        const q = query(
            collection(db, 'teams'),
            where('memberIds', 'array-contains', userId)
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Team))
    } catch (error) {
        console.error('Error getting user teams:', error)
        return []
    }
}

// Get recent team activity
export async function getRecentTeamActivity(teamId: string, activityLimit: number = 10) {
    try {
        // Get recent join requests
        const joinRequestsQuery = query(
            collection(db, 'join_requests'),
            where('teamId', '==', teamId),
            limit(activityLimit * 2) // Get more to filter and sort client-side
        )
        const joinRequests = await getDocs(joinRequestsQuery)

        const activities = joinRequests.docs.map(doc => {
            const data = doc.data()
            return {
                type: 'join_request',
                message: `${data.userDisplayName} requested to join`,
                time: data.createdAt,
                status: data.status
            }
        })

        // Sort by time descending (newest first) and limit
        return activities
            .sort((a, b) => {
                const aTime = a.time?.seconds || 0
                const bTime = b.time?.seconds || 0
                return bTime - aTime
            })
            .slice(0, activityLimit)
    } catch (error) {
        console.error('Error getting team activity:', error)
        return []
    }
}
