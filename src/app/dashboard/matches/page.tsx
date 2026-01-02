'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { collection, query, where, getDocs, doc, updateDoc, Timestamp, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Swords, Trophy, Clock, Image as ImageIcon, Upload } from 'lucide-react'
import { getTeamsByUser } from '@/lib/team-helpers'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function MatchesPage() {
    const { user } = useAuth()
    const [matches, setMatches] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMatch, setSelectedMatch] = useState<any | null>(null)
    const [isSubmitOpen, setIsSubmitOpen] = useState(false)
    const [resultData, setResultData] = useState({
        scoreA: '',
        scoreB: '',
        proofImage: ''
    })

    useEffect(() => {
        if (user) {
            fetchMatches()
        }
    }, [user])

    const fetchMatches = async () => {
        try {
            // Get user's teams first
            const userTeams = await getTeamsByUser(user!.uid)
            const teamIds = userTeams.map(t => t.id)

            // Also include user ID for solo tournaments
            const participantIds = [...teamIds, user!.uid]

            if (participantIds.length === 0) {
                setLoading(false)
                return
            }

            // Firestore "in" query limited to 10
            // For now assuming user isn't in >10 teams active

            // We need to query for teamAId OR teamBId. 
            // Firestore doesn't support logical OR across different fields easily without separate queries.

            const matchesRef = collection(db, 'matches')

            // Query 1: As Team A
            const qA = query(matchesRef, where('teamAId', 'in', participantIds), orderBy('startTime', 'desc'))
            // Query 2: As Team B
            const qB = query(matchesRef, where('teamBId', 'in', participantIds), orderBy('startTime', 'desc'))

            const [snapA, snapB] = await Promise.all([getDocs(qA), getDocs(qB)])

            const allMatches = new Map()

            snapA.docs.forEach(doc => allMatches.set(doc.id, { id: doc.id, ...doc.data() }))
            snapB.docs.forEach(doc => allMatches.set(doc.id, { id: doc.id, ...doc.data() }))

            setMatches(Array.from(allMatches.values()).sort((a, b) => b.startTime - a.startTime))

        } catch (error) {
            console.error('Error fetching matches:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitResult = async () => {
        if (!selectedMatch) return
        if (!resultData.scoreA || !resultData.scoreB || !resultData.proofImage) {
            toast.error('Please fill all fields and upload proof')
            return
        }

        try {
            await updateDoc(doc(db, 'matches', selectedMatch.id), {
                scoreA: parseInt(resultData.scoreA),
                scoreB: parseInt(resultData.scoreB),
                proofImage: resultData.proofImage,
                status: 'PENDING_VERIFICATION',
                updatedAt: Timestamp.now()
            })

            toast.success('Result submitted for verification')
            setIsSubmitOpen(false)
            fetchMatches()
        } catch (error) {
            console.error('Error submitting result:', error)
            toast.error('Failed to submit result')
        }
    }

    if (loading) return <div className="min-h-screen bg-black pt-24 text-center">Loading...</div>

    return (
        <div className="min-h-screen bg-black text-white pt-24 px-4 pb-12">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Swords className="text-violet-500" />
                    My Matches
                </h1>

                <div className="grid gap-4">
                    {matches.map(match => (
                        <div key={match.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">

                            <div className="flex-1 flex items-center justify-between w-full md:w-auto gap-8">
                                {/* Team A */}
                                <div className={`text-center flex-1 ${match.winnerId === match.teamAId ? 'text-yellow-400' : 'text-white'}`}>
                                    <div className="font-bold text-lg mb-1">{match.teamAId === user?.uid ? 'You' : 'Team A'}</div>
                                    {match.scoreA !== undefined && <div className="text-2xl font-mono">{match.scoreA}</div>}
                                </div>

                                <div className="text-gray-500 font-bold">VS</div>

                                {/* Team B */}
                                <div className={`text-center flex-1 ${match.winnerId === match.teamBId ? 'text-yellow-400' : 'text-white'}`}>
                                    <div className="font-bold text-lg mb-1">{match.teamBId === user?.uid ? 'You' : 'Team B'}</div>
                                    {match.scoreB !== undefined && <div className="text-2xl font-mono">{match.scoreB}</div>}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 flex-col md:flex-row w-full md:w-auto">
                                <div className="text-center md:text-right">
                                    <div className="text-sm text-gray-400 mb-1">
                                        Round {match.round} • Match #{match.matchNumber}
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded inline-block font-medium ${match.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                            match.status === 'PENDING_VERIFICATION' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {match.status}
                                    </div>
                                </div>

                                {match.status === 'SCHEDULED' && (
                                    <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
                                        <DialogTrigger asChild>
                                            <Button
                                                onClick={() => {
                                                    setSelectedMatch(match)
                                                    setResultData({ scoreA: '', scoreB: '', proofImage: '' })
                                                }}
                                                className="bg-violet-600 hover:bg-violet-700 w-full md:w-auto"
                                            >
                                                Submit Result
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <DialogHeader>
                                                <DialogTitle>Submit Match Result</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 pt-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-sm text-gray-400 block mb-1">Team A Score</label>
                                                        <Input
                                                            type="number"
                                                            value={resultData.scoreA}
                                                            onChange={e => setResultData({ ...resultData, scoreA: e.target.value })}
                                                            className="bg-black border-zinc-700"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm text-gray-400 block mb-1">Team B Score</label>
                                                        <Input
                                                            type="number"
                                                            value={resultData.scoreB}
                                                            onChange={e => setResultData({ ...resultData, scoreB: e.target.value })}
                                                            className="bg-black border-zinc-700"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-sm text-gray-400 block mb-1">Proof Image URL</label>
                                                    <Input
                                                        placeholder="https://..."
                                                        value={resultData.proofImage}
                                                        onChange={e => setResultData({ ...resultData, proofImage: e.target.value })}
                                                        className="bg-black border-zinc-700"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Upload screenshot to Imgur/Discord and paste link</p>
                                                </div>

                                                <Button onClick={handleSubmitResult} className="w-full bg-violet-600 hover:bg-violet-700 mt-2">
                                                    Submit for Verification
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        </div>
                    ))}

                    {matches.length === 0 && (
                        <div className="text-center py-12 text-gray-500 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            No matches found. Join a tournament to get started!
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
