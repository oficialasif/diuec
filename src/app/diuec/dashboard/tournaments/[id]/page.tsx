'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { uploadImage } from '@/lib/upload'
import { getActiveGames, Game } from '@/lib/game-services'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { ArrowLeft, Upload, X } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function EditTournamentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
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
        banner: '',
        status: 'upcoming'
    })

    useEffect(() => {
        fetchTournament()
        fetchGames()
    }, [id])

    const fetchGames = async () => {
        try {
            const data = await getActiveGames()
            setGames(data)
            setLoadingGames(false)
        } catch (error) {
            console.error('Error fetching games:', error)
            setLoadingGames(false)
        }
    }

    const fetchTournament = async () => {
        try {
            const tournamentDoc = await getDoc(doc(db, 'tournaments', id))

            if (!tournamentDoc.exists()) {
                toast.error('Tournament not found')
                setLoading(false)
                return
            }

            const data = tournamentDoc.data()

            // Convert Firestore timestamp to datetime-local format
            const formatDateForInput = (timestamp: any) => {
                if (!timestamp) return ''
                const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
                return date.toISOString().slice(0, 16)
            }

            setFormData({
                name: data.title || data.name || '',
                game: data.game || '',
                format: data.format || 'SQUAD',
                type: data.type || 'ELIMINATION',
                maxTeams: data.maxTeams || 8,
                prizePool: data.prizePool || '',
                entryFee: data.entryFee || '',
                startDate: formatDateForInput(data.startDate),
                endDate: formatDateForInput(data.endDate),
                description: data.description || '',
                rules: Array.isArray(data.rules) ? data.rules.join('\n') : (data.rules || ''),
                banner: data.image || data.banner || '',
                status: data.status || 'upcoming'
            })

            if (data.image || data.banner) {
                setBannerPreview(data.image || data.banner)
            }

            setLoading(false)
        } catch (error) {
            console.error('Error fetching tournament:', error)
            toast.error('Failed to load tournament')
            setLoading(false)
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
        setBannerPreview(formData.banner || '')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            let bannerUrl = formData.banner

            // Upload new banner if provided
            if (bannerFile) {
                setUploading(true)
                bannerUrl = await uploadImage(bannerFile, 'tournaments')
                setUploading(false)
            }

            // Ensure rules is a string before splitting
            const rulesArray = typeof formData.rules === 'string'
                ? formData.rules.split('\n').filter(r => r.trim())
                : [];

            await updateDoc(doc(db, 'tournaments', id), {
                ...formData,
                title: formData.name, // Ensure title is updated
                image: bannerUrl,
                maxTeams: Number(formData.maxTeams),
                startDate: new Date(formData.startDate),
                rules: rulesArray,
                endDate: new Date(formData.endDate),
                updatedAt: new Date()
            })

            toast.success('Tournament updated successfully!')
            router.push('/diuec/dashboard/tournaments')
        } catch (error: any) {
            console.error('Error updating tournament:', error)
            toast.error(error.message || 'Failed to update tournament')
            setSaving(false)
            setUploading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-t-2 border-violet-500 rounded-full animate-spin"></div>
            </div>
        )
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
                    <h1 className="text-3xl font-bold text-white">Edit Tournament</h1>
                    <p className="text-gray-400">Update tournament details</p>
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
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Game *</label>
                            <select
                                required
                                value={formData.game}
                                onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                                disabled={loadingGames}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-violet-500"
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

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Format *</label>
                            <select
                                required
                                value={formData.format}
                                onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-violet-500"
                            >
                                <option value="SOLO">SOLO</option>
                                <option value="DUO">DUO</option>
                                <option value="TRIO">TRIO</option>
                                <option value="SQUAD">SQUAD</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Type *</label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-violet-500"
                            >
                                <option value="ELIMINATION">Elimination</option>
                                <option value="BATTLE_ROYALE">Battle Royale</option>
                                <option value="GROUP_KNOCKOUT">Group + Knockout</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Status *</label>
                            <select
                                required
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-violet-500"
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Max Teams *</label>
                            <Input
                                type="number"
                                required
                                min="2"
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

                    {bannerPreview ? (
                        <div className="relative w-full h-64 rounded-lg overflow-hidden bg-zinc-800">
                            <Image
                                src={bannerPreview}
                                alt="Banner preview"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            <button
                                type="button"
                                onClick={handleRemoveBanner}
                                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-violet-500">
                            <Upload className="w-12 h-12 text-gray-400 mb-3" />
                            <p className="text-sm text-gray-400">Click to upload banner</p>
                            <input type="file" className="hidden" accept="image/*" onChange={handleBannerChange} />
                        </label>
                    )}
                </div>

                {/* Prize, Schedule, Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        placeholder="Prize Pool"
                        value={formData.prizePool}
                        onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                        className="bg-zinc-900 border-zinc-800 text-white"
                    />
                    <Input
                        placeholder="Entry Fee"
                        value={formData.entryFee}
                        onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                        className="bg-zinc-900 border-zinc-800 text-white"
                    />
                    <Input
                        type="datetime-local"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="bg-zinc-900 border-zinc-800 text-white"
                    />
                    <Input
                        type="datetime-local"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="bg-zinc-900 border-zinc-800 text-white"
                    />
                </div>

                <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white"
                />

                <textarea
                    placeholder="Rules"
                    value={formData.rules}
                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white"
                />

                <div className="flex gap-4">
                    <Button type="submit" disabled={saving || uploading} className="bg-violet-600 hover:bg-violet-700">
                        {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Link href="/diuec/dashboard/tournaments">
                        <Button type="button" variant="outline">Cancel</Button>
                    </Link>
                </div>
            </form>
        </div>
    )
}
