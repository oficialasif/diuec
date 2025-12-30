'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Tournament, Team } from '@/lib/models'
import { Button } from '@/components/shared/ui/button'
import { Calendar, Trophy, Users, Swords } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Game Asset Mapping
const gameAssets: Record<string, { banner: string, icon: string, name: string }> = {
    'pubg': { name: 'PUBG Mobile', banner: '/images/games/pubg-banner.jpg', icon: '/images/games/pubg-icon.png' },
    'free-fire': { name: 'Free Fire', banner: '/images/games/ff-banner.jpg', icon: '/images/games/ff-icon.png' },
    'valorant': { name: 'Valorant', banner: '/images/games/val-banner.jpg', icon: '/images/games/val-icon.png' },
    'cs2': { name: 'Counter-Strike 2', banner: '/images/games/cs2-banner.jpg', icon: '/images/games/cs2-icon.png' },
    'football': { name: 'E-Football', banner: '/images/games/fifa-banner.jpg', icon: '/images/games/fifa-icon.png' },
}

export default function GameHubPage() {
    const params = useParams()
    const gameId = params?.id as string
    const gameKey = gameId?.toLowerCase()
    const gameInfo = gameAssets[gameKey] || { name: gameId?.toUpperCase(), banner: '/placeholder.jpg', icon: '/placeholder-icon.png' }

    const [tournaments, setTournaments] = useState<Tournament[]>([])
    const [topTeams, setTopTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            if (!gameId) return
            try {
                // Fetch Tournaments for this game
                const tQuery = query(
                    collection(db, 'tournaments'),
                    where('game', '==', gameInfo.name),
                    orderBy('startDate', 'desc')
                )
                const tSnap = await getDocs(tQuery)
                const tList = tSnap.docs.map(d => d.data() as Tournament)
                setTournaments(tList)

                // Fetch Teams for this game
                const teamQuery = query(
                    collection(db, 'teams'),
                    where('game', '==', gameInfo.name),
                    orderBy('stats.wins', 'desc'),
                    limit(5)
                )
                // Note: 'stats.wins' index might be needed. For MVP we might just fetch all and filter if small, but let's try query.
                // Fallback if index missing: just fetch simple
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [gameId, gameInfo.name])

    // Filter game assets to avoid broken images if local files missing
    // For MVP we use placeholders if assets fail? Next.js Image component handles it or we use error boundary.

    return (
        <div className="min-h-screen bg-black text-white pt-20 pb-12">
            {/* Hero */}
            <div className="relative h-64 w-full mb-12">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-900 via-black to-black opacity-80" />
                <div className="container mx-auto px-4 h-full flex items-center relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-zinc-800 rounded-2xl flex items-center justify-center border-2 border-violet-500 shadow-xl overflow-hidden">
                            {/* <Image src={gameInfo.icon} alt={gameInfo.name} width={96} height={96} /> */}
                            <Swords className="w-12 h-12 text-violet-500" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold mb-2">{gameInfo.name}</h1>
                            <p className="text-gray-400">Official Game Hub • News • Tournaments • Scrims</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Tournaments */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Trophy className="text-yellow-500" /> Active Tournaments
                        </h2>
                        {loading ? (
                            <p>Loading...</p>
                        ) : tournaments.length > 0 ? (
                            <div className="grid gap-4">
                                {tournaments.map(t => (
                                    <Link key={t.id} href={`/tournaments/${t.id}`}>
                                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:border-violet-500 transition-colors flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-lg">{t.title}</h3>
                                                <div className="flex gap-4 text-sm text-gray-400 mt-1">
                                                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date((t.startDate as any).seconds * 1000).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {t.registeredTeams}/{t.maxTeams}</span>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline">View Bracket</Button>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
                                <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No active tournaments for {gameInfo.name} active right now.</p>
                                <Button className="mt-4" variant="outline">Request Scrim</Button>
                            </div>
                        )}
                    </div>

                    {/* News / Highlights (Placeholder for now as we don't have game-tagged news yet) */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Latest News</h2>
                        <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 text-center text-gray-500">
                            News updates coming soon.
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Users className="text-blue-500" /> Top Teams
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Top rated teams in DIU for {gameInfo.name}</p>
                        {/* Placeholder for leaderboard list */}
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between p-2 bg-black rounded">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-gray-500">#{i}</span>
                                        <span>Team Placeholder</span>
                                    </div>
                                    <span className="text-violet-500 text-sm font-bold">1200 pts</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
