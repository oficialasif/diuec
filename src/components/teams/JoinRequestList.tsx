'use client'

import { useEffect, useState } from 'react'
import { getTeamJoinRequests, respondToJoinRequest } from '@/lib/services'
import { JoinRequest } from '@/lib/models' // Ensure this is exported from models
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shared/ui/avatar'
import { Button } from '@/components/shared/ui/button'
import { Check, X, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

interface JoinRequestListProps {
    teamId: string
}

export default function JoinRequestList({ teamId }: JoinRequestListProps) {
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchRequests = async () => {
        try {
            const data = await getTeamJoinRequests(teamId)
            setRequests(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [teamId])

    const handleRespond = async (requestId: string, status: 'accepted' | 'rejected') => {
        try {
            await respondToJoinRequest(requestId, status)
            toast.success(status === 'accepted' ? 'Member welcomed!' : 'Request rejected')
            fetchRequests() // Refresh list
        } catch (error) {
            toast.error('Action failed')
        }
    }

    if (loading) return null
    if (requests.length === 0) return null

    return (
        <div className="mt-6 border-t border-zinc-800 pt-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Pending Join Requests ({requests.length})
            </h3>
            <div className="space-y-3">
                {requests.map(req => (
                    <div key={req.id} className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={req.userPhotoURL} />
                                <AvatarFallback>{req.userDisplayName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-white">{req.userDisplayName}</p>
                                <p className="text-xs text-gray-500">Requested to join</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 border-red-900 text-red-500 hover:bg-red-900/20"
                                onClick={() => handleRespond(req.id, 'rejected')}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleRespond(req.id, 'accepted')}
                            >
                                <Check className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
