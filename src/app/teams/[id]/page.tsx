'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getTeam } from '@/lib/services'
import { Team } from '@/lib/models'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/shared/ui/button'
import { Users, Trophy, Calendar, Shield, Sword } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import React from 'react'
import { getValidImageUrl } from '@/lib/utils/image'
import JoinTeamDialog from '@/components/teams/JoinTeamDialog'

export default function TeamDetailsPage() {
    const params = useParams()
    const { user } = useAuth()
    const [team, setTeam] = useState<Team | null>(null)
    const [loading, setLoading] = useState(true)
    const [showJoinDialog, setShowJoinDialog] = useState(false)

    // Use useEffect to unwrap params correctly
    const teamId = params?.id as string

    useEffect(() => {
        async function fetchTeam() {
            if (!teamId) return
            try {
                const data = await getTeam(teamId)
                setTeam(data)
            } catch (error) {
                console.error('Error fetching team:', error)
                toast.error('Failed to load team details')
            } finally {
                setLoading(false)
            }
        }
        fetchTeam()
    }, [teamId])

    const handleJoinSuccess = async () => {
        if (!team) return
        // Refresh team data
        try {
            const updatedTeam = await getTeam(team.id)
            setTeam(updatedTeam)
        } catch (error) {
            console.error('Error refreshing team:', error)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500"></div>
            </div>
        )
    }

    if (!team) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Team Not Found</h1>
                    <p className="text-gray-400">The team you're looking for doesn't exist.</p>
                </div>
            </div>
        )
    }

    const isMember = user && team.memberIds?.includes(user.uid)

    return (
        <div className="min-h-screen bg-black text-white pt-16">
            {/* Header Banner */}
            <div className="h-64 bg-gradient-to-b from-violet-900/20 to-black relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <div className="container mx-auto px-4 h-full flex items-end pb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full">
                        <div className="h-32 w-32 rounded-2xl border-4 border-black bg-zinc-800 relative overflow-hidden shadow-2xl -mb-4 md:mb-0">
                            <Image
                                src={team.logo}
                                alt={team.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <h1 className="text-4xl font-bold">{team.name}</h1>
                                <span className="bg-zinc-800 px-3 py-1 rounded text-lg font-mono text-gray-300">[{team.tag}]</span>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Shield className="w-4 h-4 text-violet-500" /> {team.game}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4 text-blue-500" /> {team.members.length} Members
                                </span>
                                <span className="flex items-center gap-1">
                                    <Trophy className="w-4 h-4 text-yellow-500" /> {team.stats?.wins || 0} Wins
                                </span>
                            </div>
                        </div>

                        <div className="mb-4 md:mb-0">
                            {!isMember ? (
                                <Button
                                    onClick={() => user ? setShowJoinDialog(true) : toast.error('Please sign in to join')}
                                    className="bg-violet-600 hover:bg-violet-700 px-8"
                                >
                                    Request to Join
                                </Button>
                            ) : (
                                <Button variant="outline" className="border-green-500 text-green-400 bg-green-500/10 cursor-default">
                                    Member
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content: Roster */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Users className="text-violet-500" /> Active Roster
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {team.members.map((member) => (
                                <div key={member.userId} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-center gap-4 hover:border-violet-500/30 transition-all">
                                    <div className="h-12 w-12 rounded-full relative overflow-hidden bg-zinc-800">
                                        <Image
                                            src={getValidImageUrl(member.photoURL)} // Assuming you have an image utility
                                            alt={member.displayName || 'User'}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{member.displayName}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${member.role === 'captain' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                'bg-zinc-800 text-gray-400'
                                                }`}>
                                                {member.role}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Since {new Date(
                                                    typeof member.joinedAt === 'object' && member.joinedAt && 'seconds' in member.joinedAt
                                                        ? (member.joinedAt as any).seconds * 1000
                                                        : member.joinedAt
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">About</h2>
                        <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl text-gray-300 leading-relaxed">
                            {team.description || "No description provided."}
                        </div>
                    </section>
                </div>

                {/* Sidebar: Stats */}
                <div className="space-y-6">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Sword className="text-red-500" /> Match Stats
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                                <span className="text-gray-400">Matches Played</span>
                                <span className="font-mono">{team.stats?.matchesPlayed || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                                <span className="text-gray-400">Wins</span>
                                <span className="font-mono text-green-400">{team.stats?.wins || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                                <span className="text-gray-400">Losses</span>
                                <span className="font-mono text-red-400">{team.stats?.losses || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-400">Win Rate</span>
                                <span className="font-bold text-violet-400">
                                    {team.stats?.matchesPlayed > 0
                                        ? Math.round((team.stats.wins / team.stats.matchesPlayed) * 100) + '%'
                                        : '0%'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Join Team Dialog */}
            {user && team && (
                <JoinTeamDialog
                    isOpen={showJoinDialog}
                    onClose={() => setShowJoinDialog(false)}
                    teamId={team.id}
                    teamName={team.name}
                    gameName={team.game}
                    userId={user.uid}
                    onSuccess={handleJoinSuccess}
                />
            )}
        </div>
    )
}
