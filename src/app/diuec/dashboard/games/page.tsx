'use client'

import { useState, useEffect } from 'react'
import { getAllGames, createGame, updateGame, deleteGame, seedInitialGames, Game, GameInput } from '@/lib/game-services'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { Plus, Edit, Trash2, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function GamesManagementPage() {
    const [games, setGames] = useState<Game[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingGame, setEditingGame] = useState<Game | null>(null)
    const [formData, setFormData] = useState<GameInput>({
        name: '',
        displayName: '',
        icon: '',
        description: '',
        isActive: true
    })

    useEffect(() => {
        fetchGames()
    }, [])

    const fetchGames = async () => {
        try {
            const data = await getAllGames()
            setGames(data)
            setLoading(false)
        } catch (error) {
            toast.error('Failed to fetch games')
            setLoading(false)
        }
    }

    const handleSeedGames = async () => {
        if (!confirm('This will seed initial games. Only do this once. Continue?')) return

        try {
            await seedInitialGames()
            toast.success('Games seeded successfully!')
            fetchGames()
        } catch (error) {
            toast.error('Failed to seed games')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editingGame) {
                await updateGame(editingGame.id, formData)
                toast.success('Game updated successfully!')
            } else {
                await createGame(formData)
                toast.success('Game created successfully!')
            }

            setFormData({ name: '', displayName: '', icon: '', description: '', isActive: true })
            setShowCreateForm(false)
            setEditingGame(null)
            fetchGames()
        } catch (error: any) {
            toast.error(error.message || 'Failed to save game')
        }
    }

    const handleEdit = (game: Game) => {
        setEditingGame(game)
        setFormData({
            name: game.name,
            displayName: game.displayName,
            icon: game.icon || '',
            description: game.description || '',
            isActive: game.isActive
        })
        setShowCreateForm(true)
    }

    const handleDelete = async (gameId: string, gameName: string) => {
        if (!confirm(`Are you sure you want to delete ${gameName}? This cannot be undone.`)) return

        try {
            await deleteGame(gameId)
            toast.success('Game deleted successfully!')
            fetchGames()
        } catch (error) {
            toast.error('Failed to delete game')
        }
    }

    const handleCancel = () => {
        setFormData({ name: '', displayName: '', icon: '', description: '', isActive: true })
        setShowCreateForm(false)
        setEditingGame(null)
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Game Management</h1>
                    <p className="text-gray-400">Manage game categories for tournaments and teams</p>
                </div>
                <div className="flex gap-2">
                    {games.length === 0 && (
                        <Button onClick={handleSeedGames} variant="outline">
                            Seed Initial Games
                        </Button>
                    )}
                    <Button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="bg-violet-600 hover:bg-violet-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Game
                    </Button>
                </div>
            </div>

            {/* Create/Edit Form */}
            {showCreateForm && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {editingGame ? 'Edit Game' : 'Create New Game'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Game Name (ID) *
                                </label>
                                <Input
                                    required
                                    placeholder="e.g., VALORANT"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                    className="bg-zinc-900 border-zinc-800 text-white uppercase"
                                />
                                <p className="text-xs text-gray-500 mt-1">Unique identifier (uppercase)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Display Name *
                                </label>
                                <Input
                                    required
                                    placeholder="e.g., Valorant"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    className="bg-zinc-900 border-zinc-800 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Icon URL (optional)
                                </label>
                                <Input
                                    placeholder="https://example.com/icon.png"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    className="bg-zinc-900 border-zinc-800 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                                <select
                                    value={formData.isActive ? 'active' : 'inactive'}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Description (optional)
                            </label>
                            <textarea
                                placeholder="Brief description of the game"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
                                {editingGame ? 'Update Game' : 'Create Game'}
                            </Button>
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {games.map((game) => (
                    <div
                        key={game.id}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-bold text-white text-lg">{game.displayName}</h3>
                                <p className="text-sm text-gray-400 font-mono">{game.name}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${game.isActive
                                    ? 'bg-green-600/20 text-green-300'
                                    : 'bg-gray-600/20 text-gray-400'
                                }`}>
                                {game.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        {game.description && (
                            <p className="text-sm text-gray-400 mb-4">{game.description}</p>
                        )}

                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(game)}
                                className="flex-1"
                            >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(game.id, game.displayName)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {games.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                        <p className="text-gray-400 mb-4">No games created yet</p>
                        <Button onClick={handleSeedGames} className="bg-violet-600 hover:bg-violet-700">
                            Seed Initial Games
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
