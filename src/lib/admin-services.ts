import { db } from './firebase'
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, limit as firestoreLimit, startAfter, DocumentSnapshot } from 'firebase/firestore'

// User Management
export async function getAllUsers(limitCount = 50, lastDoc?: DocumentSnapshot) {
    try {
        let q = query(
            collection(db, 'users'),
            orderBy('createdAt', 'desc'),
            firestoreLimit(limitCount)
        )

        if (lastDoc) {
            q = query(q, startAfter(lastDoc))
        }

        const snapshot = await getDocs(q)
        const users = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
        const lastVisible = snapshot.docs[snapshot.docs.length - 1]

        return { users, lastVisible }
    } catch (error) {
        console.error('Error getting users:', error)
        return { users: [], lastVisible: null }
    }
}

export async function updateUserRole(userId: string, role: 'user' | 'admin') {
    try {
        await updateDoc(doc(db, 'users', userId), { role })
    } catch (error) {
        console.error('Error updating user role:', error)
        throw error
    }
}

export async function deleteUser(userId: string) {
    try {
        await deleteDoc(doc(db, 'users', userId))
    } catch (error) {
        console.error('Error deleting user:', error)
        throw error
    }
}

// Tournament Management
export async function getAllTournamentsAdmin() {
    try {
        const snapshot = await getDocs(collection(db, 'tournaments'))
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
    } catch (error) {
        console.error('Error getting tournaments:', error)
        return []
    }
}

export async function deleteTournament(tournamentId: string) {
    try {
        await deleteDoc(doc(db, 'tournaments', tournamentId))
    } catch (error) {
        console.error('Error deleting tournament:', error)
        throw error
    }
}

// Content Management
export async function getReportedContent() {
    try {
        const q = query(
            collection(db, 'reported_posts'),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc')
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
    } catch (error) {
        console.error('Error getting reported content:', error)
        return []
    }
}

export async function moderateContent(reportId: string, action: 'approve' | 'remove') {
    try {
        await updateDoc(doc(db, 'reported_posts', reportId), {
            status: action === 'approve' ? 'approved' : 'removed',
            moderatedAt: new Date()
        })
    } catch (error) {
        console.error('Error moderating content:', error)
        throw error
    }
}

// Team Management
export async function getAllTeamsAdmin() {
    try {
        const snapshot = await getDocs(collection(db, 'teams'))
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
    } catch (error) {
        console.error('Error getting teams:', error)
        return []
    }
}

export async function getAllJoinRequests() {
    try {
        const q = query(
            collection(db, 'join_requests'),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc')
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
    } catch (error) {
        console.error('Error getting join requests:', error)
        return []
    }
}

// Statistics
export async function getAdminStats() {
    try {
        const [users, tournaments, teams, posts] = await Promise.all([
            getDocs(collection(db, 'users')),
            getDocs(collection(db, 'tournaments')),
            getDocs(collection(db, 'teams')),
            getDocs(collection(db, 'posts'))
        ])

        return {
            totalUsers: users.size,
            totalTournaments: tournaments.size,
            totalTeams: teams.size,
            totalPosts: posts.size
        }
    } catch (error) {
        console.error('Error getting admin stats:', error)
        return {
            totalUsers: 0,
            totalTournaments: 0,
            totalTeams: 0,
            totalPosts: 0
        }
    }
}
