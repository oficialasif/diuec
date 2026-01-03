'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { X, User } from 'lucide-react'
import { Tournament } from '@/lib/models'

interface SoloRegistrationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (ingameName: string) => void
    tournament: Tournament | null
}

export function SoloRegistrationModal({
    isOpen,
    onClose,
    onConfirm,
    tournament
}: SoloRegistrationModalProps) {
    const [ingameName, setIngameName] = useState('')

    if (!isOpen || !tournament) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (ingameName.trim()) {
            onConfirm(ingameName.trim())
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-sm overflow-hidden relative"
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-white">Solo Registration</h2>
                            <p className="text-sm text-gray-400 mt-1">Found {tournament.game}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Enter Game Username <span className="text-red-500">*</span>
                                </label>
                                <div className="relativePath">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <Input
                                        placeholder="e.g. PlayerOne"
                                        value={ingameName}
                                        onChange={(e) => setIngameName(e.target.value)}
                                        className="pl-9 bg-black border-zinc-800 focus:border-violet-500 text-white"
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    This name will be displayed in the tournament brackets.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" type="button" onClick={onClose} className="flex-1 border-zinc-700 text-gray-300">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                                disabled={!ingameName.trim()}
                            >
                                Confirm Registration
                            </Button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}
