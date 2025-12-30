'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { createTeam } from '@/lib/services'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { Textarea } from '@/components/shared/ui/textarea'
import { ImageUpload } from '@/components/shared/ui/image-upload'
import toast from 'react-hot-toast'
import { Users, Gamepad2, Link as LinkIcon, Shield } from 'lucide-react'
import Image from 'next/image'

const GAMES = [
    { id: 'VALORANT', label: 'Valorant' },
    { id: 'CS2', label: 'Counter-Strike 2' },
    { id: 'PUBGM', label: 'PUBG Mobile' },
    { id: 'FIFA', label: 'EA Sports FC' },
    { id: 'OTHER', label: 'Other' }
] as const

export default function CreateTeamPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        tag: '',
        logo: '',
        description: '',
        game: 'VALORANT' as const
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setLoading(true)
        try {
            await createTeam(user.uid, {
                name: formData.name,
                tag: formData.tag,
                logo: formData.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
                description: formData.description,
                game: formData.game,
                invites: []
            })

            toast.success('Team created successfully!')
            router.push('/teams/my-team')
        } catch (error: any) {
            console.error('Error creating team:', error)
            toast.error(error.message || 'Failed to create team')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <div className="space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                        <Shield className="text-violet-500" />
                        Create Your Team
                    </h1>
                    <p className="text-gray-400">
                        Form a squad, recruit members, and compete in tournaments.
                    </p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 md:p-8 backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            {/* Team Name */}
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                                    Team Name
                                </label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                                    <Input
                                        placeholder="e.g. Sentinels"
                                        className="pl-10 bg-black border-zinc-700 focus:border-violet-500"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        maxLength={30}
                                    />
                                </div>
                            </div>

                            {/* Tag & Game */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                                        Team Tag (Short)
                                    </label>
                                    <Input
                                        placeholder="e.g. SEN"
                                        className="bg-black border-zinc-700 focus:border-violet-500 uppercase"
                                        value={formData.tag}
                                        onChange={e => setFormData({ ...formData, tag: e.target.value.toUpperCase() })}
                                        required
                                        maxLength={5}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                                        Main Game
                                    </label>
                                    <div className="relative">
                                        <Gamepad2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                                        <select
                                            className="w-full h-10 pl-10 rounded-lg bg-black border border-zinc-700 text-white focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                                            value={formData.game}
                                            onChange={e => setFormData({ ...formData, game: e.target.value as any })}
                                        >
                                            {GAMES.map(game => (
                                                <option key={game.id} value={game.id}>
                                                    {game.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Logo Upload */}
                            <div>
                                <ImageUpload
                                    label="Team Logo"
                                    value={formData.logo}
                                    onChange={(url) => setFormData({ ...formData, logo: url })}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Recommended size: 500x500px.
                                </p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                                    Description
                                </label>
                                <Textarea
                                    placeholder="Tell us about your team..."
                                    className="bg-black border-zinc-700 focus:border-violet-500 min-h-[100px]"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    maxLength={200}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-violet-600 hover:bg-violet-700"
                            disabled={loading}
                        >
                            {loading ? 'Creating Squad...' : 'Create Team'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
