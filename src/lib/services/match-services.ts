import { db } from '@/lib/firebase'
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
    addDoc
} from 'firebase/firestore'
import {
    MatchDetailed,
    MatchResult,
    MatchStatus,
    GameType,
    TeamMatchStats,
    MatchAuditLog,
    MatchWinner
} from '@/lib/models/match-stats'
import { calculateTeamPoints } from '@/lib/point-schemas'

// Create a new match
export async function createMatch(
    tournamentId: string,
    tournamentName: string,
    teamAId: string,
    teamBId: string,
    matchNumber: number,
    game: GameType,
    scheduledAt: Date,
    createdBy: string
): Promise<MatchDetailed> {
    try {
        // Fetch team details
        const teamADoc = await getDoc(doc(db, 'teams', teamAId))
        const teamBDoc = await getDoc(doc(db, 'teams', teamBId))

        if (!teamADoc.exists() || !teamBDoc.exists()) {
            throw new Error('One or both teams not found')
        }

        const teamAData = teamADoc.data()
        const teamBData = teamBDoc.data()

        const matchesRef = collection(db, 'matches_detailed')
        const newMatchRef = doc(matchesRef)

        const match: MatchDetailed = {
            id: newMatchRef.id,
            tournamentId,
            tournamentName,
            matchNumber,
            teamA: {
                id: teamAId,
                name: teamAData.name,
                logo: teamAData.logo,
                captainId: teamAData.captainId,
                captainName: teamAData.members.find((m: any) => m.userId === teamAData.captainId)?.displayName || 'Captain'
            },
            teamB: {
                id: teamBId,
                name: teamBData.name,
                logo: teamBData.logo,
                captainId: teamBData.captainId,
                captainName: teamBData.members.find((m: any) => m.userId === teamBData.captainId)?.displayName || 'Captain'
            },
            game,
            scheduledAt,
            status: 'scheduled',
            createdBy,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        await setDoc(newMatchRef, match)

        // Create audit log
        await createAuditLog(match.id, tournamentId, 'created', createdBy, 'System', {
            newStatus: 'scheduled'
        })

        return match
    } catch (error) {
        console.error('Error creating match:', error)
        throw error
    }
}

// Captain submits match result
export async function submitMatchResult(
    matchId: string,
    captainId: string,
    captainName: string,
    resultData: {
        winner: MatchWinner
        proofUrl: string
        teamAStats: TeamMatchStats
        teamBStats: TeamMatchStats
    }
): Promise<void> {
    try {
        const matchRef = doc(db, 'matches_detailed', matchId)
        const matchDoc = await getDoc(matchRef)

        if (!matchDoc.exists()) {
            throw new Error('Match not found')
        }

        const match = matchDoc.data() as MatchDetailed

        // Validate captain
        if (match.teamA.captainId !== captainId && match.teamB.captainId !== captainId) {
            throw new Error('Only team captains can submit results')
        }

        // Validate status
        if (match.status !== 'scheduled' && match.status !== 'played') {
            throw new Error('Match result already submitted or in review')
        }

        // Validate proof URL
        if (!resultData.proofUrl || !resultData.proofUrl.trim()) {
            throw new Error('Proof screenshot/video is required')
        }

        // Create match result
        const matchResult: MatchResult = {
            winner: resultData.winner,
            submittedBy: captainId,
            submittedByName: captainName,
            submittedAt: new Date(),
            proofUrl: resultData.proofUrl,
            teamAStats: resultData.teamAStats,
            teamBStats: resultData.teamBStats,
            disputed: false,
            editHistory: []
        }

        // Update match
        await updateDoc(matchRef, {
            status: 'submitted',
            result: matchResult,
            playedAt: new Date(),
            updatedAt: new Date()
        })

        // Create audit log
        await createAuditLog(matchId, match.tournamentId, 'submitted', captainId, captainName, {
            previousStatus: match.status,
            newStatus: 'submitted',
            notes: `Result submitted by ${captainName}`
        })
    } catch (error) {
        console.error('Error submitting match result:', error)
        throw error
    }
}

// Opponent captain confirms match result
export async function confirmMatchResult(
    matchId: string,
    captainId: string,
    captainName: string
): Promise<void> {
    try {
        const matchRef = doc(db, 'matches_detailed', matchId)
        const matchDoc = await getDoc(matchRef)

        if (!matchDoc.exists()) {
            throw new Error('Match not found')
        }

        const match = matchDoc.data() as MatchDetailed

        // Validate captain (must be the OTHER captain)
        const submittedByCaptain = match.result?.submittedBy
        if (submittedByCaptain === captainId) {
            throw new Error('Cannot confirm your own submission')
        }

        if (match.teamA.captainId !== captainId && match.teamB.captainId !== captainId) {
            throw new Error('Only opponent captain can confirm')
        }

        // Validate status
        if (match.status !== 'submitted') {
            throw new Error('Match is not in submitted state')
        }

        // Update match result
        await updateDoc(matchRef, {
            'result.confirmedBy': captainId,
            'result.confirmedByName': captainName,
            'result.confirmedAt': new Date(),
            status: 'confirmed',
            updatedAt: new Date()
        })

        // Create audit log
        await createAuditLog(matchId, match.tournamentId, 'confirmed', captainId, captainName, {
            previousStatus: 'submitted',
            newStatus: 'confirmed',
            notes: `Result confirmed by ${captainName}`
        })
    } catch (error) {
        console.error('Error confirming match result:', error)
        throw error
    }
}

// Opponent captain disputes match result
export async function disputeMatchResult(
    matchId: string,
    captainId: string,
    captainName: string,
    reason: string
): Promise<void> {
    try {
        const matchRef = doc(db, 'matches_detailed', matchId)
        const matchDoc = await getDoc(matchRef)

        if (!matchDoc.exists()) {
            throw new Error('Match not found')
        }

        const match = matchDoc.data() as MatchDetailed

        // Validate captain (must be the OTHER captain)
        const submittedByCaptain = match.result?.submittedBy
        if (submittedByCaptain === captainId) {
            throw new Error('Cannot dispute your own submission')
        }

        if (match.teamA.captainId !== captainId && match.teamB.captainId !== captainId) {
            throw new Error('Only opponent captain can dispute')
        }

        // Validate status
        if (match.status !== 'submitted') {
            throw new Error('Match is not in submitted state')
        }

        if (!reason || !reason.trim()) {
            throw new Error('Dispute reason is required')
        }

        // Update match result
        await updateDoc(matchRef, {
            'result.disputed': true,
            'result.disputeReason': reason,
            'result.disputedBy': captainId,
            'result.disputedByName': captainName,
            'result.disputedAt': new Date(),
            status: 'disputed',
            updatedAt: new Date()
        })

        // Create audit log
        await createAuditLog(matchId, match.tournamentId, 'disputed', captainId, captainName, {
            previousStatus: 'submitted',
            newStatus: 'disputed',
            reason,
            notes: `Match disputed by ${captainName}: ${reason}`
        })
    } catch (error) {
        console.error('Error disputing match result:', error)
        throw error
    }
}

// Admin approves match result
export async function approveMatchResult(
    matchId: string,
    adminId: string,
    adminName: string,
    adminNotes?: string
): Promise<void> {
    try {
        const matchRef = doc(db, 'matches_detailed', matchId)
        const matchDoc = await getDoc(matchRef)

        if (!matchDoc.exists()) {
            throw new Error('Match not found')
        }

        const match = matchDoc.data() as MatchDetailed

        // Validate status (can approve submitted, confirmed, or disputed)
        if (!['submitted', 'confirmed', 'disputed'].includes(match.status)) {
            throw new Error('Match is not in a state that can be approved')
        }

        if (!match.result) {
            throw new Error('No match result to approve')
        }

        // Update match result
        await updateDoc(matchRef, {
            'result.approvedBy': adminId,
            'result.approvedByName': adminName,
            'result.approvedAt': new Date(),
            'result.adminNotes': adminNotes || '',
            status: 'approved',
            updatedAt: new Date()
        })

        // Create audit log
        await createAuditLog(matchId, match.tournamentId, 'approved', adminId, adminName, {
            previousStatus: match.status,
            newStatus: 'approved',
            notes: adminNotes || `Match approved by ${adminName}`
        })

        // Trigger stats update (this will be called separately)
        // await updateMatchStats(matchId)
    } catch (error) {
        console.error('Error approving match result:', error)
        throw error
    }
}

// Admin rejects match result
export async function rejectMatchResult(
    matchId: string,
    adminId: string,
    adminName: string,
    reason: string
): Promise<void> {
    try {
        const matchRef = doc(db, 'matches_detailed', matchId)
        const matchDoc = await getDoc(matchRef)

        if (!matchDoc.exists()) {
            throw new Error('Match not found')
        }

        const match = matchDoc.data() as MatchDetailed

        if (!reason || !reason.trim()) {
            throw new Error('Rejection reason is required')
        }

        // Update match result
        await updateDoc(matchRef, {
            'result.rejectionReason': reason,
            status: 'rejected',
            updatedAt: new Date()
        })

        // Create audit log
        await createAuditLog(matchId, match.tournamentId, 'rejected', adminId, adminName, {
            previousStatus: match.status,
            newStatus: 'rejected',
            reason,
            notes: `Match rejected by ${adminName}: ${reason}`
        })
    } catch (error) {
        console.error('Error rejecting match result:', error)
        throw error
    }
}

// Get match by ID
export async function getMatchDetailed(matchId: string): Promise<MatchDetailed | null> {
    try {
        const matchDoc = await getDoc(doc(db, 'matches_detailed', matchId))
        if (!matchDoc.exists()) return null
        return matchDoc.data() as MatchDetailed
    } catch (error) {
        console.error('Error getting match:', error)
        throw error
    }
}

// Get matches by tournament
export async function getMatchesByTournament(tournamentId: string): Promise<MatchDetailed[]> {
    try {
        const q = query(
            collection(db, 'matches_detailed'),
            where('tournamentId', '==', tournamentId)
        )
        const snapshot = await getDocs(q)
        const matches = snapshot.docs.map(doc => doc.data() as MatchDetailed)
        return matches.sort((a, b) => a.matchNumber - b.matchNumber)
    } catch (error) {
        console.error('Error getting matches:', error)
        throw error
    }
}

export const updateMatchSchedule = async (matchId: string, scheduledAt: Date) => {
    try {
        const matchRef = doc(db, 'matches_detailed', matchId)
        await updateDoc(matchRef, {
            scheduledAt: scheduledAt,
            updatedAt: new Date()
        })
        return { success: true }
    } catch (error) {
        console.error('Error updating match schedule:', error)
        throw error
    }
}

// Get pending approvals (admin)
export async function getPendingApprovals(): Promise<MatchDetailed[]> {
    try {
        const q = query(
            collection(db, 'matches_detailed'),
            where('status', 'in', ['submitted', 'confirmed', 'disputed']),
            orderBy('updatedAt', 'desc')
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => doc.data() as MatchDetailed)
    } catch (error) {
        console.error('Error getting pending approvals:', error)
        throw error
    }
}

// Create audit log
async function createAuditLog(
    matchId: string,
    tournamentId: string,
    action: MatchAuditLog['action'],
    performedBy: string,
    performedByName: string,
    details: MatchAuditLog['details']
): Promise<void> {
    try {
        const auditLog: Omit<MatchAuditLog, 'id'> = {
            matchId,
            tournamentId,
            action,
            performedBy,
            performedByName,
            performedAt: new Date(),
            details
        }

        await addDoc(collection(db, 'match_audit_logs'), auditLog)
    } catch (error) {
        console.error('Error creating audit log:', error)
        // Don't throw - audit log failure shouldn't block main operation
    }
}

// Get audit logs for a match
export async function getMatchAuditLogs(matchId: string): Promise<MatchAuditLog[]> {
    try {
        const q = query(
            collection(db, 'match_audit_logs'),
            where('matchId', '==', matchId),
            orderBy('performedAt', 'desc')
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MatchAuditLog))
    } catch (error) {
        console.error('Error getting audit logs:', error)
        throw error
    }
}
