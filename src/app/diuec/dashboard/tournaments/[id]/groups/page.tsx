'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { generateTournamentGroups, getAdminTournamentRegistrations, updateParticipantGroup, approveRegistration } from '@/lib/services'
import { GroupsDisplay } from '@/components/tournaments/GroupsDisplay'
import { TournamentRegistration } from '@/lib/models'
import { Button } from '@/components/shared/ui/button'
import { ArrowLeft, RefreshCw, Users, Save, Edit2, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function GroupsManagePage() {
    const params = useParams()
    const tournamentId = params.id as string
    const [refreshKey, setRefreshKey] = useState(0)
    const [generating, setGenerating] = useState(false)
    const [groups, setGroups] = useState<Record<string, TournamentRegistration[]>>({})
    const [hasGroups, setHasGroups] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editGroupVal, setEditGroupVal] = useState('')

    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')

    useEffect(() => {
        loadGroups()
    }, [tournamentId, refreshKey])

    const loadGroups = async () => {
        setIsLoading(true)
        try {
            // Use Admin Fetcher to see Pending too
            const g = await getAdminTournamentRegistrations(tournamentId)
            setGroups(g)
            // Check if any real groups exist (not Unassigned)
            const realGroups = Object.keys(g).filter(k => k !== 'Unassigned')
            setHasGroups(realGroups.length > 0)
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    const handleApprove = async (id: string) => {
        try {
            await approveRegistration(id)
            toast.success('Participant approved')
            setRefreshKey(prev => prev + 1)
        } catch (e: any) {
            toast.error('Failed to approve: ' + e.message)
        }
    }

    const handleGenerate = async () => {
        if (hasGroups) {
            if (!confirm('Groups already exist! CAUTION: This will overwrite current assignments and reshuffle everyone. Continue?')) return
        }

        setGenerating(true)
        try {
            await generateTournamentGroups(tournamentId)
            toast.success('Groups generated successfully!')
            setRefreshKey(prev => prev + 1)
        } catch (error: any) {
            console.error(error)
            toast.error('Failed to generate: ' + error.message)
        } finally {
            setGenerating(false)
        }
    }

    const startEdit = (reg: TournamentRegistration) => {
        setEditingId(reg.id)
        setEditGroupVal(reg.group || '')
    }

    const saveEdit = async (id: string) => {
        try {
            const newG = editGroupVal.toUpperCase()
            await updateParticipantGroup(id, newG)
            setEditingId(null)
            toast.success('Group updated')
            setRefreshKey(prev => prev + 1)
        } catch (e) {
            toast.error('Failed to update')
        }
    }

    // Flatten logic for Table View
    const allParticipants = Object.entries(groups).flatMap(([grp, regs]) =>
        regs.map(r => ({ ...r, displayGroup: grp }))
    )

    // Sort: Unassigned first, then by Group
    allParticipants.sort((a, b) => {
        if (a.displayGroup === 'Unassigned' && b.displayGroup !== 'Unassigned') return -1
        if (a.displayGroup !== 'Unassigned' && b.displayGroup === 'Unassigned') return 1
        return a.displayGroup.localeCompare(b.displayGroup)
    })

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-between">
                {/* Header Section */}
                <div className="flex items-center gap-4">
                    <Link href={`/diuec/dashboard/tournaments`}>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Users className="w-6 h-6 text-violet-500" />
                            Manage Groups
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {hasGroups ? 'Groups Generated' : 'Participants List (Pending Generation)'}
                        </p>
                    </div>
                </div>

                <Button
                    onClick={handleGenerate}
                    disabled={generating}
                    className={hasGroups ? "bg-red-600 hover:bg-red-700" : "bg-violet-600 hover:bg-violet-700"}
                >
                    {generating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    {hasGroups ? 'Regenerate Groups' : 'Generate Groups'}
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-zinc-800">
                <button
                    onClick={() => setActiveTab('editor')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'editor' ? 'border-violet-500 text-violet-500' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    List & Editor
                </button>
                <button
                    onClick={() => setActiveTab('preview')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'preview' ? 'border-violet-500 text-violet-500' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    Visual Preview
                </button>
            </div>

            {activeTab === 'editor' ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                    <Table>
                        <TableHeader className="bg-zinc-950">
                            <TableRow className="border-zinc-800">
                                <TableHead className="text-gray-400">Participant</TableHead>
                                <TableHead className="text-gray-400">Status</TableHead>
                                <TableHead className="text-gray-400">Group</TableHead>
                                <TableHead className="text-right text-gray-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">Loading...</TableCell>
                                </TableRow>
                            ) : allParticipants.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">No participants found.</TableCell>
                                </TableRow>
                            ) : (
                                allParticipants.map(reg => (
                                    <TableRow key={reg.id} className="border-zinc-800/50 hover:bg-zinc-800/50">
                                        <TableCell className="font-medium text-white">
                                            <div className="flex flex-col">
                                                <span>{reg.ingameName || reg.teamId || reg.userId}</span>
                                                <span className="text-xs text-gray-500">{reg.teamId ? 'Team' : 'Solo'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {reg.status === 'approved' ? (
                                                <span className="flex items-center gap-1 text-green-400 text-xs">
                                                    <CheckCircle className="w-3 h-3" /> Approved
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-yellow-500 text-xs">
                                                    <Clock className="w-3 h-3" /> Pending
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingId === reg.id ? (
                                                <Input
                                                    value={editGroupVal}
                                                    onChange={e => setEditGroupVal(e.target.value)}
                                                    className="w-20 h-8 bg-zinc-950 border-zinc-700"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${reg.group ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-zinc-800 text-gray-500'}`}>
                                                    {reg.group || 'Unassigned'}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right flex items-center justify-end gap-2">
                                            {reg.status !== 'approved' && (
                                                <Button size="sm" variant="ghost" onClick={() => handleApprove(reg.id)} title="Approve" className="text-yellow-500 hover:text-green-400 hover:bg-zinc-800">
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                            )}

                                            {editingId === reg.id ? (
                                                <Button size="sm" variant="ghost" onClick={() => saveEdit(reg.id)} className="text-green-400 hover:text-green-300">
                                                    <Save className="w-4 h-4" />
                                                </Button>
                                            ) : (
                                                <Button size="sm" variant="ghost" onClick={() => startEdit(reg)} className="text-gray-500 hover:text-white">
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <GroupsDisplay tournamentId={tournamentId} refreshTrigger={refreshKey} />
                </div>
            )}
        </div>
    )
}
