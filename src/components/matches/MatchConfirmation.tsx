'use client'

import { useState } from 'react'
import { Button } from '@/components/shared/ui/button'
import { Textarea } from '@/components/shared/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, ExternalLink, AlertTriangle } from 'lucide-react'
import { confirmMatchResult, disputeMatchResult } from '@/lib/services/match-services'
import { MatchDetailed } from '@/lib/models/match-stats'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface MatchConfirmationProps {
    match: MatchDetailed
    captainId: string
    captainName: string
    onSuccess: () => void
}

export default function MatchConfirmation({ match, captainId, captainName, onSuccess }: MatchConfirmationProps) {
    const [disputeReason, setDisputeReason] = useState('')
    const [showDisputeForm, setShowDisputeForm] = useState(false)
    const [processing, setProcessing] = useState(false)

    if (!match.result) {
        return (
            <Card className="p-6 bg-zinc-900/50 border-zinc-500/20">
                <p className="text-gray-400">No result submitted yet.</p>
            </Card>
        )
    }

    const isOpponentCaptain = match.result.submittedBy !== captainId &&
        (match.teamA.captainId === captainId || match.teamB.captainId === captainId)

    if (!isOpponentCaptain) {
        return (
            <Card className="p-6 bg-zinc-900/50 border-zinc-500/20">
                <p className="text-gray-400">Only the opponent captain can confirm this result.</p>
            </Card>
        )
    }

    const handleConfirm = async () => {
        setProcessing(true)
        try {
            await confirmMatchResult(match.id, captainId, captainName)
            toast.success('Match result confirmed! Waiting for admin approval.')
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || 'Failed to confirm result')
        } finally {
            setProcessing(false)
        }
    }

    const handleDispute = async () => {
        if (!disputeReason.trim()) {
            toast.error('Please provide a reason for disputing')
            return
        }

        setProcessing(true)
        try {
            await disputeMatchResult(match.id, captainId, captainName, disputeReason)
            toast.success('Match disputed. Admin will review.')
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || 'Failed to dispute result')
        } finally {
            setProcessing(false)
        }
    }

    const result = match.result

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="p-6 bg-gradient-to-r from-violet-900/20 to-purple-900/20 border-violet-500/30">
                <h2 className="text-2xl font-bold mb-2">Confirm Match Result</h2>
                <p className="text-gray-300">Review the submitted result and confirm or dispute</p>
            </Card>

            {/* Submitted By */}
            <Card className="p-4 bg-zinc-900/50 border-zinc-700">
                <p className="text-sm text-gray-400">Submitted by</p>
                <p className="font-semibold text-violet-300">{result.submittedByName}</p>
                <p className="text-xs text-gray-500">{new Date(result.submittedAt).toLocaleString()}</p>
            </Card>

            {/* Winner */}
            <Card className="p-6 bg-zinc-900/50 border-zinc-700">
                <h3 className="text-lg font-semibold mb-3">Match Winner</h3>
                <div className="flex items-center gap-3">
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-4 py-2 text-lg">
                        {result.winner === 'teamA' ? match.teamA.name :
                            result.winner === 'teamB' ? match.teamB.name : 'Draw'}
                    </Badge>
                </div>
            </Card>

            {/* Proof */}
            <Card className="p-6 bg-zinc-900/50 border-zinc-700">
                <h3 className="text-lg font-semibold mb-3">Proof</h3>
                <div className="space-y-3">
                    <a
                        href={result.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        View Proof Image/Video
                    </a>
                    {result.proofUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                        <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
                            <Image
                                src={result.proofUrl}
                                alt="Match Proof"
                                fill
                                className="object-contain"
                            />
                        </div>
                    )}
                </div>
            </Card>

            {/* Team A Stats */}
            <Card className="p-6 bg-zinc-900/50 border-zinc-700">
                <h3 className="text-lg font-semibold mb-4">{match.teamA.name} Stats</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <p className="text-sm text-gray-400">Placement</p>
                        <p className="text-2xl font-bold text-violet-300">#{result.teamAStats.placement}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Total Points</p>
                        <p className="text-2xl font-bold text-green-400">{result.teamAStats.totalPoints}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Total Kills</p>
                        <p className="text-2xl font-bold text-red-400">
                            {result.teamAStats.players.reduce((sum, p) => sum + p.kills, 0)}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    {result.teamAStats.players.map((player, index) => (
                        <div key={index} className="bg-black/50 p-3 rounded-lg flex justify-between items-center">
                            <span className="font-medium">{player.displayName}</span>
                            <div className="flex gap-4 text-sm">
                                <span className="text-green-400">{player.kills} K</span>
                                <span className="text-red-400">{player.deaths} D</span>
                                <span className="text-blue-400">{player.assists} A</span>
                                {player.damage && <span className="text-yellow-400">{player.damage} DMG</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Team B Stats */}
            <Card className="p-6 bg-zinc-900/50 border-zinc-700">
                <h3 className="text-lg font-semibold mb-4">{match.teamB.name} Stats</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <p className="text-sm text-gray-400">Placement</p>
                        <p className="text-2xl font-bold text-violet-300">#{result.teamBStats.placement}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Total Points</p>
                        <p className="text-2xl font-bold text-green-400">{result.teamBStats.totalPoints}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Total Kills</p>
                        <p className="text-2xl font-bold text-red-400">
                            {result.teamBStats.players.reduce((sum, p) => sum + p.kills, 0)}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    {result.teamBStats.players.map((player, index) => (
                        <div key={index} className="bg-black/50 p-3 rounded-lg flex justify-between items-center">
                            <span className="font-medium">{player.displayName}</span>
                            <div className="flex gap-4 text-sm">
                                <span className="text-green-400">{player.kills} K</span>
                                <span className="text-red-400">{player.deaths} D</span>
                                <span className="text-blue-400">{player.assists} A</span>
                                {player.damage && <span className="text-yellow-400">{player.damage} DMG</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
                {!showDisputeForm ? (
                    <>
                        <Button
                            onClick={handleConfirm}
                            disabled={processing}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            size="lg"
                        >
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Confirm Result
                        </Button>
                        <Button
                            onClick={() => setShowDisputeForm(true)}
                            variant="destructive"
                            className="flex-1"
                            size="lg"
                        >
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            Dispute Result
                        </Button>
                    </>
                ) : (
                    <Card className="w-full p-6 bg-red-900/20 border-red-500/30">
                        <h3 className="text-lg font-semibold mb-3 text-red-300">Dispute This Result</h3>
                        <Textarea
                            placeholder="Explain why you're disputing this result..."
                            value={disputeReason}
                            onChange={(e) => setDisputeReason(e.target.value)}
                            className="mb-4 bg-black border-red-500/30"
                            rows={4}
                        />
                        <div className="flex gap-3">
                            <Button
                                onClick={handleDispute}
                                disabled={processing}
                                variant="destructive"
                                className="flex-1"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Submit Dispute
                            </Button>
                            <Button
                                onClick={() => setShowDisputeForm(false)}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}
