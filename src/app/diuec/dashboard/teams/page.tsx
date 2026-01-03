'use client'

import { useState, useEffect } from 'react'
import { getAllTeamsAdmin, getAllJoinRequests } from '@/lib/admin-services'
import { acceptJoinRequest, rejectJoinRequest, deleteTeam } from '@/lib/services'
import { Shield, Users, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { getValidImageUrl } from '@/lib/utils/image'

export default function TeamsPage() {
    const [teams, setTeams] = useState<any[]>([])
    const [joinRequests, setJoinRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'teams' | 'requests'>('teams')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        const [teamsData, requestsData] = await Promise.all([
            getAllTeamsAdmin(),
            getAllJoinRequests()
        ])
        setTeams(teamsData)
        setJoinRequests(requestsData)
        setLoading(false)
    }

    const handleAcceptRequest = async (requestId: string) => {
        try {
            await acceptJoinRequest(requestId)
            toast.success('Request accepted')
            fetchData()
        } catch (error: any) {
            toast.error(error.message || 'Failed to accept request')
        }
    }

    const handleRejectRequest = async (requestId: string) => {
        try {
            await rejectJoinRequest(requestId)
            toast.success('Request rejected')
            fetchData()
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject request')
        }
    }

    const handleDeleteTeam = async (teamId: string) => {
        try {
            await deleteTeam(teamId)
            toast.success('Team deleted successfully')
            fetchData() // Refresh list
        } catch (error: any) {
            console.error('Delete error:', error)
            toast.error(error.message || 'Failed to delete team')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-t-2 border-violet-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Team Management</h1>
                <p className="text-gray-400">Manage teams and join requests</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-zinc-800">
                <button
                    onClick={() => setActiveTab('teams')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'teams'
                        ? 'border-violet-500 text-white'
                        : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                >
                    All Teams ({teams.length})
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'requests'
                        ? 'border-violet-500 text-white'
                        : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                >
                    Join Requests ({joinRequests.length})
                </button>
            </div>

            {/* Teams Tab */}
            {activeTab === 'teams' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                        <div key={team.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-800">
                                        <Image
                                            src={getValidImageUrl(team.logo, 'avatar')}
                                            alt={team.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{team.name}</h3>
                                        <p className="text-sm text-gray-400">[{team.tag}]</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Game:</span>
                                        <span className="text-white">{team.game}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Members:</span>
                                        <span className="text-white">{team.members?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">W/L:</span>
                                        <span className="text-white">{team.stats?.wins || 0}/{team.stats?.losses || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-end">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        if (confirm(`Are you sure you want to delete ${team.name}? This cannot be undone.`)) {
                                            handleDeleteTeam(team.id)
                                        }
                                    }}
                                    className="bg-red-900/20 text-red-500 hover:bg-red-900/40 hover:text-red-400 border border-red-900/50"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Team
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Join Requests Tab */}
            {activeTab === 'requests' && (
                <div className="space-y-4">
                    {joinRequests.map((request) => (
                        <div key={request.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-800">
                                        <Image
                                            src={getValidImageUrl(request.userPhotoURL, 'avatar')}
                                            alt={request.userDisplayName}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">{request.userDisplayName}</h4>
                                        <p className="text-sm text-gray-400">wants to join {request.teamName}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                            <span>Level: {request.playingLevel}</span>
                                            <span>Device: {request.deviceType}</span>
                                            <span>DIU ID: {request.diuId}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => handleAcceptRequest(request.id)}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Accept
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleRejectRequest(request.id)}
                                    >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {joinRequests.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No pending join requests
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
