'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus, CheckCircle, XCircle, Clock, Mail, Smartphone, TrendingUp, Award } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getJoinRequestsByTeam } from '@/lib/team-helpers'
import { acceptJoinRequest, rejectJoinRequest } from '@/lib/services'
import { JoinRequest } from '@/lib/models'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { getValidImageUrl } from '@/lib/utils/image'

interface JoinRequestsProps {
    teamId: string
    isCaptain: boolean
}

export default function TeamJoinRequests({ teamId, isCaptain }: JoinRequestsProps) {
    const [requests, setRequests] = useState<JoinRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)

    useEffect(() => {
        console.log('TeamJoinRequests component mounted for team:', teamId, 'isCaptain:', isCaptain)
        fetchRequests()
    }, [teamId])

    const fetchRequests = async () => {
        console.log('Fetching requests...')
        try {
            const data = await getJoinRequestsByTeam(teamId)
            console.log('Received requests:', data)
            setRequests(data)
        } catch (error) {
            console.error('Error fetching join requests:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAccept = async (requestId: string) => {
        setProcessingId(requestId)
        try {
            await acceptJoinRequest(requestId)
            toast.success('Request accepted!')
            fetchRequests()
        } catch (error: any) {
            toast.error(error.message || 'Failed to accept request')
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (requestId: string) => {
        setProcessingId(requestId)
        try {
            await rejectJoinRequest(requestId)
            toast.success('Request rejected')
            fetchRequests()
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject request')
        } finally {
            setProcessingId(null)
        }
    }

    if (!isCaptain) {
        return null
    }

    if (loading) {
        return (
            <Card className="p-6 bg-zinc-900/50 border-violet-500/20">
                <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-t-2 border-violet-500 rounded-full animate-spin" />
                </div>
            </Card>
        )
    }

    return (
        <Card className="p-6 bg-zinc-900/50 border-violet-500/20">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <UserPlus className="text-violet-400" />
                    Join Requests
                </h3>
                {requests.length > 0 && (
                    <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">
                        {requests.length} Pending
                    </Badge>
                )}
            </div>

            {requests.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No pending join requests</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div
                            key={request.id}
                            className="bg-black/50 border border-zinc-700 rounded-lg p-4 hover:border-violet-500/30 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                                    <Image
                                        src={getValidImageUrl(request.userPhotoURL, 'avatar')}
                                        alt={request.userDisplayName}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold text-white">{request.userDisplayName}</h4>
                                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                            {request.playingLevel}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <Mail className="w-3 h-3" />
                                            <span className="truncate">{request.diuId}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <Smartphone className="w-3 h-3" />
                                            <span>{request.deviceType}</span>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <p className="text-xs text-gray-500 mb-1">Experience:</p>
                                        <p className="text-sm text-gray-300 line-clamp-2">{request.experience}</p>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        <span>
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => handleAccept(request.id)}
                                        disabled={processingId === request.id}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Accept
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleReject(request.id)}
                                        disabled={processingId === request.id}
                                    >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    )
}
