'use client'

import { useState, useEffect } from 'react'
import { Tournament, Match, TournamentRegistration } from '@/lib/models'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getTeam, getUserProfile, getTournamentGroups } from '@/lib/services'
import { getValidImageUrl } from '@/lib/utils/image'
import Image from 'next/image'
import { Calendar, Trophy, FileText, Map, Crosshair, Medal } from 'lucide-react'
import { motion } from 'framer-motion'

interface BattleRoyaleViewProps {
    tournament: Tournament
    matches: Match[]
    activeTab: 'schedule' | 'rank' | 'rules'
}

interface TeamStats {
    id: string
    name: string
    logo: string
    matches: number
    wwcd: number // Rank 1 count
    elims: number
    placementPts: number
    totalPts: number
}

export function BattleRoyaleView({ tournament, matches, activeTab }: BattleRoyaleViewProps) {
    const [stats, setStats] = useState<TeamStats[]>([])
    const [loadingStats, setLoadingStats] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState<string>('ALL')

    // Extract unique groups from matches
    const groups = Array.from(new Set(matches.map(m => m.group).filter((g): g is string => !!g))).sort()

    useEffect(() => {
        if (activeTab === 'rank') {
            calculateStandings()
        }
    }, [activeTab, matches, selectedGroup]) // Re-run when group changes

    const calculateStandings = async () => {
        setLoadingStats(true)
        const statsMap: Record<string, TeamStats> = {}

        // Helper to ensure stat entry
        const ensureEntry = (id: string, name: string = 'TBD', logo: string = '') => {
            if (!statsMap[id]) {
                statsMap[id] = { id, name, logo, matches: 0, wwcd: 0, elims: 0, placementPts: 0, totalPts: 0 }
            }
        }

        // 1. Initialize... (Skipping full initialization for filtered view? No, we should probably fetch names still)
        // Optimization: If specific group selected, maybe only init teams present in that group's matches?
        // But for consistency, let's keep all regs or maybe filter if 'ALL' is not selected.
        // Actually, if we filter by Group A, we only want to show teams that played in Group A.

        try {
            // Fetch names logic remains similar, but we might filter which IDs we care about if optimizing.
            // For now, let's keep robust name fetching.
            const groupsData = await getTournamentGroups(tournament.id)
            const allRegs: TournamentRegistration[] = Object.values(groupsData).flat()

            const uniqueIds = new Set<string>()
            allRegs.forEach(reg => {
                const id = reg.teamId || reg.userId
                uniqueIds.add(id)
            })

            // Populate Map
            for (const id of Array.from(uniqueIds)) {
                ensureEntry(id)
            }

            // Apply updates (names/logos)
            const updateNames = async () => {
                for (const id of Array.from(uniqueIds)) {
                    const reg = allRegs.find(r => r.teamId === id || r.userId === id)
                    if (!reg) continue

                    if (reg.teamId) {
                        const t = await getTeam(reg.teamId)
                        if (t && statsMap[id]) {
                            statsMap[id].name = t.name
                            statsMap[id].logo = t.logo
                        }
                    } else {
                        const u = await getUserProfile(reg.userId)
                        if (u && statsMap[id]) {
                            statsMap[id].name = reg.ingameName || u.displayName || 'Player'
                            statsMap[id].logo = u.photoURL || ''
                        }
                    }
                }
                // Initial sort
                // setStats(Object.values(statsMap).sort((a, b) => b.totalPts - a.totalPts))
            }
            await updateNames() // Wait for names before final set? Or parallel? 
            // Logic in original code fired updateNames asynchronously. Let's keep it sync-ish or await it here since we want to filter after.

        } catch (e) {
            console.error("Error fetching initial groups", e)
        }

        // 2. Process Matches
        const relevantMatches = selectedGroup === 'ALL'
            ? matches
            : matches.filter(m => m.group === selectedGroup)

        relevantMatches.forEach(match => {
            if (match.status === 'completed' || match.status === 'approved') {
                match.results?.forEach((res: any) => {
                    const tid = res.teamId
                    // If team wasn't in registration list (unlikely), ensure it now
                    ensureEntry(tid)

                    statsMap[tid].matches += 1
                    statsMap[tid].elims += (res.kills || 0)
                    statsMap[tid].totalPts += (res.totalPoints || 0)

                    if (res.rank === 1) {
                        statsMap[tid].wwcd += 1
                    }

                    const killPts = (res.kills || 0) * (tournament.pointsSystem?.killPoints || 1)
                    statsMap[tid].placementPts += ((res.totalPoints || 0) - killPts)
                })
            }
        })

        // Filter out teams with 0 matches IF a specific group is selected? 
        // Or keep all? 
        // If I select 'Group A', I don't want to see "Team Z" who is in Group B and has 0 pts in Group A.
        // So filter by matches > 0 if selectedGroup !== 'ALL'

        let finalStats = Object.values(statsMap)

        if (selectedGroup !== 'ALL') {
            finalStats = finalStats.filter(s => s.matches > 0)
        } else {
            // For ALL, maybe we only show teams that have > 0 points or matches? 
            // Or keep all regs. User might want to see who hasn't played.
            // Let's keep all for ALL.
        }

        setStats(finalStats.sort((a, b) => b.totalPts - a.totalPts))
        setLoadingStats(false)
    }

    // ... format helpers ...
    const formatDate = (dateVal: any) => {
        if (!dateVal) return 'TBA'
        const d = dateVal.toDate ? dateVal.toDate() : new Date(dateVal)
        return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })
    }

    const formatTime = (dateVal: any) => {
        if (!dateVal) return ''
        const d = dateVal.toDate ? dateVal.toDate() : new Date(dateVal)
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    }

    return (
        <div className="w-full">
            {/* Content */}
            <div className="min-h-[400px]">
                {/* ... schedule ... */}
                {activeTab === 'schedule' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden rounded-xl border border-zinc-800">
                        <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
                            <span className="text-gray-400 font-mono text-sm">Current time zone: UTC+6</span>
                            {/* Schedule Group Filter Optional? Maybe later. */}
                        </div>
                        <Table>
                            {/* ... table ... */}
                            <TableHeader className="bg-zinc-900">
                                <TableRow className="border-zinc-800 hover:bg-zinc-900">
                                    <TableHead className="text-center text-gray-400 font-bold uppercase w-20">Match</TableHead>
                                    <TableHead className="text-center text-gray-400 font-bold uppercase">Start Time</TableHead>
                                    <TableHead className="text-center text-gray-400 font-bold uppercase">Date</TableHead>
                                    <TableHead className="text-center text-gray-400 font-bold uppercase">Map</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-zinc-900/50">
                                {matches.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">No matches scheduled yet.</TableCell>
                                    </TableRow>
                                ) : (
                                    matches.map((match) => (
                                        <TableRow key={match.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                                            <TableCell className="text-center font-bold text-white text-lg">{match.matchNumber}</TableCell>
                                            <TableCell className="text-center font-mono text-gray-300 text-lg">
                                                {formatTime(match.scheduledAt) || '--:--'}
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-gray-300 text-lg">
                                                {formatDate(match.scheduledAt)}
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-white">
                                                {/* Check if map exists in match, otherwise use group or placeholder */}
                                                {(match as any).map || 'TBA'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </motion.div>
                )}

                {activeTab === 'rules' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <FileText className="text-yellow-500" />
                                Tournament Rules
                            </h3>
                            <div className="space-y-4">
                                {tournament.rules && tournament.rules.length > 0 ? (
                                    <ul className="space-y-3">
                                        {tournament.rules.map((rule, idx) => (
                                            <li key={idx} className="flex gap-3 text-gray-300 leading-relaxed bg-zinc-900 p-3 rounded-lg border border-zinc-800/50">
                                                <span className="font-mono text-yellow-500/50 font-bold shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                                                {rule}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 italic">No rules specified for this tournament.</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'rank' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-yellow-500 uppercase tracking-widest">
                                    {selectedGroup === 'ALL' ? 'Overall Standings' : `Group ${selectedGroup} Standings`}
                                </h3>
                            </div>

                            {/* Group Filter */}
                            {groups.length > 0 && (
                                <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                                    <button
                                        onClick={() => setSelectedGroup('ALL')}
                                        className={`px-3 py-1 text-sm font-medium rounded transition-all ${selectedGroup === 'ALL' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        All
                                    </button>
                                    {groups.map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setSelectedGroup(g)}
                                            className={`px-3 py-1 text-sm font-medium rounded transition-all ${selectedGroup === g ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            Group {g}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="text-xs text-gray-500 font-mono mb-2 text-right">
                            Updated after Match {matches.filter(m => (m.status === 'completed' || m.status === 'approved') && (selectedGroup === 'ALL' || m.group === selectedGroup)).length}
                        </div>

                        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                            <Table>
                                <TableHeader className="bg-zinc-950">
                                    <TableRow className="border-zinc-800 hover:bg-zinc-950">
                                        <TableHead className="text-center text-gray-400 font-bold uppercase w-16">Rank</TableHead>
                                        <TableHead className="text-left text-gray-400 font-bold uppercase">Team Name</TableHead>
                                        <TableHead className="text-center text-gray-400 font-bold uppercase w-24">Matches</TableHead>
                                        <TableHead className="text-center text-gray-400 font-bold uppercase w-24">WWCD</TableHead>
                                        <TableHead className="text-center text-gray-400 font-bold uppercase w-24">Elims</TableHead>
                                        <TableHead className="text-center text-gray-400 font-bold uppercase w-24">Placement</TableHead>
                                        <TableHead className="text-center text-yellow-500 font-bold uppercase w-24">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingStats ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                                                    Calculating Points...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : stats.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-32 text-center text-gray-500 italic">
                                                No matches played yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        stats.map((team, index) => (
                                            <TableRow key={team.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                                                <TableCell className="text-center font-mono font-bold text-white text-lg">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-10 h-10 bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                                                            {team.logo && <Image src={getValidImageUrl(team.logo)} alt={team.name} fill className="object-cover" />}
                                                        </div>
                                                        <span className="font-bold text-white text-lg">{team.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center font-medium text-gray-300">{team.matches}</TableCell>
                                                <TableCell className="text-center font-medium text-gray-300">{team.wwcd}</TableCell>
                                                <TableCell className="text-center font-medium text-gray-300">{team.elims}</TableCell>
                                                <TableCell className="text-center font-medium text-gray-300">{Math.round(team.placementPts)}</TableCell>
                                                <TableCell className="text-center font-black text-yellow-500 text-xl">{team.totalPts}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
