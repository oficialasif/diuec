'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/shared/ui/button'
import { X, Trophy, Calendar, Users, FileText, ExternalLink, MessageCircle, Gamepad2, Facebook } from 'lucide-react'
import Image from 'next/image'
import { getValidImageUrl } from '@/lib/utils/image'
import { Tournament } from '@/lib/models'
import Link from 'next/link'

import { GroupsDisplay } from './GroupsDisplay'
import { useState } from 'react'

interface TournamentDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    tournament: Tournament | null
    onRegister: () => void
    isRegistered: boolean
    onDashboard: () => void
}

export function TournamentDetailsModal({
    isOpen,
    onClose,
    tournament,
    onRegister,
    isRegistered,
    onDashboard
}: TournamentDetailsModalProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'groups'>('info')

    if (!isOpen || !tournament) return null

    const formatDate = (date: any) => {
        if (!date) return 'TBA'
        // Handle Firestore Timestamp or Date object
        const d = date.toDate ? date.toDate() : new Date(date)
        return d.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-sm">
            <div className="flex min-h-full items-center justify-center p-4 text-center md:p-6">

                {/* Fixed Close Button - Adjusted z-index and positioning relative to viewport for easy access */}
                <button
                    onClick={onClose}
                    className="fixed top-4 right-4 z-[70] bg-zinc-900/80 p-2 rounded-full text-white hover:bg-white hover:text-black transition-all backdrop-blur-md border border-white/10 shadow-lg md:top-6 md:right-6"
                >
                    <X className="w-6 h-6 md:w-8 md:h-8" />
                </button>

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl overflow-hidden relative shadow-2xl text-left my-8"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                >


                    {/* Banner Section */}
                    <div className="relative h-64 md:h-80 w-full">
                        <Image
                            src={getValidImageUrl(tournament.image, 'tournament')}
                            alt={tournament.title}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 p-8 w-full">
                            <div className="flex gap-2 mb-3">
                                <span className="bg-violet-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {tournament.game}
                                </span>
                                <span className="bg-zinc-800 text-gray-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-zinc-700">
                                    {tournament.format}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${tournament.status === 'upcoming' ? 'bg-blue-900/40 border-blue-500/50 text-blue-400' :
                                    tournament.status === 'ongoing' ? 'bg-green-900/40 border-green-500/50 text-green-400' :
                                        'bg-zinc-800 border-zinc-700 text-gray-500'
                                    }`}>
                                    {tournament.status}
                                </span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">{tournament.title}</h2>
                        </div>
                    </div>

                    {/* Winner Banner */}
                    {tournament.status === 'completed' && tournament.winner && (
                        <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-6 flex flex-col md:flex-row items-center justify-center gap-6 text-white border-y border-yellow-500/30">
                            <div className="bg-yellow-500/20 p-4 rounded-full ring-4 ring-yellow-500/20">
                                <Trophy className="w-12 h-12 text-yellow-200" />
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-yellow-200 text-sm font-bold uppercase tracking-widest mb-1">Tournament Champion</div>
                                <h3 className="text-3xl md:text-4xl font-black">{tournament.winner.name}</h3>
                            </div>
                            {tournament.winner.logo && (
                                <div className="w-20 h-20 rounded-full bg-black/30 relative overflow-hidden ring-4 ring-yellow-500/40">
                                    <Image src={getValidImageUrl(tournament.winner.logo, 'avatar')} alt={tournament.winner.name} fill className="object-cover" />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-zinc-800">
                        {/* Main Content */}
                        <div className="lg:col-span-2 p-6 md:p-8 space-y-8">
                            {/* Stats Grid */}
                            <div className="flex gap-4 border-b border-zinc-800 mb-6">
                                <button
                                    onClick={() => setActiveTab('info')}
                                    className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'info' ? 'text-violet-500 border-b-2 border-violet-500' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('groups')}
                                    className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'groups' ? 'text-violet-500 border-b-2 border-violet-500' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Groups
                                </button>
                            </div>

                            {activeTab === 'info' ? (
                                <div className="space-y-8 animate-in fade-in">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                                            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Prize Pool</div>
                                            <div className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                                                <Trophy className="w-5 h-5" />
                                                {tournament.prizePool}
                                            </div>
                                        </div>
                                        <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                                            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Entry Fee</div>
                                            <div className="text-xl font-bold text-white">
                                                {tournament.entryFee || 'Free'}
                                            </div>
                                        </div>
                                        <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                                            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Teams</div>
                                            <div className="text-xl font-bold text-white flex items-center gap-2">
                                                <Users className="w-5 h-5 text-blue-400" />
                                                {tournament.registeredTeams}/{tournament.maxTeams}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-3">About Tournament</h3>
                                        <div className="text-gray-400 leading-relaxed whitespace-pre-wrap">
                                            {tournament.description}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-in fade-in">
                                    <GroupsDisplay tournamentId={tournament.id} />
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="p-6 md:p-8 bg-zinc-900/50 space-y-8">
                            {/* Action Box */}
                            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-center space-y-4">
                                <div className="text-sm text-gray-400">
                                    Registration closes: <br />
                                    <span className="text-white font-medium">{formatDate(tournament.registrationEnd || tournament.startDate)}</span>
                                </div>

                                {isRegistered ? (
                                    <Button
                                        onClick={onDashboard}
                                        className="w-full bg-violet-600 hover:bg-violet-700 py-6 text-lg font-bold"
                                    >
                                        Go to Dashboard
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={onRegister}
                                        disabled={tournament.status !== 'upcoming'}
                                        className="w-full bg-white text-black hover:bg-gray-200 py-6 text-lg font-bold"
                                    >
                                        {tournament.status === 'upcoming' ? 'Register Now' : 'Registration Closed'}
                                    </Button>
                                )}
                            </div>

                            {/* Important Links */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Official Links</h3>
                                <div className="space-y-3">
                                    {tournament.rulebookLink && (
                                        <Link href={tournament.rulebookLink} target="_blank" className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-violet-500/50 transition-all group">
                                            <div className="bg-red-500/20 p-2 rounded-md text-red-500 group-hover:text-red-400">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-white">Rulebook</div>
                                                <div className="text-xs text-gray-500">View Rules & Regulations</div>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-white" />
                                        </Link>
                                    )}

                                    {tournament.discordLink && (
                                        <Link href={tournament.discordLink} target="_blank" className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-violet-500/50 transition-all group">
                                            <div className="bg-indigo-500/20 p-2 rounded-md text-indigo-500 group-hover:text-indigo-400">
                                                <Gamepad2 className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-white">Discord</div>
                                                <div className="text-xs text-gray-500">Join Community Server</div>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-white" />
                                        </Link>
                                    )}

                                    {tournament.facebookLink && (
                                        <Link href={tournament.facebookLink} target="_blank" className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-violet-500/50 transition-all group">
                                            <div className="bg-blue-500/20 p-2 rounded-md text-blue-500 group-hover:text-blue-400">
                                                <Facebook className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-white">Facebook</div>
                                                <div className="text-xs text-gray-500">Official Page/Event</div>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-white" />
                                        </Link>
                                    )}

                                    {tournament.chatGroupLink && (
                                        <Link href={tournament.chatGroupLink} target="_blank" className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-violet-500/50 transition-all group">
                                            <div className="bg-emerald-500/20 p-2 rounded-md text-emerald-500 group-hover:text-emerald-400">
                                                <MessageCircle className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-white">Group Chat</div>
                                                <div className="text-xs text-gray-500">Player Communication</div>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-white" />
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Schedule Info */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Event Schedule</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="bg-zinc-800 p-2 h-fit rounded-lg text-gray-400">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-400">Starts</div>
                                            <div className="text-white font-medium">{formatDate(tournament.startDate)}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="bg-zinc-800 p-2 h-fit rounded-lg text-gray-400">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-400">Ends</div>
                                            <div className="text-white font-medium">{formatDate(tournament.endDate)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
