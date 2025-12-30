'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Match, Team } from '@/lib/models'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { Shield, CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function MatchRoomPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isAdmin } = useAuth()
    const [match, setMatch] = useState<Match | null>(null)
    const [loading, setLoading] = useState(true)
    const [scoreA, setScoreA] = useState('')
    const [scoreB, setScoreB] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const matchId = params?.id as string

    useEffect(() => {
        async function fetchMatch() {
            if (!matchId) return
            const ref = doc(db, 'matches', matchId)
            const snap = await getDoc(ref)
            if (snap.exists()) {
                setMatch(snap.data() as Match)
            }
            setLoading(false)
        }
        fetchMatch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId])

    const handleReport = async () => {
        if (!match || !scoreA || !scoreB) return
        setSubmitting(true)

        try {
            const scoreANum = parseInt(scoreA)
            const scoreBNum = parseInt(scoreB)
            const winnerId = scoreANum > scoreBNum ? match.teamAId : match.teamBId

            await updateDoc(doc(db, 'matches', matchId), {
                scoreA: scoreANum,
                scoreB: scoreBNum,
                winnerId,
                status: 'COMPLETED'
            })

            // Auto-Advance logic would go here (update next match)
            // For MVP, just marking complete.

            toast.success('Match Result Reported!')
            router.push(`/tournaments/${match.tournamentId}`)

        } catch (error: any) {
            toast.error('Failed to report score')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-20 text-center">Loading Match...</div>
    if (!match) return <div className="p-20 text-center">Match not found</div>

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-8">
                    <div className="bg-zinc-800 p-4 border-b border-zinc-700 flex justify-between items-center">
                        <h1 className="font-bold flex items-center gap-2">
                            <Shield className="w-5 h-5 text-violet-500" /> Match Room #{match.matchNumber}
                        </h1>
                        <span className="text-xs bg-black px-2 py-1 rounded text-gray-400 font-mono">{match.status}</span>
                    </div>

                    {match.type === 'ELIMINATION' ? (
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                {/* Team A */}
                                <div className="text-center w-1/3">
                                    <div className="h-20 w-20 bg-zinc-800 rounded-xl mx-auto mb-2 flex items-center justify-center border-2 border-violet-500/20">
                                        <span className="font-bold text-2xl">A</span>
                                    </div>
                                    <h3 className="font-bold truncate">{match.teamAName || 'Team A'}</h3>
                                    {match.status === 'COMPLETED' && (
                                        <div className="text-4xl font-mono mt-2">{match.scoreA}</div>
                                    )}
                                </div>

                                <div className="text-center w-1/3">
                                    <div className="text-2xl font-bold text-gray-500">VS</div>
                                </div>

                                {/* Team B */}
                                <div className="text-center w-1/3">
                                    <div className="h-20 w-20 bg-zinc-800 rounded-xl mx-auto mb-2 flex items-center justify-center border-2 border-red-500/20">
                                        <span className="font-bold text-2xl">B</span>
                                    </div>
                                    <h3 className="font-bold truncate">{match.teamBName || 'Team B'}</h3>
                                    {match.status === 'COMPLETED' && (
                                        <div className="text-4xl font-mono mt-2">{match.scoreB}</div>
                                    )}
                                </div>
                            </div>

                            {/* Reporting Form */}
                            {match.status !== 'COMPLETED' && (isAdmin || user) && (
                                <div className="bg-black/50 p-6 rounded-lg border border-zinc-800">
                                    <h4 className="font-bold mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" /> Report Result
                                    </h4>
                                    <div className="flex gap-4 mb-4">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Score Team A</label>
                                            <Input
                                                type="number"
                                                className="bg-zinc-900 border-zinc-700"
                                                value={scoreA}
                                                onChange={e => setScoreA(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Score Team B</label>
                                            <Input
                                                type="number"
                                                className="bg-zinc-900 border-zinc-700"
                                                value={scoreB}
                                                onChange={e => setScoreB(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Button onClick={handleReport} disabled={submitting} className="w-full bg-violet-600 hover:bg-violet-700">
                                        {submitting ? 'Submitting...' : 'Submit Score'}
                                    </Button>
                                </div>
                            )}

                            {match.status === 'COMPLETED' && (
                                <div className="text-center p-4 bg-green-500/10 rounded border border-green-500/20 text-green-400">
                                    Match Completed. Winner: {match.winnerId === match.teamAId ? 'Team A' : 'Team B'}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-400">
                            Battle Royale Match Reporting is currently Admin-only via Dashboard.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
