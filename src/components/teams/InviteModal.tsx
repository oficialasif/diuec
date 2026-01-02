'use client'

import { useState } from 'react'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { sendTeamInvite } from '@/lib/services'
import { X, Mail, Check } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import toast from 'react-hot-toast'

interface InviteModalProps {
    isOpen: boolean
    onClose: () => void
    teamId: string
}

export default function InviteModal({ isOpen, onClose, teamId }: InviteModalProps) {
    const { user } = useAuth()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    if (!isOpen || !user) return null

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await sendTeamInvite(teamId, email, user.uid)
            toast.success('Invite sent successfully!')
            setEmail('')
            onClose()
        } catch (error: any) {
            toast.error(error.message || 'Failed to send invite')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-500 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-violet-500" />
                    Invite Member
                </h2>

                <p className="text-gray-400 text-sm mb-6">
                    Enter the email address of the player you want to invite. They must have an account to join.
                </p>

                <form onSubmit={handleInvite} className="space-y-4">
                    <Input
                        type="email"
                        placeholder="player@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-black border-zinc-700"
                        required
                    />
                    <div className="flex gap-3 justify-end">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-violet-600 hover:bg-violet-700" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Invite'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
