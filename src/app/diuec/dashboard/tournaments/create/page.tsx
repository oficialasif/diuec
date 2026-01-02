'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { collection, doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { uploadImage } from '@/lib/upload'
import { getActiveGames, Game } from '@/lib/game-services'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { ArrowLeft, Upload, X } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function CreateTournamentPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [games, setGames] = useState<Game[]>([])
    const [loadingGames, setLoadingGames] = useState(true)
    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const [bannerPreview, setBannerPreview] = useState<string>('')
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        game: '',
        format: 'SQUAD' as 'SOLO' | 'DUO' | 'TRIO' | 'SQUAD',
        type: 'ELIMINATION' as 'ELIMINATION' | 'BATTLE_ROYALE' | 'GROUP_KNOCKOUT',
        maxTeams: 8,
        prizePool: '',
        entryFee: '',
        startDate: '',
        endDate: '',
        description: '',
        rules: '',
    })

    useEffect(() => {
        fetchGames()
    }, [])

    const fetchGames = async () => {
        try {
            const data = await getActiveGames()
            setGames(data)
            setLoadingGames(false)
        } catch (error) {
            console.error('Error fetching games:', error)
            toast.error('Failed to load games')
            setLoadingGames(false)
        }
    }

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image must be less than 5MB')
                return
            }
            setBannerFile(file)
            setBannerPreview(URL.createObjectURL(file))
        }
    }

    const handleRemoveBanner = () => {
        setBannerFile(null)
        setBannerPreview('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            let bannerUrl = ''

            // Upload banner if provided
            if (bannerFile) {
                setUploading(true)
                bannerUrl = await uploadImage(bannerFile, 'tournaments')
                setUploading(false)
            }

            const tournamentRef = doc(collection(db, 'tournaments'))

            await setDoc(tournamentRef, {
                id: tournamentRef.id,
                title: formData.name, // Mapping name to title
                game: formData.game,
                format: formData.format,
                type: formData.type,
                description: formData.description,
                rules: formData.rules ? formData.rules.split('\n').filter(r => r.trim()) : [],
                prizePool: formData.prizePool,
                entryFee: formData.entryFee,
                image: bannerUrl, // Saving banner as image
                maxTeams: Number(formData.maxTeams),
                teamSize: formData.format === 'SOLO' ? 1 : formData.format === 'DUO' ? 2 : formData.format === 'TRIO' ? 3 : 4,
                registeredTeams: 0,
                status: 'upcoming',
                startDate: new Date(formData.startDate),
                endDate: new Date(formData.endDate),
                createdAt: new Date(),
                updatedAt: new Date()
            })

            toast.success('Tournament created successfully!')
            router.push('/diuec/dashboard/tournaments')
        } catch (error: any) {
            console.error('Error creating tournament:', error)
            toast.error(error.message || 'Failed to create tournament')
            setLoading(false)
            setUploading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/diuec/dashboard/tournaments">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">Create Tournament</h1>
                    <p className="text-gray-400">Set up a new tournament</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Tournament Name *</label>
                            <Input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. DIU Championship 2024"
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Game *</label>
                            <select
                                required
                                value={formData.game}
                                onChange={(e) => {
                                    const selectedGame = e.target.value;
                                    setFormData({
                                        ...formData,
                                        game: selectedGame,
                                        type: selectedGame === 'EFOOTBALL' ? 'GROUP_KNOCKOUT' : formData.type,
                                        format: selectedGame === 'EFOOTBALL' ? 'SOLO' : formData.format
                                    })
                                }}
                                disabled={loadingGames}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                            >
                                {loadingGames ? (
                                    <option value="">Loading games...</option>
                                ) : games.length === 0 ? (
                                    <option value="">No games available</option>
                                ) : (
                                    <>
                                        <option value="">Select a game</option>
                                        {games.map(game => (
                                            <option key={game.id} value={game.name}>
                                                {game.displayName}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Tournament Type *</label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                            >
                                <option value="ELIMINATION">Elimination</option>
                                <option value="BATTLE_ROYALE">Battle Royale</option>
                                <option value="GROUP_KNOCKOUT">Group Stage + Knockout</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Format *</label>
                            <select
                                required
                                value={formData.format}
                                onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                            >
                                <option value="SOLO">Solo</option>
                                <option value="DUO">Duo</option>
                                <option value="TRIO">Trio</option>
                                <option value="SQUAD">Squad</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Max Teams *</label>
                            <Input
                                type="number"
                                required
                                min="2"
                                max="128"
                                value={formData.maxTeams}
                                onChange={(e) => setFormData({ ...formData, maxTeams: Number(e.target.value) })}
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Banner Upload */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Tournament Banner</h2>

                    <div className="space-y-4">
                        {bannerPreview ? (
                            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-zinc-800">
                                <Image
                                    src={bannerPreview}
                                    alt="Banner preview"
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveBanner}
                                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-violet-500 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                    <p className="mb-2 text-sm text-gray-400">
                                        <span className="font-semibold">Click to upload</span> tournament banner
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
                                    <p className="text-xs text-gray-500 mt-1">Recommended: 1920x1080px</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleBannerChange}
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Prize & Entry */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Prize & Entry</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Prize Pool</label>
                            <Input
                                value={formData.prizePool}
                                onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                                placeholder="e.g. ৳10,000"
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Entry Fee</label>
                            <Input
                                value={formData.entryFee}
                                onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                                placeholder="e.g. Free or ৳100"
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Schedule */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Schedule</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Start Date & Time *</label>
                            <Input
                                type="datetime-local"
                                required
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">End Date & Time *</label>
                            <Input
                                type="datetime-local"
                                required
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Description & Rules */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Details</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Tournament description..."
                            rows={4}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Rules</label>
                        <textarea
                            value={formData.rules}
                            onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                            placeholder="Tournament rules and regulations..."
                            rows={6}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-violet-600 hover:bg-violet-700"
                    >
                        {loading ? 'Creating...' : 'Create Tournament'}
                    </Button>
                    <Link href="/diuec/dashboard/tournaments">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    )
}
