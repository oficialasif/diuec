'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CheckCircle, XCircle, Eye, ExternalLink, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function MatchVerificationPage() {
    const [matches, setMatches] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [rejectReason, setRejectReason] = useState('')
    const [selectedMatch, setSelectedMatch] = useState<any>(null)
    const [isRejectOpen, setIsRejectOpen] = useState(false)

    useEffect(() => {
        fetchPendingMatches()
    }, [])

    const fetchPendingMatches = async () => {
        setLoading(true)
        try {
            const q = query(collection(db, 'matches'), where('status', '==', 'PENDING_VERIFICATION'))
            const snapshot = await getDocs(q)
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setMatches(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (match: any) => {
        if (!confirm('Approve this result? This will advance the winner.')) return

        try {
            const winnerId = match.scoreA > match.scoreB ? match.teamAId : match.teamBId

            const { writeBatch, doc, increment, getFirestore } = await import('firebase/firestore')
            const b = writeBatch(db)
            const matchRef = doc(db, 'matches', match.id)

            b.update(matchRef, {
                status: 'COMPLETED',
                winnerId,
                verifiedAt: Timestamp.now()
            })

            // Update Team Stats
            if (match.teamAId) {
                const win = match.teamAId === winnerId
                const teamARef = doc(db, 'teams', match.teamAId)
                b.update(teamARef, {
                    'stats.matchesPlayed': increment(1),
                    'stats.wins': increment(win ? 1 : 0),
                    'stats.losses': increment(win ? 0 : 1)
                })
            }

            if (match.teamBId) {
                const win = match.teamBId === winnerId
                const teamBRef = doc(db, 'teams', match.teamBId)
                b.update(teamBRef, {
                    'stats.matchesPlayed': increment(1),
                    'stats.wins': increment(win ? 1 : 0),
                    'stats.losses': increment(win ? 0 : 1)
                })
            }

            await b.commit()

            toast.success('Match approved & stats updated')
            fetchPendingMatches()
        } catch (error) {
            console.error(error)
            toast.error('Failed to approve match')
        }
    }

    const handleReject = async () => {
        if (!selectedMatch) return
        try {
            await updateDoc(doc(db, 'matches', selectedMatch.id), {
                status: 'DISPUTE', // Or SCHEDULED to reset
                disputeReason: rejectReason,
                verifiedAt: Timestamp.now()
            })
            toast.success('Match rejected/disputed')
            setIsRejectOpen(false)
            fetchPendingMatches()
        } catch (error) {
            console.error(error)
            toast.error('Failed to reject match')
        }
    }

    if (loading) return <div className="p-8 text-center text-white">Loading...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Shield className="text-violet-500" />
                Match Verification
            </h1>

            <div className="grid gap-4">
                {matches.map(match => (
                    <div key={match.id} className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-6 mb-4">
                            <div className="flex-1">
                                <div className="text-sm text-gray-400 mb-2">Tournament ID: {match.tournamentId} • Round {match.round}</div>
                                <div className="flex items-center gap-8 text-xl font-bold text-white">
                                    <div className={match.scoreA > match.scoreB ? 'text-green-400' : ''}>
                                        Team A ({match.scoreA})
                                    </div>
                                    <div className="text-sm text-gray-600">VS</div>
                                    <div className={match.scoreB > match.scoreA ? 'text-green-400' : ''}>
                                        Team B ({match.scoreB})
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Link
                                    href={match.proofImage || '#'}
                                    target="_blank"
                                    className="flex items-center gap-2 text-violet-400 text-sm hover:underline"
                                >
                                    <ExternalLink size={14} />
                                    View Proof
                                </Link>
                                <div className="text-xs text-gray-500">
                                    Submitted: {match.updatedAt?.toDate().toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                            <Button variant="outline" className="text-red-400 hover:text-red-300 border-red-900/50 bg-red-900/10" onClick={() => {
                                setSelectedMatch(match)
                                setIsRejectOpen(true)
                            }}>
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                            </Button>
                            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(match)}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                            </Button>
                        </div>
                    </div>
                ))}

                {matches.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-zinc-900/20 rounded-xl">
                        No pending matches to verify
                    </div>
                )}
            </div>

            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Reject/Dispute Match</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder="Reason for rejection..."
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            className="bg-black border-zinc-700"
                        />
                        <Button onClick={handleReject} className="w-full bg-red-600 hover:bg-red-700">
                            Confirm Rejection
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
