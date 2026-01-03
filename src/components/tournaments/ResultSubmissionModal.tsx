import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { Label } from '@/components/ui/label'
import { submitMatchResult } from '@/lib/services'
import { useAuth } from '@/contexts/auth-context'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { getValidImageUrl } from '@/lib/utils/image'
import { Upload, Video } from 'lucide-react'
import { ImageUpload } from '@/components/shared/ui/image-upload'

interface ResultSubmissionModalProps {
    isOpen: boolean
    onClose: () => void
    match: any
    onSuccess?: () => void
}

export function ResultSubmissionModal({ isOpen, onClose, match, onSuccess }: ResultSubmissionModalProps) {
    const { user } = useAuth()
    const [scoreA, setScoreA] = useState('')
    const [scoreB, setScoreB] = useState('')
    const [rank, setRank] = useState('')
    const [kills, setKills] = useState('')
    const [proofUrl, setProofUrl] = useState('') // Now stores Cloudinary URL
    const [videoUrl, setVideoUrl] = useState('')
    const [submitting, setSubmitting] = useState(false)

    if (!match || !user) return null

    const handleSubmit = async () => {
        if (match.type === 'BATTLE_ROYALE') {
            if (!rank || !kills) {
                toast.error('Please enter rank and kills')
                return
            }
        } else {
            if (!scoreA || !scoreB) {
                toast.error('Please enter the final scores')
                return
            }
        }

        if (!proofUrl) {
            toast.error('Please upload a proof screenshot')
            return
        }

        setSubmitting(true)
        try {
            await submitMatchResult(
                match.id,
                user.uid,
                match.type === 'BATTLE_ROYALE' ? 0 : parseInt(scoreA),
                match.type === 'BATTLE_ROYALE' ? 0 : parseInt(scoreB),
                proofUrl,
                videoUrl,
                match.type === 'BATTLE_ROYALE' ? parseInt(rank) : undefined,
                match.type === 'BATTLE_ROYALE' ? parseInt(kills) : undefined
            )
            toast.success('Result submitted successfully!')
            onSuccess?.()
            onClose()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Submission failed')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{match.type === 'BATTLE_ROYALE' ? 'Submit Squad Result' : 'Submit Match Result'}</DialogTitle>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {/* Header: BR vs 1v1 */}
                    {match.type === 'BATTLE_ROYALE' ? (
                        <div className="bg-purple-900/20 border border-purple-500/20 p-4 rounded-lg text-center">
                            <h3 className="text-lg font-bold text-white">Group {match.group} Match</h3>
                            <p className="text-gray-400 text-sm">Please submit your team's Placement & Kills accurately.</p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between px-4">
                            <div className="flex flex-col items-center gap-2 w-24">
                                <div className="w-12 h-12 rounded-full bg-zinc-800 relative overflow-hidden">
                                    <Image src={getValidImageUrl(match.teamA?.logo, 'avatar')} alt={match.teamA?.name || 'TBD'} fill className="object-cover" />
                                </div>
                                <span className="text-xs font-bold text-center line-clamp-2">{match.teamA?.name || 'TBD'}</span>
                            </div>
                            <div className="text-xl font-bold text-gray-500">VS</div>
                            <div className="flex flex-col items-center gap-2 w-24">
                                <div className="w-12 h-12 rounded-full bg-zinc-800 relative overflow-hidden">
                                    <Image src={getValidImageUrl(match.teamB?.logo, 'avatar')} alt={match.teamB?.name || 'TBD'} fill className="object-cover" />
                                </div>
                                <span className="text-xs font-bold text-center line-clamp-2">{match.teamB?.name || 'TBD'}</span>
                            </div>
                        </div>
                    )}

                    {/* Inputs */}
                    {match.type === 'BATTLE_ROYALE' ? (
                        <div className="grid grid-cols-2 gap-8 items-center">
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-400">Your Rank (#)</Label>
                                <Input
                                    type="number"
                                    placeholder="#"
                                    value={rank}
                                    onChange={(e) => setRank(e.target.value)}
                                    className="bg-zinc-950 border-zinc-800 text-center text-lg font-bold text-violet-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-400">Total Kills</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={kills}
                                    onChange={(e) => setKills(e.target.value)}
                                    className="bg-zinc-950 border-zinc-800 text-center text-lg font-bold text-red-400"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-8 items-center">
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-400">Score Team A</Label>
                                <Input
                                    type="number"
                                    value={scoreA}
                                    onChange={(e) => setScoreA(e.target.value)}
                                    className="bg-zinc-950 border-zinc-800 text-center text-lg font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-400">Score Team B</Label>
                                <Input
                                    type="number"
                                    value={scoreB}
                                    onChange={(e) => setScoreB(e.target.value)}
                                    className="bg-zinc-950 border-zinc-800 text-center text-lg font-bold"
                                />
                            </div>
                        </div>
                    )}

                    {/* Proof Upload */}
                    <div className="space-y-2">
                        <Label>Screenshot Proof (Required)</Label>
                        <ImageUpload
                            value={proofUrl}
                            onChange={setProofUrl}
                            label="Upload Results Screenshot"
                        />
                    </div>

                    {/* Video URL */}
                    <div className="space-y-2">
                        <Label>Video/Drive Link (Optional)</Label>
                        <div className="relative">
                            <Video className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                            <Input
                                placeholder="https://drive.google.com/..."
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                className="bg-zinc-950 border-zinc-800 pl-9"
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            Link to match recording or Google Drive folder.
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={submitting} className="bg-violet-600 hover:bg-violet-700">
                        {submitting ? 'Submitting...' : 'Submit Result'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
