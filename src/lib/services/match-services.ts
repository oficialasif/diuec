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
import { updateAllMatchStats } from './stats-services'

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

        // Check for Two-Leg Aggregate or Advance Winner
        if (match.leg) {
            await checkTwoLegProgress(match)
        } else {
            await advanceWinner(match)
        }

        // Trigger stats update
        await updateAllMatchStats(matchId, match)
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

// --- Advancement Logic ---

async function advanceWinner(match: MatchDetailed) {
    if (!match.result?.winner) return

    const winner = match.result.winner === 'teamA' ? match.teamA : match.teamB
    const winnerTag = `Winner M${match.matchNumber}`

    try {
        const qA = query(collection(db, 'matches_detailed'), where('tournamentId', '==', match.tournamentId), where('teamA.name', '==', winnerTag))
        const snapA = await getDocs(qA)
        snapA.docs.forEach(async (d) => {
            const m = d.data()
            await updateDoc(d.ref, {
                'teamA': { ...winner, captainId: winner.captainId || '' }, // Ensure full object
                updatedAt: new Date()
            })
        })

        const qB = query(collection(db, 'matches_detailed'), where('tournamentId', '==', match.tournamentId), where('teamB.name', '==', winnerTag))
        const snapB = await getDocs(qB)
        snapB.docs.forEach(async (d) => {
            const m = d.data()
            await updateDoc(d.ref, {
                'teamB': { ...winner, captainId: winner.captainId || '' },
                updatedAt: new Date()
            })
        })
    } catch (e) {
        console.error('Error advancing winner:', e)
    }
}

async function checkTwoLegProgress(match: MatchDetailed) {
    if (!match.aggregateId || !match.leg) return

    // Fetch master aggregate match
    const aggRef = doc(db, 'matches_detailed', match.aggregateId)
    const aggSnap = await getDoc(aggRef)
    if (!aggSnap.exists()) return

    // Fetch sibling leg
    // We can query by aggregateId
    const q = query(collection(db, 'matches_detailed'), where('aggregateId', '==', match.aggregateId))
    const snap = await getDocs(q)

    const leg1 = snap.docs.find(d => d.data().leg === 1)?.data() as MatchDetailed
    const leg2 = snap.docs.find(d => d.data().leg === 2)?.data() as MatchDetailed

    if (leg1 && leg2 && leg1.status === 'approved' && leg2.status === 'approved' && leg1.result && leg2.result) {
        // Calculate Aggregate
        // Leg 1: A vs B
        // Leg 2: B vs A (Swapped)
        // Master: A vs B (Matches Leg 1 inputs usually)

        const aggMatch = aggSnap.data() as MatchDetailed

        // Sum scores relative to Master's Team A and Team B
        // Master Team A = Leg 1 Team A = Leg 2 Team B

        const scoreA_L1 = leg1.result.teamAStats.totalPoints // Team A (Home)
        const scoreB_L1 = leg1.result.teamBStats.totalPoints // Team B (Away)

        const scoreB_L2 = leg2.result.teamAStats.totalPoints // Team B (Home)
        const scoreA_L2 = leg2.result.teamBStats.totalPoints // Team A (Away)

        const totalA = scoreA_L1 + scoreA_L2
        const totalB = scoreB_L1 + scoreB_L2

        let winner: MatchWinner = 'draw'
        if (totalA > totalB) winner = 'teamA'
        else if (totalB > totalA) winner = 'teamB'

        // Construct Result
        // We reuse TeamMatchStats structure but put Aggregate Score in 'totalPoints'
        const aggResult: MatchResult = {
            winner,
            submittedBy: 'system',
            submittedByName: 'System',
            submittedAt: new Date(),
            proofUrl: 'aggregate',
            teamAStats: { ...leg1.result.teamAStats, totalPoints: totalA },
            teamBStats: { ...leg1.result.teamBStats, totalPoints: totalB },
            disputed: false,
            editHistory: [],
            approvedBy: 'system',
            approvedByName: 'System',
            approvedAt: new Date(),
            adminNotes: 'Aggregate Score Calculated'
        }

        await updateDoc(aggRef, {
            status: 'approved',
            result: aggResult,
            updatedAt: new Date()
        })

        // Advance Winner of Aggregate
        await advanceWinner({ ...aggMatch, result: aggResult })
    }
}
