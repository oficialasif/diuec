import { useEffect, useState } from 'react'
import { getTournament, getTournamentGroups, getTeam, getUserProfile } from '@/lib/services'
import { TournamentRegistration, Team, UserProfile } from '@/lib/models'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Shield } from 'lucide-react'
import { getValidImageUrl } from '@/lib/utils/image'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface GroupsDisplayProps {
    tournamentId: string
    refreshTrigger?: number
}

interface TeamStats {
    mp: number
    w: number
    l: number
    d: number
    gf: number
    ga: number
    gd: number
    pts: number
}

// Sub-component for individual participant row
function GroupRow({ reg, index, stats, isFootball }: { reg: TournamentRegistration, index: number, stats?: TeamStats, isFootball?: boolean }) {
    const [name, setName] = useState('Loading...')
    const [img, setImg] = useState<string | null>(null)

    useEffect(() => {
        const fetchDetails = async () => {
            if (reg.teamId) {
                const team = await getTeam(reg.teamId)
                if (team) {
                    setName(team.name)
                    setImg(team.logo)
                }
            } else {
                if (reg.ingameName) {
                    setName(reg.ingameName)
                    try {
                        const u = await getUserProfile(reg.userId)
                        setImg(u?.photoURL || null)
                    } catch { }
                } else {
                    const u = await getUserProfile(reg.userId)
                    if (u) {
                        setName(u.displayName)
                        setImg(u.photoURL)
                    }
                }
            }
        }
        fetchDetails()
    }, [reg])

    return (
        <TableRow className="border-b border-white/5 hover:bg-white/5 transition-colors">
            <TableCell className="font-medium text-gray-400 w-12 text-center">{index + 1}</TableCell>
            <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 rounded bg-zinc-800 border border-white/10">
                        <AvatarImage src={img || undefined} />
                        <AvatarFallback className="bg-zinc-800 text-xs">{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-gray-200">{name}</span>
                </div>
            </TableCell>
            <TableCell className="text-center text-gray-400">{stats?.mp || 0}</TableCell>
            <TableCell className="text-center text-gray-400">{stats?.w || 0}</TableCell>
            {isFootball && <TableCell className="text-center text-gray-400">{stats?.d || 0}</TableCell>}
            <TableCell className="text-center text-gray-400">{stats?.l || 0}</TableCell>
            {isFootball && (
                <>
                    <TableCell className="text-center text-gray-400 hidden md:table-cell">{stats?.gf || 0}</TableCell>
                    <TableCell className="text-center text-gray-400 hidden md:table-cell">{stats?.ga || 0}</TableCell>
                    <TableCell className="text-center text-gray-400 font-medium">{stats?.gd || 0}</TableCell>
                </>
            )}
            <TableCell className="text-center font-bold text-violet-400">{stats?.pts || 0}</TableCell>
        </TableRow>
    )
}

export function GroupsDisplay({ tournamentId, refreshTrigger }: GroupsDisplayProps) {
    const [groups, setGroups] = useState<Record<string, TournamentRegistration[]>>({})
    const [statsMap, setStatsMap] = useState<Record<string, TeamStats>>({})
    const [loading, setLoading] = useState(true)
    const [isFootball, setIsFootball] = useState(false)

    useEffect(() => {
        const fetch = async () => {
            setLoading(true)
            try {
                const t = await getTournament(tournamentId)
                if (t && (t.game === 'EFOOTBALL' || t.game === 'FIFA' || t.title.toLowerCase().includes('football'))) {
                    setIsFootball(true)
                }

                const g = await getTournamentGroups(tournamentId)
                setGroups(g)

                const q = query(
                    collection(db, 'matches_detailed'),
                    where('tournamentId', '==', tournamentId)
                )
                const mSnap = await getDocs(q)

                const newStats: Record<string, TeamStats> = {}

                // Initialize stats for every reg
                Object.values(g).flat().forEach(reg => {
                    const id = reg.teamId || reg.userId
                    if (id) {
                        newStats[id] = { mp: 0, w: 0, l: 0, d: 0, gf: 0, ga: 0, gd: 0, pts: 0 }
                    }
                })

                mSnap.docs.forEach(doc => {
                    const m = doc.data()
                    if (m.status === 'completed' || m.status === 'approved') {
                        if (m.type === 'BATTLE_ROYALE') {
                            m.results?.forEach((res: any) => {
                                const tid = res.teamId
                                if (newStats[tid]) {
                                    newStats[tid].mp += 1
                                    newStats[tid].pts += res.totalPoints || 0
                                    if (res.rank === 1) newStats[tid].w += 1
                                    else newStats[tid].l += 1
                                }
                            })
                        } else {
                            const idA = m.teamA?.id
                            const idB = m.teamB?.id
                            const winnerId = m.result?.winnerId || m.winnerId

                            const sA = Number(m.scoreA || 0)
                            const sB = Number(m.scoreB || 0)

                            if (idA && !newStats[idA]) newStats[idA] = { mp: 0, w: 0, l: 0, d: 0, gf: 0, ga: 0, gd: 0, pts: 0 }
                            if (idB && !newStats[idB]) newStats[idB] = { mp: 0, w: 0, l: 0, d: 0, gf: 0, ga: 0, gd: 0, pts: 0 }

                            if (idA) {
                                newStats[idA].mp += 1
                                newStats[idA].gf += sA
                                newStats[idA].ga += sB
                                newStats[idA].gd += (sA - sB)
                                if (sA > sB) {
                                    newStats[idA].w += 1
                                    newStats[idA].pts += 3
                                } else if (sA < sB) {
                                    newStats[idA].l += 1
                                } else {
                                    newStats[idA].d += 1
                                    newStats[idA].pts += 1
                                }
                            }
                            if (idB) {
                                newStats[idB].mp += 1
                                newStats[idB].gf += sB
                                newStats[idB].ga += sA
                                newStats[idB].gd += (sB - sA)
                                if (sB > sA) {
                                    newStats[idB].w += 1
                                    newStats[idB].pts += 3
                                } else if (sB < sA) {
                                    newStats[idB].l += 1
                                } else {
                                    newStats[idB].d += 1
                                    newStats[idB].pts += 1
                                }
                            }
                        }
                    }
                })

                setStatsMap(newStats)

            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [tournamentId, refreshTrigger])

    if (loading) return <div className="text-gray-500 animate-pulse">Loading groups...</div>

    const groupKeys = Object.keys(groups).sort()

    if (groupKeys.length === 0) return <div className="text-gray-500 italic">No groups generated yet.</div>

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {groupKeys.map(groupName => {
                const uniqueRegs = groups[groupName].filter((reg, index, self) =>
                    index === self.findIndex((t) => (
                        t.id === reg.id
                    ))
                )

                uniqueRegs.sort((a, b) => {
                    const idA = a.teamId || a.userId
                    const idB = b.teamId || b.userId
                    const statA = (idA && statsMap[idA])
                    const statB = (idB && statsMap[idB])

                    if (!statA) return 1
                    if (!statB) return -1

                    if (statB.pts !== statA.pts) return statB.pts - statA.pts
                    if (isFootball) {
                        if (statB.gd !== statA.gd) return statB.gd - statA.gd
                        return statB.gf - statA.gf
                    }
                    return 0
                })

                return (
                    <div key={groupName} className="flex flex-col gap-4">
                        <div className={`flex items-center gap-3 bg-gradient-to-r ${groupName === 'Unassigned' ? 'from-zinc-800' : 'from-violet-900/50'} to-transparent p-3 rounded-lg border-l-4 ${groupName === 'Unassigned' ? 'border-zinc-500' : 'border-violet-500'}`}>
                            <div className={`w-8 h-8 rounded-full ${groupName === 'Unassigned' ? 'bg-zinc-700' : 'bg-violet-600'} flex items-center justify-center font-bold text-white shadow-lg`}>
                                {groupName === 'Unassigned' ? '?' : groupName}
                            </div>
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                                {groupName === 'Unassigned' ? 'Unassigned Participants' : `Group ${groupName}`}
                            </h3>
                        </div>

                        <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm">
                            <Table>
                                <TableHeader className="bg-white/5">
                                    <TableRow className="border-white/10 hover:bg-transparent">
                                        <TableHead className="w-12 text-center text-gray-500 font-bold">Pos</TableHead>
                                        <TableHead className="text-gray-500 font-bold">Team</TableHead>
                                        <TableHead className="text-center text-gray-500 font-bold w-12" title="Matches Played">MP</TableHead>
                                        <TableHead className="text-center text-gray-500 font-bold w-12" title="Won">W</TableHead>
                                        {isFootball && <TableHead className="text-center text-gray-500 font-bold w-12" title="Draw">D</TableHead>}
                                        <TableHead className="text-center text-gray-500 font-bold w-12" title="Lost">L</TableHead>
                                        {isFootball && (
                                            <>
                                                <TableHead className="text-center text-gray-500 font-bold w-12 hidden md:table-cell" title="Goals For">GF</TableHead>
                                                <TableHead className="text-center text-gray-500 font-bold w-12 hidden md:table-cell" title="Goals Against">GA</TableHead>
                                                <TableHead className="text-center text-gray-500 font-bold w-12" title="Goal Diff">GD</TableHead>
                                            </>
                                        )}
                                        <TableHead className="text-center text-violet-500 font-bold w-12" title="Points">Pts</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {uniqueRegs.map((reg, idx) => (
                                        <GroupRow
                                            key={reg.id}
                                            reg={reg}
                                            index={idx}
                                            stats={statsMap[reg.teamId || reg.userId]}
                                            isFootball={isFootball}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
