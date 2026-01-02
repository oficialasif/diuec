'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/shared/ui/button'
import { X, Shield, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { getValidImageUrl } from '@/lib/utils/image'
import { Tournament, Team } from '@/lib/models'

interface TeamSelectionModalProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (team: Team) => void
    tournament: Tournament | null
    userTeams: Team[]
}

export function TeamSelectionModal({
    isOpen,
    onClose,
    onSelect,
    tournament,
    userTeams
}: TeamSelectionModalProps) {
    if (!isOpen || !tournament) return null

    const eligibleTeams = userTeams.filter(t => t.game === tournament.game)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-zinc-900 border border-violet-500/20 rounded-2xl w-full max-w-md overflow-hidden relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6">
                    <h2 className="text-xl font-bold mb-1">Select Team</h2>
                    <p className="text-gray-400 text-sm mb-4">
                        Register for <span className="text-violet-400">{tournament.title}</span>
                    </p>

                    <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg flex gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                        <div className="text-sm text-yellow-200">
                            <strong>Requirements:</strong>
                            <ul className="list-disc list-inside mt-1 text-yellow-200/80">
                                <li>Game: {tournament.game}</li>
                                <li>Format: {tournament.format}</li>
                                <li>Min Members: {tournament.teamSize || 'N/A'}</li>
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {eligibleTeams.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Shield className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p>You don't have any teams for {tournament.game}.</p>
                                <Button variant="ghost" className="text-violet-400 mt-2 hover:bg-violet-500/10" onClick={() => window.location.href = '/teams/create'}>Create a Team</Button>
                            </div>
                        ) : (
                            eligibleTeams.map(team => {
                                const isValidSize = !tournament.teamSize || team.members.length >= tournament.teamSize
                                return (
                                    <div
                                        key={team.id}
                                        onClick={() => isValidSize && onSelect(team)}
                                        className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${isValidSize
                                            ? 'bg-zinc-800/50 border-zinc-700 hover:border-violet-500 cursor-pointer hover:bg-zinc-800'
                                            : 'bg-red-900/10 border-red-900/30 opacity-60 cursor-not-allowed'
                                            }`}
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-zinc-900 relative overflow-hidden">
                                            <Image src={getValidImageUrl(team.logo)} alt={team.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-semibold text-white">{team.name}</h4>
                                                <span className="text-xs font-mono text-gray-500">[{team.tag}]</span>
                                            </div>
                                            <div className="flex gap-2 text-xs text-gray-400 mt-0.5">
                                                <span>{team.members.length} Members</span>
                                                {!isValidSize && <span className="text-red-400 font-medium">Need {tournament.teamSize}+</span>}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
