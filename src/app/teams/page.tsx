'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { getAllTeams } from '@/lib/services'
import { Team } from '@/lib/models'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { Search, Users, Trophy, Shield } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function TeamsPage() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchTeams() {
      try {
        const allTeams = await getAllTeams()
        setTeams(allTeams)
      } catch (error) {
        console.error('Error fetching teams:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTeams()
  }, [])

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.tag.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-white bg-clip-text text-transparent">Find Teams</h1>
            <p className="text-gray-400">Join the competitive scene or challenge existing squads.</p>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search teams..."
                className="pl-9 bg-zinc-900 border-zinc-800 focus:border-violet-500"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {user && (
              <Link href="/teams/my-team">
                <Button variant="outline" className="whitespace-nowrap border-violet-500 text-violet-400 hover:bg-violet-500/10">
                  <Shield className="w-4 h-4 mr-2" />
                  My Team
                </Button>
              </Link>
            )}
            <Link href="/teams/create">
              <Button className="bg-violet-600 hover:bg-violet-700 whitespace-nowrap">
                Create Team
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-64 bg-zinc-900/50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">
            <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Teams Found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search terms' : 'Be the first to create a team!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTeams.map(team => (
              <Link href={`/teams/${team.id}`} key={team.id} className="group">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-violet-500/50 transition-all hover:-translate-y-1 h-full flex flex-col">
                  <div className="h-24 bg-gradient-to-br from-zinc-800 to-zinc-900 relative">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                      <div className="h-20 w-20 rounded-xl border-4 border-black bg-zinc-800 relative overflow-hidden shadow-lg">
                        <Image
                          src={team.logo}
                          alt={team.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 p-5 text-center flex-1 flex flex-col">
                    <h3 className="text-lg font-bold group-hover:text-violet-400 transition-colors">{team.name}</h3>
                    <span className="text-xs font-mono text-gray-500 mb-3 block">[{team.tag}]</span>

                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="bg-violet-500/10 text-violet-400 text-xs px-2 py-0.5 rounded border border-violet-500/20">
                        {team.game}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-zinc-800/50">
                      <div>
                        <div className="text-xs text-gray-500 uppercase">Members</div>
                        <div className="font-semibold">{team.members.length}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase">Win Rate</div>
                        <div className="font-semibold text-green-400">
                          {team.stats.matchesPlayed > 0
                            ? Math.round((team.stats.wins / team.stats.matchesPlayed) * 100) + '%'
                            : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}