'use client'

import { motion } from 'framer-motion'
import { X, Trophy, Calendar, Users, Info, DollarSign, Swords } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import { Tournament } from '@/lib/models'
import { getValidImageUrl } from '@/lib/utils/image'
import Image from 'next/image'

interface TournamentDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    tournament: Tournament | null
    onRegister: () => void
    isRegistered: boolean
}

export function TournamentDetailsModal({
    isOpen,
    onClose,
    tournament,
    onRegister,
    isRegistered
}: TournamentDetailsModalProps) {
    if (!isOpen || !tournament) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]"
            >
                {/* Header Image */}
                <div className="relative h-48 w-full shrink-0">
                    <Image
                        src={getValidImageUrl(tournament.image, 'tournament')}
                        alt={tournament.title}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white transition-colors backdrop-blur-md z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-4 left-6 right-6">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase mb-2 inline-block ${tournament.status === 'upcoming' || tournament.status === 'ongoing' ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-gray-400'
                            }`}>
                            {tournament.status}
                        </span>
                        <h2 className="text-3xl font-bold text-white shadow-sm">{tournament.title}</h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Key Stats */}
                        <div className="bg-zinc-800/30 p-4 rounded-xl space-y-3 border border-zinc-800/50">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm flex items-center gap-2"><Swords className="w-4 h-4 text-violet-400" /> Game</span>
                                <span className="font-semibold">{tournament.game}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm flex items-center gap-2"><Users className="w-4 h-4 text-violet-400" /> Format</span>
                                <span className="font-semibold">{tournament.format} ({tournament.teamSize}v{tournament.teamSize})</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500" /> Prize Pool</span>
                                <span className="font-bold text-yellow-400">{tournament.prizePool}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-violet-400" /> Start Date</span>
                                <span className="font-semibold text-sm">{new Date((tournament.startDate as any).seconds * 1000).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Description or Rules */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="flex items-center gap-2 font-bold mb-2 text-white"><Info className="w-4 h-4 text-gray-400" /> Description</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {tournament.description || "No description provided."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Rules Preview (if any) */}
                    {tournament.rules && Array.isArray(tournament.rules) && tournament.rules.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-bold mb-2 text-white">Rules</h3>
                            <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                                {tournament.rules.slice(0, 3).map((rule, idx) => (
                                    <li key={idx}>{rule}</li>
                                ))}
                                {tournament.rules.length > 3 && <li>...and more</li>}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex gap-4 shrink-0">
                    {isRegistered ? (
                        <Button className="flex-1 bg-violet-900/50 text-violet-200 hover:bg-violet-900" onClick={() => window.location.href = '/tournaments'}>
                            Go to Dashboard
                        </Button>
                    ) : (
                        <Button className="flex-1 bg-violet-600 hover:bg-violet-700 font-bold" onClick={onRegister}>
                            Register Now
                        </Button>
                    )}
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
