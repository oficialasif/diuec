import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { finalizeBattleRoyaleMatch, getTeam } from '@/lib/services'
import { Match } from '@/lib/models'
import toast from 'react-hot-toast'
import { Loader2, Check, AlertCircle } from 'lucide-react'

interface BattleRoyaleResultEditorProps {
    isOpen: boolean
    onClose: () => void
    match: Match
    onSuccess: () => void
}

interface TeamRow {
    teamId: string
    teamName: string
    rank: number | ''
    kills: number | ''
    submission?: {
        rank: number
        kills: number
        proofUrl: string
    }
}

export function BattleRoyaleResultEditor({ isOpen, onClose, match, onSuccess }: BattleRoyaleResultEditorProps) {
    const [rows, setRows] = useState<TeamRow[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!isOpen || !match) return

        const fetchParticipants = async () => {
            setLoading(true)
            try {
                // Determine participants
                // If participants array exists (Team IDs)
                const pIds = match.participants || []

                // Fetch team names
                const promises = pIds.map(async (tid) => {
                    // Try to find submission
                    const sub = match.submissions?.find(s => s.teamId === tid)

                    let name = 'Unknown Team'
                    try {
                        const t = await getTeam(tid)
                        if (t) name = t.name
                    } catch { }

                    return {
                        teamId: tid,
                        teamName: name,
                        rank: sub ? sub.rank : '',
                        kills: sub ? sub.kills : '',
                        submission: sub ? { rank: sub.rank!, kills: sub.kills!, proofUrl: sub.proofUrl } : undefined
                    } as TeamRow
                })

                const data = await Promise.all(promises)
                // Sort by Rank if available, else name
                data.sort((a, b) => {
                    if (a.rank && b.rank) return (a.rank as number) - (b.rank as number)
                    return a.teamName.localeCompare(b.teamName)
                })
                setRows(data)
            } catch (e) {
                console.error(e)
                toast.error('Failed to load participants')
            } finally {
                setLoading(false)
            }
        }
        fetchParticipants()
    }, [isOpen, match])

    const handleSave = async () => {
        // Validate
        // Ensure all have rank? Or allow partial?
        // Usually essential to have all ranks for point calc.
        // But maybe some teams absent?
        // Let's warn if incomplete.
        const incomplete = rows.some(r => r.rank === '' || r.kills === '')
        if (incomplete) {
            if (!confirm('Some teams have missing Rank or Kills. Continue?')) return
        }

        // Check for duplicate ranks
        const ranks = rows.map(r => r.rank).filter(r => r !== '')
        const uniqueRanks = new Set(ranks)
        if (ranks.length !== uniqueRanks.size) {
            toast.error('Duplicate ranks detected!')
            return
        }

        setSaving(true)
        try {
            const results = rows.map(r => ({
                teamId: r.teamId,
                rank: Number(r.rank) || 99, // 99 for absent/unknown
                kills: Number(r.kills) || 0
            }))

            await finalizeBattleRoyaleMatch(match.id, results)
            toast.success('Match Finalized!')
            onSuccess()
            onClose()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setSaving(false)
        }
    }

    const updateRow = (index: number, field: 'rank' | 'kills', value: string) => {
        const newRows = [...rows]
        const num = parseInt(value)
        newRows[index] = {
            ...newRows[index],
            [field]: isNaN(num) ? '' : num
        }
        setRows(newRows)
    }

    const fillFromSubmissions = () => {
        const newRows = rows.map(r => {
            if (r.submission) {
                return { ...r, rank: r.submission.rank, kills: r.submission.kills }
            }
            return r
        })
        setRows(newRows)
        toast.success('Filled data from valid submissions')
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-4xl h-[80vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Finalize Results - Group {match.group}</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 pt-0">
                    <div className="flex justify-end mb-4">
                        <Button variant="outline" size="sm" onClick={fillFromSubmissions} className="gap-2">
                            <Check className="w-4 h-4" /> Auto-fill from Submissions
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <div className="border border-zinc-800 rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader className="bg-zinc-950">
                                    <TableRow>
                                        <TableHead>Team</TableHead>
                                        <TableHead className="w-32">Rank #</TableHead>
                                        <TableHead className="w-32">Kills</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row, idx) => (
                                        <TableRow key={row.teamId} className="border-zinc-800">
                                            <TableCell>
                                                <div className="font-medium">{row.teamName}</div>
                                                {row.submission && (
                                                    <a href={row.submission.proofUrl} target="_blank" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                                                        View Proof (Rank {row.submission.rank}, {row.submission.kills} Kills)
                                                    </a>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={row.rank}
                                                    onChange={e => updateRow(idx, 'rank', e.target.value)}
                                                    className="w-20 bg-zinc-800 border-zinc-700 text-center"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={row.kills}
                                                    onChange={e => updateRow(idx, 'kills', e.target.value)}
                                                    className="w-20 bg-zinc-800 border-zinc-700 text-center"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {row.submission && (
                                                    <AlertCircle className="w-4 h-4 text-yellow-500" title="Has Submission" />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 border-t border-zinc-800 bg-zinc-900/50">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving || loading} className="bg-violet-600 hover:bg-violet-700">
                        {saving ? 'Saving...' : 'Finalize & Publish'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
