'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/shared/ui/button'
import { getUserTournamentRegistrations, getTournament } from '@/lib/services'
import { Tournament, TournamentRegistration } from '@/lib/models'
import { X, Trophy, Calendar, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface MyTournamentsModalProps {
    isOpen: boolean
    onClose: () => void
}

interface EnrichedRegistration extends TournamentRegistration {
    tournamentDetails?: Tournament | null
}

export function MyTournamentsModal({ isOpen, onClose }: MyTournamentsModalProps) {
    const [loading, setLoading] = useState(true)
    const [registrations, setRegistrations] = useState<EnrichedRegistration[]>([])
    const { user } = useAuth()
    const getMillis = (d: any) => {
        if (!d) return 0
        if (d.seconds) return d.seconds * 1000
        if (typeof d.getTime === 'function') return d.getTime()
        return 0
    }

    useEffect(() => {
        const fetchRegistrations = async () => {
            if (!user || !isOpen) return

            setLoading(true)
            try {
                const regs = await getUserTournamentRegistrations(user.uid)

                // Fetch tournament details for each registration
                const enriched = await Promise.all(regs.map(async (reg) => {
                    try {
                        const tournament = await getTournament(reg.tournamentId)
                        return { ...reg, tournamentDetails: tournament }
                    } catch (e) {
                        console.error(`Failed to load tournament ${reg.tournamentId}`, e)
                        return reg
                    }
                }))

                // Sort by date (newest first)
                enriched.sort((a, b) => {
                    const dateA = getMillis(a.tournamentDetails?.startDate)
                    const dateB = getMillis(b.tournamentDetails?.startDate)
                    return dateB - dateA
                })

                setRegistrations(enriched)
            } catch (error) {
                console.error('Error fetching registrations:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchRegistrations()
    }, [user, isOpen])

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen, onClose])

    // Prevent body scrolling
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }
        return () => { document.body.style.overflow = "auto" }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                ref={modalRef}
                className="relative w-full max-w-2xl h-[80vh] flex flex-col rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-900/50 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        My Tournaments
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="w-8 h-8 border-t-2 border-violet-500 rounded-full animate-spin"></div>
                        </div>
                    ) : registrations.length > 0 ? (
                        <div className="space-y-4">
                            {registrations.map((reg) => (
                                <Link
                                    key={reg.id}
                                    href={`/games/${reg.tournamentDetails?.game.toLowerCase() || 'pubg'}`} // Fallback or accurate link? Maybe link to specific bracket if possible? The Game Page has the bracket modal.
                                    onClick={onClose}
                                    className="block group"
                                >
                                    <div className="bg-black/40 border border-white/5 hover:border-violet-500/50 rounded-xl p-4 transition-all group-hover:bg-white/5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={cn(
                                                        "text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                                                        reg.status === 'approved' ? "bg-green-500/20 text-green-400" :
                                                            reg.status === 'pending' ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"
                                                    )}>
                                                        {reg.status}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {reg.tournamentDetails?.game}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                                                    {reg.tournamentDetails?.title || 'Unknown Tournament'}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span>
                                                            {reg.tournamentDetails?.startDate ? new Date(getMillis(reg.tournamentDetails.startDate)).toLocaleDateString() : 'TBA'}
                                                        </span>
                                                    </div>
                                                    {reg.group && (
                                                        <div className="flex items-center gap-1.5 text-violet-400">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                                            <span>Group {reg.group}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors mt-2" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trophy className="w-8 h-8 text-gray-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">No Tournaments found</h3>
                            <p className="text-gray-400 max-w-sm mx-auto mb-6">
                                You haven't joined any tournaments yet. Check out the tournaments page to register!
                            </p>
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="border-white/10 hover:bg-white/5"
                            >
                                Browse Tournaments
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
