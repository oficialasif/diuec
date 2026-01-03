'use client'

import { useState, useEffect } from 'react'
import { getAllTournamentsAdmin, deleteTournament } from '@/lib/admin-services'
import { getTournaments } from '@/lib/services'
import { Button } from '@/components/shared/ui/button'
import { Plus, Edit, Trash2, Eye, Users, Swords, Gamepad2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/auth-context'

export default function TournamentsPage() {
    const [tournaments, setTournaments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const { user, userProfile } = useAuth()

    useEffect(() => {
        fetchTournaments()
    }, [])

    const fetchTournaments = async () => {
        setLoading(true)
        const data = await getTournaments()
        setTournaments(data)
        setLoading(false)
    }

    const handleGenerateBracket = async (tournamentId: string) => {
        if (!confirm('Are you sure? This will close registration and generate matches.')) return
        try {
            const { generateBracket } = await import('@/lib/services/bracket-service')
            await generateBracket(tournamentId)
            toast.success('Bracket generated successfully')
            fetchTournaments()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to generate bracket')
        }
    }

    const handleSeedData = async () => {
        if (!user) return
        if (!confirm('Create test data (1 Tournament, 8 Teams)?')) return
        try {
            const { seedTestData } = await import('@/lib/services/seed-service')
            await seedTestData(user.uid, userProfile?.displayName || 'Admin')
            toast.success('Test data seeded successfully')
            fetchTournaments()
        } catch (error) {
            console.error(error)
            toast.error('Failed to seed data')
        }
    }

    const handleCleanup = async () => {
        if (!confirm('WARNING: Delete all test data (Tournament, Teams, Matches)?')) return
        try {
            const { cleanupTestData } = await import('@/lib/services/seed-service')
            await cleanupTestData()
            toast.success('Test data cleaned up')
            fetchTournaments()
        } catch (error) {
            console.error(error)
            toast.error('Failed to cleanup data')
        }
    }

    const handleDelete = async (tournamentId: string) => {
        if (!confirm('Are you sure you want to delete this tournament?')) return

        try {
            await deleteTournament(tournamentId)
            toast.success('Tournament deleted')
            fetchTournaments()
        } catch (error) {
            toast.error('Failed to delete tournament')
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Tournament Management</h1>
                    <p className="text-gray-400">Create and manage tournaments</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={handleCleanup} variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10">
                        Cleanup Test Data
                    </Button>
                    <Button onClick={handleSeedData} variant="outline" className="border-violet-500/20 text-violet-300">
                        Seed Test Data
                    </Button>
                    <Link href="/diuec/dashboard/tournaments/create">
                        <Button className="bg-violet-600 hover:bg-violet-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Tournament
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Tournaments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map((tournament) => (
                    <div key={tournament.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-white text-lg mb-1">{tournament.name}</h3>
                                <p className="text-sm text-gray-400">{tournament.game}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${tournament.status === 'upcoming' ? 'bg-blue-600/20 text-blue-300' :
                                tournament.status === 'ongoing' ? 'bg-green-600/20 text-green-300' :
                                    'bg-gray-600/20 text-gray-300'
                                }`}>
                                {tournament.status}
                            </span>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Teams:</span>
                                <span className="text-white font-medium">{tournament.registeredTeams || 0} / {tournament.maxTeams}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Prize Pool:</span>
                                <span className="text-violet-400 font-medium">{tournament.prizePool}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Start Date:</span>
                                <span className="text-white">{new Date(tournament.startDate).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link href={`/diuec/dashboard/tournaments/${tournament.id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full">
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit
                                </Button>
                            </Link>
                            <Link href={`/diuec/dashboard/tournaments/${tournament.id}/brackets`}>
                                <Button variant="ghost" size="sm" title="Manage Brackets">
                                    <Swords className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Link href={`/diuec/dashboard/tournaments/${tournament.id}/groups`}>
                                <Button variant="ghost" size="sm" title="Manage Groups">
                                    <Users className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-yellow-400 hover:text-yellow-500 hover:bg-yellow-500/10"
                                title="Generate Bracket"
                                onClick={() => handleGenerateBracket(tournament.id)}
                            >
                                <Gamepad2 className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(tournament.id)}
                                className="text-red-400 hover:text-red-300"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {tournaments.length === 0 && (
                <div className="text-center py-12 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <p className="text-gray-500">No tournaments created yet</p>
                    <Link href="/diuec/dashboard/tournaments/create">
                        <Button className="mt-4 bg-violet-600 hover:bg-violet-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Tournament
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
