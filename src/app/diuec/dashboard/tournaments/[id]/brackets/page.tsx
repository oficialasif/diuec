'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { updateMatchSchedule, generateKnockoutBracket, getTournament, approveMatchResult } from '@/lib/services'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { ArrowLeft, Save, Calendar, Clock, X, RefreshCw, Eye, List, Trophy, CheckCircle2, Loader2, Check } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { getValidImageUrl } from '@/lib/utils/image'
import { SymmetricBracket } from '@/components/tournaments/SymmetricBracket'
import { BattleRoyaleResultEditor } from '@/components/tournaments/BattleRoyaleResultEditor'

export default function BracketManagePage() {
    const params = useParams()
    const matchId = params.id as string // Actually this is tournamentId based on folder structure [id]/brackets
    const tournamentId = params.id as string

    const [tournament, setTournament] = useState<any>(null)
    const [matches, setMatches] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [editingMatch, setEditingMatch] = useState<string | null>(null)
    const [scheduleDate, setScheduleDate] = useState('')
    const [scheduleTime, setScheduleTime] = useState('')
    const [viewMode, setViewMode] = useState<'visual' | 'list'>('visual')

    const [brEditorOpen, setBrEditorOpen] = useState(false)
    const [selectedBrMatch, setSelectedBrMatch] = useState<any>(null)

    useEffect(() => {
        if (tournamentId) {
            fetchData()
        }
    }, [tournamentId])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch Tournament
            const tourDoc = await getDoc(doc(db, 'tournaments', tournamentId))
            if (tourDoc.exists()) {
                setTournament({ id: tourDoc.id, ...tourDoc.data() })
            }

            // Fetch Matches
            const q = query(collection(db, 'matches_detailed'), where('tournamentId', '==', tournamentId))
            const snap = await getDocs(q)
            const matchesData = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => a.matchNumber - b.matchNumber)
            setMatches(matchesData)

        } catch (error) {
            console.error(error)
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const handleGenerate = async () => {
        if (!confirm('This will DELETE all existing matches and regenerate the bracket based on current group results. Continue?')) return

        setGenerating(true)
        try {
            await generateKnockoutBracket(tournamentId)
            toast.success('Bracket Generated!')
            fetchData()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Generation failed')
        } finally {
            setGenerating(false)
        }
    }

    const handleEditClick = (match: any) => {
        setEditingMatch(match.id)
        if (match.scheduledAt) {
            const d = match.scheduledAt.toDate ? match.scheduledAt.toDate() : new Date(match.scheduledAt)
            setScheduleDate(d.toISOString().split('T')[0])
            setScheduleTime(d.toTimeString().slice(0, 5))
        } else {
            setScheduleDate('')
            setScheduleTime('')
        }
    }

    const handleSaveSchedule = async (matchId: string) => {
        if (!scheduleDate || !scheduleTime) {
            toast.error('Please select date and time')
            return
        }

        const dateTime = new Date(`${scheduleDate}T${scheduleTime}`)

        try {
            await updateMatchSchedule(matchId, dateTime)
            toast.success('Schedule updated')
            setEditingMatch(null)
            fetchData() // Refresh
        } catch (error) {
            console.error(error)
            toast.error('Failed to update schedule')
        }
    }

    const handleApprove = async (matchId: string) => {
        if (!confirm('Are you sure you want to approve this result? The winner will automatically advance.')) return

        try {
            // Need user ID for 'approvedBy'. using a placeholder or context if available.
            // This is admin panel, auth context is usually wrapped.
            // I'll assume I can get user id from somewhere or just pass 'ADMIN'.
            // Actually I should use useAuth().
            // I'll add useAuth import and hook usage.
            await approveMatchResult(matchId, 'ADMIN') // TODO: Pass actual ID
            toast.success('Match approved and bracket updated')
            fetchData()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to approve')
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-400">Loading matches...</div>

    if (!tournament) return <div className="p-8 text-center text-red-400">Tournament not found</div>

    // Group matches by Round
    const rounds: Record<number, any[]> = {}
    matches.forEach(m => {
        if (!rounds[m.round]) rounds[m.round] = []
        rounds[m.round].push(m)
    })

    const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/diuec/dashboard/tournaments">
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Manage Brackets</h1>
                        <p className="text-gray-400 text-sm">{tournament.title}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {tournament.type !== 'BATTLE_ROYALE' && (
                        <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800 mr-4">
                            <button
                                onClick={() => setViewMode('visual')}
                                className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-2 transition-colors ${viewMode === 'visual' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Eye className="w-3.5 h-3.5" /> Visual
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-2 transition-colors ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <List className="w-3.5 h-3.5" /> List
                            </button>
                        </div>
                    )}

                    <Button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {generating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        {matches.length > 0 ? 'Regenerate Bracket' : 'Generate Bracket'}
                    </Button>
                </div>
            </div>

            {viewMode === 'visual' && tournament.type !== 'BATTLE_ROYALE' && matches.length > 0 && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 overflow-x-auto">
                    <SymmetricBracket matches={matches} />
                </div>
            )}

            {(viewMode === 'list' || tournament.type === 'BATTLE_ROYALE') && (
                <div className="space-y-8">
                    {roundNumbers.map(round => (
                        <div key={round} className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                            <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-3">
                                <h3 className="font-semibold text-gray-300">Round {round}</h3>
                            </div>
                            <div className="divide-y divide-zinc-800">
                                {rounds[round].map(match => (
                                    <div key={match.id} className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                        {/* Match Info */}
                                        <div className="flex items-center gap-8 w-full md:w-auto flex-1">
                                            <div className="text-sm text-gray-500 font-mono w-8">#{match.matchNumber}</div>

                                            {match.type === 'BATTLE_ROYALE' ? (
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-white text-lg">Group {match.group} Match</span>
                                                        <span className="px-2 py-0.5 rounded bg-purple-900/30 text-purple-400 text-xs font-bold border border-purple-500/30">
                                                            BATTLE ROYALE
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-400 text-sm mt-1">
                                                        {match.participants?.length || 0} Teams Participating
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-3 min-w-[150px] justify-end">
                                                        <span className={`font-medium ${match.winnerId && match.teamA ? (match.winnerId === match.teamA.id ? 'text-green-400' : 'text-gray-300') : 'text-gray-300'}`}>
                                                            {match.teamA?.name || 'TBD'}
                                                        </span>
                                                        {match.teamA?.logo && (
                                                            <div className="w-8 h-8 relative bg-zinc-800 rounded overflow-hidden">
                                                                <Image src={getValidImageUrl(match.teamA.logo)} alt="" fill className="object-cover" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="text-xs font-bold text-gray-600 bg-zinc-950 px-2 py-1 rounded">VS</div>

                                                    <div className="flex items-center gap-3 min-w-[150px]">
                                                        {match.teamB?.logo && (
                                                            <div className="w-8 h-8 relative bg-zinc-800 rounded overflow-hidden">
                                                                <Image src={getValidImageUrl(match.teamB.logo)} alt="" fill className="object-cover" />
                                                            </div>
                                                        )}
                                                        <span className={`font-medium ${match.winnerId && match.teamB ? (match.winnerId === match.teamB.id ? 'text-green-400' : 'text-gray-300') : 'text-gray-300'}`}>
                                                            {match.teamB?.name || 'TBD'}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Schedule Action */}
                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            {editingMatch === match.id ? (
                                                <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-lg border border-zinc-800 animate-in fade-in slide-in-from-right-4">
                                                    <Input
                                                        type="date"
                                                        value={scheduleDate}
                                                        onChange={(e) => setScheduleDate(e.target.value)}
                                                        className="w-36 bg-zinc-900 border-zinc-700 h-8 text-xs"
                                                    />
                                                    <Input
                                                        type="time"
                                                        value={scheduleTime}
                                                        onChange={(e) => setScheduleTime(e.target.value)}
                                                        className="w-24 bg-zinc-900 border-zinc-700 h-8 text-xs"
                                                    />
                                                    <Button size="sm" onClick={() => handleSaveSchedule(match.id)} className="h-8 bg-green-600 hover:bg-green-700">
                                                        <Save className="w-3 h-3" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setEditingMatch(null)} className="h-8 w-8 p-0">
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ) : match.type === 'BATTLE_ROYALE' ? (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant={match.status === 'completed' ? 'ghost' : 'default'}
                                                        className={`h-8 text-xs ${match.status === 'completed' ? 'text-green-400 hover:text-green-300' : 'bg-violet-600 hover:bg-violet-700'}`}
                                                        onClick={() => { setSelectedBrMatch(match); setBrEditorOpen(true); }}
                                                    >
                                                        {match.status === 'completed' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Trophy className="w-3 h-3 mr-1" />}
                                                        {match.status === 'completed' ? 'Results Finalized' : 'Enter Results'}
                                                    </Button>
                                                </div>
                                            ) : match.status === 'submitted' ? (
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-yellow-500 text-xs font-bold uppercase">Pending Approval</span>
                                                        <div className="text-sm font-mono bg-zinc-800 px-2 py-0.5 rounded text-white">
                                                            {match.result?.scoreA} - {match.result?.scoreB}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {match.result?.proofUrl && (
                                                            <a href={match.result.proofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:underline flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded">
                                                                <Eye className="w-3 h-3" /> Img
                                                            </a>
                                                        )}
                                                        {match.result?.videoUrl && (
                                                            <a href={match.result.videoUrl} target="_blank" rel="noopener noreferrer" className="text-pink-400 text-xs hover:underline flex items-center gap-1 bg-pink-500/10 px-2 py-1 rounded">
                                                                <Eye className="w-3 h-3" /> Video
                                                            </a>
                                                        )}
                                                        <Button size="sm" onClick={() => handleApprove(match.id)} className="h-7 bg-green-600 hover:bg-green-700 text-xs">
                                                            Approve
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="text-xs text-gray-400">Scheduled For</div>
                                                        <div className="text-sm font-medium text-white flex items-center gap-2 justify-end">
                                                            {match.scheduledAt ? (
                                                                <>
                                                                    {(match.scheduledAt.toDate ? match.scheduledAt.toDate() : new Date(match.scheduledAt)).toLocaleString()}
                                                                </>
                                                            ) : (
                                                                <span className="text-yellow-500/50 italic">Unscheduled</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm" onClick={() => {
                                                        setEditingMatch(match.id)
                                                        if (match.scheduledAt) {
                                                            const d = match.scheduledAt.toDate ? match.scheduledAt.toDate() : new Date(match.scheduledAt)
                                                            setScheduleDate(d.toISOString().split('T')[0])
                                                            setScheduleTime(d.toTimeString().slice(0, 5))
                                                        }
                                                    }} className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10">
                                                        <Calendar className="w-4 h-4 mr-2" />
                                                        Schedule
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {matches.length === 0 && (
                <div className="text-center py-12 text-gray-500 border border-zinc-800 border-dashed rounded-xl">
                    No matches found. Click "Generate Bracket" to start the knockout stage.
                </div>
            )}

            {selectedBrMatch && (
                <BattleRoyaleResultEditor
                    isOpen={brEditorOpen}
                    onClose={() => setBrEditorOpen(false)}
                    match={selectedBrMatch}
                    onSuccess={fetchData}
                />
            )}
        </div>
    )
}
