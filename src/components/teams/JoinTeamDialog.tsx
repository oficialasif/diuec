'use client'

import { useState } from 'react'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { User, Smartphone, Gamepad2, TrendingUp, Award } from 'lucide-react'
import { requestToJoinTeam } from '@/lib/services'
import toast from 'react-hot-toast'

interface JoinTeamDialogProps {
    isOpen: boolean
    onClose: () => void
    teamId: string
    teamName: string
    gameName: string
    userId: string
    onSuccess?: () => void
}

export default function JoinTeamDialog({
    isOpen,
    onClose,
    teamId,
    teamName,
    gameName,
    userId,
    onSuccess
}: JoinTeamDialogProps) {
    const [formData, setFormData] = useState({
        name: '',
        gmail: '',
        gameUsername: '',
        deviceName: '',
        playingLevel: '' as 'beginner' | 'intermediate' | 'advanced' | 'pro' | '',
        experience: '',
        gameName: gameName
    })
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.name.trim()) {
            toast.error('Please enter your Name')
            return
        }
        if (!formData.gmail.trim()) {
            toast.error('Please enter your Gmail')
            return
        }
        if (!formData.gameUsername.trim()) {
            toast.error('Please enter your Game Username')
            return
        }
        if (!formData.deviceName.trim()) {
            toast.error('Please enter your Device Name')
            return
        }
        if (!formData.playingLevel) {
            toast.error('Please select your playing level')
            return
        }
        if (!formData.experience.trim()) {
            toast.error('Please describe your experience')
            return
        }

        setSubmitting(true)

        try {
            await requestToJoinTeam(teamId, userId, {
                name: formData.name,
                gmail: formData.gmail,
                gameUsername: formData.gameUsername,
                deviceName: formData.deviceName,
                playingLevel: formData.playingLevel as 'beginner' | 'intermediate' | 'advanced' | 'pro',
                experience: formData.experience,
                gameName: formData.gameName
            })

            toast.success('Join request submitted successfully!')

            // Reset form
            setFormData({
                name: '',
                gmail: '',
                gameUsername: '',
                deviceName: '',
                playingLevel: '',
                experience: '',
                gameName: gameName
            })

            onClose()
            if (onSuccess) onSuccess()
        } catch (error: any) {
            console.error('Join request error:', error)
            toast.error(error.message || 'Failed to submit join request')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-900 border-violet-500/20 text-white max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Award className="text-violet-400" />
                        Join {teamName}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Fill out this form to request to join the team. The captain will review your application.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                            <User className="w-4 h-4 text-violet-400" />
                            Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-black border-violet-500/20 focus:border-violet-500"
                            required
                        />
                    </div>

                    {/* Gmail */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                            <User className="w-4 h-4 text-violet-400" />
                            Gmail <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="email"
                            placeholder="your.email@gmail.com"
                            value={formData.gmail}
                            onChange={(e) => setFormData({ ...formData, gmail: e.target.value })}
                            className="bg-black border-violet-500/20 focus:border-violet-500"
                            required
                        />
                    </div>

                    {/* Game Username */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                            <Gamepad2 className="w-4 h-4 text-violet-400" />
                            Game Username <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            placeholder="Your In-Game Name"
                            value={formData.gameUsername}
                            onChange={(e) => setFormData({ ...formData, gameUsername: e.target.value })}
                            className="bg-black border-violet-500/20 focus:border-violet-500"
                            required
                        />
                    </div>

                    {/* Device Name */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                            <Smartphone className="w-4 h-4 text-violet-400" />
                            Device Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            placeholder="e.g. iPhone 13, PC Specs, etc."
                            value={formData.deviceName}
                            onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                            className="bg-black border-violet-500/20 focus:border-violet-500"
                            required
                        />
                    </div>

                    {/* Playing Level */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                            <TrendingUp className="w-4 h-4 text-violet-400" />
                            Playing Level <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.playingLevel}
                            onValueChange={(value) => setFormData({ ...formData, playingLevel: value as any })}
                        >
                            <SelectTrigger className="bg-black border-violet-500/20">
                                <SelectValue placeholder="Select your skill level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="beginner">Beginner - Just started</SelectItem>
                                <SelectItem value="intermediate">Intermediate - 1-2 years</SelectItem>
                                <SelectItem value="advanced">Advanced - 2-4 years</SelectItem>
                                <SelectItem value="pro">Pro - 4+ years competitive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Game Name (Pre-filled) */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                            <Gamepad2 className="w-4 h-4 text-violet-400" />
                            Game
                        </Label>
                        <Input
                            type="text"
                            value={formData.gameName}
                            disabled
                            className="bg-zinc-800 border-zinc-700 text-gray-400"
                        />
                    </div>

                    {/* Experience */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                            <Award className="w-4 h-4 text-violet-400" />
                            Experience & Achievements <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            placeholder="Describe your gaming experience, achievements, tournaments played, rank, etc..."
                            value={formData.experience}
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            className="bg-black border-violet-500/20 focus:border-violet-500 min-h-[100px]"
                            required
                        />
                        <p className="text-xs text-gray-500">
                            Tell us about your gaming background and why you'd be a great fit for this team
                        </p>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-violet-600 hover:bg-violet-700"
                        >
                            {submitting ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
