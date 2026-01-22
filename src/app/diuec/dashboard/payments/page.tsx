'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/shared/ui/button'
import { Check, X, Search, DollarSign, Calendar, Mail } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { TournamentRegistration, Team, Tournament } from '@/lib/models'
import { getValidImageUrl } from '@/lib/utils/image'

interface PaymentRequest extends TournamentRegistration {
    team?: Team
    tournament?: Tournament
}

export default function PaymentClearancePage() {
    const [requests, setRequests] = useState<PaymentRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const fetchRequests = async () => {
        try {
            // 1. Fetch Registrations with status 'pending' (Assuming pending means payment needs review if paymentDetails exist)
            // Or fetch all pending and filter by paymentDetails existence
            const q = query(
                collection(db, 'tournament_registrations'),
                where('status', '==', 'pending'),
                orderBy('createdAt', 'desc')
            )
            const snap = await getDocs(q)

            const rawRegs = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as TournamentRegistration))

            // Filter only those with payment details
            const paymentRegs = rawRegs.filter(r => r.paymentDetails)

            // 2. Fetch related Team and Tournament info
            const enriched: PaymentRequest[] = []

            for (const reg of paymentRegs) {
                let team = undefined
                let tournament = undefined

                if (reg.teamId) {
                    const teamSnap = await getDocs(query(collection(db, 'teams'), where('id', '==', reg.teamId))) // Assuming ID query for safety or just doc get
                    // Actually simpler to use getDoc if we trust ID, but let's stick to standard patterns if unsure
                    // services.ts has getTeam(id) which uses doc get.
                    // Let's implement lightweight fetch here
                    const tRef = doc(db, 'teams', reg.teamId)
                    const tSnap = await import('firebase/firestore').then(mod => mod.getDoc(tRef))
                    if (tSnap.exists()) team = tSnap.data() as Team
                }

                if (reg.tournamentId) {
                    const tourRef = doc(db, 'tournaments', reg.tournamentId)
                    const tourSnap = await import('firebase/firestore').then(mod => mod.getDoc(tourRef))
                    if (tourSnap.exists()) tournament = tourSnap.data() as Tournament
                }

                enriched.push({ ...reg, team, tournament })
            }

            setRequests(enriched)
        } catch (error) {
            console.error("Error fetching payment requests", error)
            toast.error("Failed to load payment requests")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const handleAction = async (regId: string, action: 'approve' | 'reject') => {
        try {
            const ref = doc(db, 'tournament_registrations', regId)
            await updateDoc(ref, {
                status: action === 'approve' ? 'approved' : 'rejected'
            })

            // If approved, update registered count? 
            // In services.ts we incremented registeredTeams at creation.
            // If we reject, we should probably Decrement registeredTeams?
            // Complex logic. For now, assuming creation already reserved the slot.
            // If we reject, we ideally free the slot.
            if (action === 'reject') {
                // Find tournament ID to decrement
                const req = requests.find(r => r.id === regId)
                if (req?.tournamentId) {
                    const { increment } = await import('firebase/firestore')
                    await updateDoc(doc(db, 'tournaments', req.tournamentId), {
                        registeredTeams: increment(-1)
                    })
                }
            }

            toast.success(`Payment ${action === 'approve' ? 'Approved' : 'Rejected'}`)

            // Remove from list
            setRequests(prev => prev.filter(r => r.id !== regId))
        } catch (error) {
            console.error("Action failed", error)
            toast.error("Action failed")
        }
    }

    const filteredRequests = requests.filter(req =>
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.paymentDetails?.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.paymentDetails?.paymentNumber.includes(searchTerm) ||
        req.team?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading payment requests...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Payment Clearance</h1>
                    <p className="text-gray-400">Verify and approve tournament registration payments</p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search TrxID, Team..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredRequests.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-zinc-800 border-dashed">
                        <DollarSign className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-400">No Pending Payments</h3>
                        <p className="text-sm text-gray-600">All set! No new payments to verify.</p>
                    </div>
                ) : (
                    filteredRequests.map(req => (
                        <Card key={req.id} className="bg-zinc-900 border-zinc-800 p-6 flex flex-col lg:flex-row items-start lg:items-center gap-6">
                            {/* Team / User Info */}
                            <div className="flex items-center gap-4 min-w-[200px]">
                                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                                    {req.team ? (
                                        <Image src={getValidImageUrl(req.team.logo)} alt={req.team.name} width={48} height={48} className="object-cover w-full h-full" />
                                    ) : (
                                        <span className="text-xl font-bold text-violet-500">{req.ingameName?.charAt(0)}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{req.team ? req.team.name : req.ingameName}</h3>
                                    <p className="text-xs text-gray-500">{req.team ? 'Team' : 'Solo Player'}</p>
                                </div>
                            </div>

                            {/* Tournament Info */}
                            <div className="flex-1 min-w-[200px]">
                                <h4 className="text-sm font-medium text-gray-300">Tournament</h4>
                                <p className="text-white font-bold">{req.tournament?.title}</p>
                                <p className="text-xs text-violet-400">{req.tournament?.entryFee || 'Paid'}</p>
                            </div>

                            {/* Payment Info */}
                            <div className="flex-1 min-w-[200px] bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-gray-500 text-xs">Payment Number</p>
                                        <p className="font-mono text-white">{req.paymentDetails?.paymentNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">TrxID</p>
                                        <p className="font-mono text-green-400 font-bold">{req.paymentDetails?.transactionId}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500 text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> Captain Email</p>
                                        <p className="text-white truncate" title={req.paymentDetails?.captainEmail}>{req.paymentDetails?.captainEmail}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="text-right text-xs text-gray-500 min-w-[100px]">
                                <div className="flex items-center justify-end gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {req.paymentDetails?.submissionDate ? new Date(req.paymentDetails.submissionDate as any).toLocaleDateString() : 'N/A'}
                                </div>
                                <p>{req.paymentDetails?.submissionDate ? new Date(req.paymentDetails.submissionDate as any).toLocaleTimeString() : ''}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300" onClick={() => handleAction(req.id, 'reject')}>
                                    <X className="w-4 h-4 mr-1" /> Reject
                                </Button>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(req.id, 'approve')}>
                                    <Check className="w-4 h-4 mr-1" /> Approve
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
