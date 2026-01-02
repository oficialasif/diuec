'use client'

import { useState } from 'react'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trophy, Upload, Plus, Trash2, Award } from 'lucide-react'
import { submitMatchResult } from '@/lib/services/match-services'
import { calculateTeamPoints } from '@/lib/point-schemas'
import { MatchDetailed, PlayerMatchStats, MatchWinner, GameType } from '@/lib/models/match-stats'
import toast from 'react-hot-toast'

interface MatchResultFormProps {
    match: MatchDetailed
    captainId: string
    captainName: string
    onSuccess: () => void
}

export default function MatchResultForm({ match, captainId, captainName, onSuccess }: MatchResultFormProps) {
    const [winner, setWinner] = useState<MatchWinner>('teamA')
    const [proofUrl, setProofUrl] = useState('')
    const [teamAPlacement, setTeamAPlacement] = useState(1)
    const [teamBPlacement, setTeamBPlacement] = useState(2)
    const [teamAPlayers, setTeamAPlayers] = useState<PlayerMatchStats[]>([])
    const [teamBPlayers, setTeamBPlayers] = useState<PlayerMatchStats[]>([])
    const [submitting, setSubmitting] = useState(false)

    // Check if current user is a captain
    const isCaptain = match.teamA.captainId === captainId || match.teamB.captainId === captainId
    const isTeamACaptain = match.teamA.captainId === captainId

    if (!isCaptain) {
        return (
            <Card className="p-6 bg-red-900/20 border-red-500/20">
                <p className="text-red-400">Only team captains can submit match results.</p>
            </Card>
        )
    }

    const addPlayer = (team: 'A' | 'B') => {
        const newPlayer: PlayerMatchStats = {
            userId: '',
            displayName: '',
            photoURL: '',
            kills: 0,
            deaths: 0,
            assists: 0,
            damage: 0,
            isMVP: false
        }

        if (team === 'A') {
            setTeamAPlayers([...teamAPlayers, newPlayer])
        } else {
            setTeamBPlayers([...teamBPlayers, newPlayer])
        }
    }

    const removePlayer = (team: 'A' | 'B', index: number) => {
        if (team === 'A') {
            setTeamAPlayers(teamAPlayers.filter((_, i) => i !== index))
        } else {
            setTeamBPlayers(teamBPlayers.filter((_, i) => i !== index))
        }
    }

    const updatePlayer = (team: 'A' | 'B', index: number, field: keyof PlayerMatchStats, value: any) => {
        const players = team === 'A' ? [...teamAPlayers] : [...teamBPlayers]
        players[index] = { ...players[index], [field]: value }

        if (team === 'A') {
            setTeamAPlayers(players)
        } else {
            setTeamBPlayers(players)
        }
    }

    const calculateTotalKills = (players: PlayerMatchStats[]) => {
        return players.reduce((sum, p) => sum + p.kills, 0)
    }

    const handleSubmit = async () => {
        // Validation
        if (!proofUrl.trim()) {
            toast.error('Proof screenshot/video URL is required')
            return
        }

        if (teamAPlayers.length === 0 || teamBPlayers.length === 0) {
            toast.error('Please add player stats for both teams')
            return
        }

        setSubmitting(true)

        try {
            // Calculate points
            const teamAKills = calculateTotalKills(teamAPlayers)
            const teamBKills = calculateTotalKills(teamBPlayers)

            const teamAPointsCalc = calculateTeamPoints(
                match.game,
                teamAPlacement,
                teamAKills,
                winner === 'teamA'
            )

            const teamBPointsCalc = calculateTeamPoints(
                match.game,
                teamBPlacement,
                teamBKills,
                winner === 'teamB'
            )

            await submitMatchResult(match.id, captainId, captainName, {
                winner,
                proofUrl,
                teamAStats: {
                    teamId: match.teamA.id,
                    teamName: match.teamA.name,
                    placement: teamAPlacement,
                    totalPoints: teamAPointsCalc.totalPoints,
                    placementPoints: teamAPointsCalc.placementPoints,
                    killPoints: teamAPointsCalc.killPoints,
                    players: teamAPlayers
                },
                teamBStats: {
                    teamId: match.teamB.id,
                    teamName: match.teamB.name,
                    placement: teamBPlacement,
                    totalPoints: teamBPointsCalc.totalPoints,
                    placementPoints: teamBPointsCalc.placementPoints,
                    killPoints: teamBPointsCalc.killPoints,
                    players: teamBPlayers
                }
            })

            toast.success('Match result submitted! Waiting for opponent confirmation.')
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit result')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card className="p-6 bg-zinc-900/50 border-violet-500/20">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Trophy className="text-yellow-500" />
                    Submit Match Result
                </h2>

                {/* Winner Selection */}
                <div className="mb-6">
                    <Label>Match Winner</Label>
                    <Select value={winner} onValueChange={(v: string) => setWinner(v as MatchWinner)}>
                        <SelectTrigger className="bg-black border-violet-500/20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="teamA">{match.teamA.name}</SelectItem>
                            <SelectItem value="teamB">{match.teamB.name}</SelectItem>
                            <SelectItem value="draw">Draw</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Proof URL */}
                <div className="mb-6">
                    <Label>Proof (Screenshot/Video URL) *</Label>
                    <div className="flex gap-2">
                        <Input
                            type="url"
                            placeholder="https://imgur.com/... or https://youtube.com/..."
                            value={proofUrl}
                            onChange={(e) => setProofUrl(e.target.value)}
                            className="bg-black border-violet-500/20"
                        />
                        <Button variant="outline" size="icon">
                            <Upload className="w-4 h-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Required for verification</p>
                </div>

                {/* Team A Stats */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">{match.teamA.name} Stats</h3>
                    <div className="mb-4">
                        <Label>Placement (Rank)</Label>
                        <Input
                            type="number"
                            min="1"
                            value={teamAPlacement}
                            onChange={(e) => setTeamAPlacement(parseInt(e.target.value))}
                            className="bg-black border-violet-500/20 w-32"
                        />
                    </div>

                    <div className="space-y-3">
                        {teamAPlayers.map((player, index) => (
                            <Card key={index} className="p-4 bg-black/50 border-zinc-700">
                                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                                    <Input
                                        placeholder="Player Name"
                                        value={player.displayName}
                                        onChange={(e) => updatePlayer('A', index, 'displayName', e.target.value)}
                                        className="bg-zinc-900 border-zinc-700"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Kills"
                                        value={player.kills}
                                        onChange={(e) => updatePlayer('A', index, 'kills', parseInt(e.target.value) || 0)}
                                        className="bg-zinc-900 border-zinc-700"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Deaths"
                                        value={player.deaths}
                                        onChange={(e) => updatePlayer('A', index, 'deaths', parseInt(e.target.value) || 0)}
                                        className="bg-zinc-900 border-zinc-700"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Assists"
                                        value={player.assists}
                                        onChange={(e) => updatePlayer('A', index, 'assists', parseInt(e.target.value) || 0)}
                                        className="bg-zinc-900 border-zinc-700"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Damage"
                                        value={player.damage || 0}
                                        onChange={(e) => updatePlayer('A', index, 'damage', parseInt(e.target.value) || 0)}
                                        className="bg-zinc-900 border-zinc-700"
                                    />
                                    <Button variant="destructive" size="icon" onClick={() => removePlayer('A', index)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                        <Button variant="outline" onClick={() => addPlayer('A')} className="w-full">
                            <Plus className="w-4 h-4 mr-2" /> Add Player
                        </Button>
                    </div>
                </div>

                {/* Team B Stats */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">{match.teamB.name} Stats</h3>
                    <div className="mb-4">
                        <Label>Placement (Rank)</Label>
                        <Input
                            type="number"
                            min="1"
                            value={teamBPlacement}
                            onChange={(e) => setTeamBPlacement(parseInt(e.target.value))}
                            className="bg-black border-violet-500/20 w-32"
                        />
                    </div>

                    <div className="space-y-3">
                        {teamBPlayers.map((player, index) => (
                            <Card key={index} className="p-4 bg-black/50 border-zinc-700">
                                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                                    <Input
                                        placeholder="Player Name"
                                        value={player.displayName}
                                        onChange={(e) => updatePlayer('B', index, 'displayName', e.target.value)}
                                        className="bg-zinc-900 border-zinc-700"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Kills"
                                        value={player.kills}
                                        onChange={(e) => updatePlayer('B', index, 'kills', parseInt(e.target.value) || 0)}
                                        className="bg-zinc-900 border-zinc-700"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Deaths"
                                        value={player.deaths}
                                        onChange={(e) => updatePlayer('B', index, 'deaths', parseInt(e.target.value) || 0)}
                                        className="bg-zinc-900 border-zinc-700"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Assists"
                                        value={player.assists}
                                        onChange={(e) => updatePlayer('B', index, 'assists', parseInt(e.target.value) || 0)}
                                        className="bg-zinc-900 border-zinc-700"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Damage"
                                        value={player.damage || 0}
                                        onChange={(e) => updatePlayer('B', index, 'damage', parseInt(e.target.value) || 0)}
                                        className="bg-zinc-900 border-zinc-700"
                                    />
                                    <Button variant="destructive" size="icon" onClick={() => removePlayer('B', index)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                        <Button variant="outline" onClick={() => addPlayer('B')} className="w-full">
                            <Plus className="w-4 h-4 mr-2" /> Add Player
                        </Button>
                    </div>
                </div>

                {/* Submit Button */}
                <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full bg-violet-600 hover:bg-violet-700"
                    size="lg"
                >
                    {submitting ? 'Submitting...' : 'Submit Match Result'}
                </Button>
            </Card>
        </div>
    )
}
