'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input' // Assuming this exists, verify later
import { X, CreditCard, DollarSign } from 'lucide-react'
import { Tournament, Team } from '@/lib/models'

interface PaymentSubmissionModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (transactionId: string, paymentNumber: string) => void
    tournament: Tournament | null
    team: Team | null
}

export function PaymentSubmissionModal({
    isOpen,
    onClose,
    onConfirm,
    tournament,
    team
}: PaymentSubmissionModalProps) {
    const [transactionId, setTransactionId] = useState('')
    const [paymentNumber, setPaymentNumber] = useState('')
    const [error, setError] = useState('')

    if (!isOpen || !tournament) return null

    const handleSubmit = () => {
        if (!transactionId.trim() || !paymentNumber.trim()) {
            setError('Please fill in all payment details')
            return
        }
        setError('')
        onConfirm(transactionId, paymentNumber)
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
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
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Payment Required</h2>
                            <p className="text-sm text-gray-400">Complete payment to register</p>
                        </div>
                    </div>

                    <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 space-y-2 border border-zinc-800">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Tournament</span>
                            <span className="font-medium text-white">{tournament.title}</span>
                        </div>
                        {team && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Team</span>
                                <span className="font-medium text-white">{team.name}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm pt-2 border-t border-zinc-700">
                            <span className="text-gray-400">Entry Fee</span>
                            <span className="font-bold text-green-400">{tournament.entryFee || 'Paid'}</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Payment Number</label>
                            <input
                                type="text"
                                placeholder="017xxxxxxxx" // BD format example
                                value={paymentNumber}
                                onChange={(e) => setPaymentNumber(e.target.value)}
                                className="w-full bg-zinc-800 border-zinc-700 text-white rounded-md p-2 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                            />
                            <p className="text-xs text-gray-500">The number you sent money from</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Transaction ID (TrxID)</label>
                            <input
                                type="text"
                                placeholder="Enter Transaction ID"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                className="w-full bg-zinc-800 border-zinc-700 text-white rounded-md p-2 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                            />
                        </div>

                        <Button
                            onClick={handleSubmit}
                            className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
                        >
                            Confirm Payment & Register
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
