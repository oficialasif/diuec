'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { getMyTeams } from '@/lib/services'
import { Team } from '@/lib/models'
import { Button } from '@/components/shared/ui/button'
import { Plus, Users, Trophy } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function MyTeamsPage() {
    const { user } = useAuth()
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
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
        fetchTeams()
    }, [user])

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map(team => (
                        <div key={team.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-violet-500/50 transition-all">
                            <div className="h-32 bg-gradient-to-r from-violet-900/20 to-indigo-900/20 relative">
                                <div className="absolute -bottom-8 left-6">
                                    <div className="h-20 w-20 rounded-xl border-4 border-black bg-zinc-800 relative overflow-hidden">
                                        <Image
                                            src={team.logo}
                                            alt={team.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4">
                                    <span className="bg-black/50 backdrop-blur px-2 py-1 rounded text-xs font-mono text-violet-300 border border-violet-500/30">
                                        {team.game}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-10 p-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-xl font-bold">{team.name}</h3>
                                    <span className="text-gray-500 font-mono text-sm">[{team.tag}]</span>
                                </div>

                                <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                                    {team.description || 'No description provided.'}
                                </p>

                                <div className="grid grid-cols-3 gap-2 py-4 border-t border-zinc-800 mb-6">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider">Wins</div>
                                        <div className="font-bold text-green-400">{team.stats.wins}</div>
                                    </div>
                                    <div className="text-center border-l border-zinc-800">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider">Losses</div>
                                        <div className="font-bold text-red-400">{team.stats.losses}</div>
                                    </div>
                                    <div className="text-center border-l border-zinc-800">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider">Members</div>
                                        <div className="font-bold text-white">{team.members.length}</div>
                                    </div>
                                </div>

                                <Link href={`/teams/${team.id}`}>
                                    <Button className="w-full bg-zinc-800 hover:bg-zinc-700">
                                        View Roster
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
