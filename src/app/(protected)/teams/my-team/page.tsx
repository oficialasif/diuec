'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { getMyTeams, leaveTeam } from '@/lib/services'
import { Team } from '@/lib/models'
import { Button } from '@/components/shared/ui/button'
import { Plus, Users, Trophy, UserPlus, LogOut } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import InviteModal from '@/components/teams/InviteModal'
import JoinRequestList from '@/components/teams/JoinRequestList'
import toast from 'react-hot-toast'

export default function MyTeamsPage() {
    const { user } = useAuth()
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)
    const [inviteModalOpen, setInviteModalOpen] = useState(false)
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)

    useEffect(() => {
        fetchTeams()
    }, [user])

    async function fetchTeams() {
        if (!user) return
        try {
            const myTeams = await getMyTeams(user.uid)
            setTeams(myTeams)
        } catch (error) {
            console.error('Error fetching teams:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLeaveTeam = async (teamId: string) => {
        if (!user || !confirm('Are you sure you want to leave this team?')) return
        try {
            await leaveTeam(user.uid, teamId)
            toast.success('You have left the team')
            fetchTeams()
        } catch (error: any) {
            toast.error(error.message || 'Failed to leave team')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">My Teams</h1>
                    <p className="text-gray-400 mt-1">Manage your squads and memberships</p>
                </div>
                <Link href="/teams/create">
                    <Button className="bg-violet-600 hover:bg-violet-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Team
                    </Button>
                </Link>
            </div>

            {teams.length === 0 ? (
                <div className="text-center py-16 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                    <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">No Teams Yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        You haven't joined or created any teams yet. Create a squad to start competing!
                    </p>
                    <Link href="/teams/create">
                        <Button variant="outline" className="border-violet-500 text-violet-400 hover:bg-violet-500/10">
                            Create Your First Team
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {teams.map(team => {
                        const isCaptain = team.captainId === user?.uid
                        return (
                            <div key={team.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-violet-500/50 transition-all">
                                <div className="flex flex-col md:flex-row">
                                    {/* Team Header */}
                                    <div className="w-full md:w-1/3 h-48 md:h-auto bg-gradient-to-br from-violet-900/20 to-black relative p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-zinc-800">
                                        <div className="h-24 w-24 rounded-2xl border-2 border-violet-500/30 bg-black relative overflow-hidden mb-4">
                                            <Image
                                                src={team.logo}
                                                alt={team.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <h3 className="text-xl font-bold">{team.name}</h3>
                                        <span className="bg-zinc-800/80 px-2 py-0.5 rounded text-xs font-mono text-gray-400 mt-1">[{team.tag}]</span>
                                        <span className="text-violet-400 text-sm mt-1 flex items-center gap-1">
                                            <Trophy className="w-3 h-3" /> {team.game}
                                        </span>
                                    </div>

                                    {/* Team Actions & Stats */}
                                    <div className="flex-1 p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-1">Role</h4>
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${isCaptain ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {isCaptain ? 'CAPTAIN' : 'MEMBER'}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                {isCaptain && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedTeamId(team.id)
                                                            setInviteModalOpen(true)
                                                        }}
                                                    >
                                                        <UserPlus className="w-4 h-4 mr-2" />
                                                        Invite
                                                    </Button>
                                                )}
                                                {!isCaptain && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                        onClick={() => handleLeaveTeam(team.id)}
                                                    >
                                                        <LogOut className="w-4 h-4 mr-2" />
                                                        Leave
                                                    </Button>
                                                )}
                                                <Link href={`/teams/${team.id}`}>
                                                    <Button size="sm">
                                                        View Public Page
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-black/30 p-3 rounded-lg border border-zinc-800/50">
                                                <div className="text-xs text-gray-500">Members</div>
                                                <div className="text-xl font-bold">{team.members.length}</div>
                                            </div>
                                            <div className="bg-black/30 p-3 rounded-lg border border-zinc-800/50">
                                                <div className="text-xs text-gray-500">Record</div>
                                                <div className="text-xl font-bold text-gray-300">{team.stats.wins}W - {team.stats.losses}L</div>
                                            </div>
                                        </div>

                                        {/* Join Requests (Captain Only) */}
                                        {isCaptain && (
                                            <JoinRequestList teamId={team.id} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {selectedTeamId && (
                <InviteModal
                    isOpen={inviteModalOpen}
                    onClose={() => {
                        setInviteModalOpen(false)
                        setSelectedTeamId(null)
                    }}
                    teamId={selectedTeamId}
                />
            )}
        </div>
    )
}
