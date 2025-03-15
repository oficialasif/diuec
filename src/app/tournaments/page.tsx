'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { motion } from 'framer-motion'
import { collection, query, orderBy, getDocs, addDoc, where, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/shared/ui/button'
import { Trophy, Users, Calendar, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { getValidImageUrl } from '@/lib/utils/image'

interface Tournament {
  id: string
  title: string
  game: string
  description: string
  prizePool: string
  maxTeams: number
  registeredTeams: number
  startDate: Timestamp
  endDate: Timestamp
  status: 'upcoming' | 'ongoing' | 'completed'
  image: string
  rules: string[]
}

export default function TournamentsPage() {
  const { user } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [registeredTournaments, setRegisteredTournaments] = useState<string[]>([])

  useEffect(() => {
    fetchTournaments()
    if (user) {
      fetchUserRegistrations()
    }
  }, [user])

  const fetchTournaments = async () => {
    try {
      const q = query(collection(db, 'tournaments'), orderBy('startDate', 'asc'))
      const querySnapshot = await getDocs(q)
      const fetchedTournaments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tournament[]
      setTournaments(fetchedTournaments)
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      toast.error('Failed to load tournaments')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserRegistrations = async () => {
    try {
      const q = query(
        collection(db, 'tournament_registrations'),
        where('userId', '==', user.uid)
      )
      const querySnapshot = await getDocs(q)
      const registeredIds = querySnapshot.docs.map(doc => doc.data().tournamentId)
      setRegisteredTournaments(registeredIds)
    } catch (error) {
      console.error('Error fetching registrations:', error)
    }
  }

  const handleRegister = async (tournamentId: string) => {
    if (!user) {
      toast.error('Please sign in to register for tournaments')
      return
    }

    try {
      const tournament = tournaments.find(t => t.id === tournamentId)
      if (!tournament) return

      if (tournament.registeredTeams >= tournament.maxTeams) {
        toast.error('Tournament is full')
        return
      }

      await addDoc(collection(db, 'tournament_registrations'), {
        userId: user.uid,
        tournamentId,
        registeredAt: Timestamp.now()
      })

      setRegisteredTournaments([...registeredTournaments, tournamentId])
      setTournaments(tournaments.map(t =>
        t.id === tournamentId
          ? { ...t, registeredTeams: t.registeredTeams + 1 }
          : t
      ))

      toast.success('Successfully registered for tournament!')
    } catch (error) {
      console.error('Error registering for tournament:', error)
      toast.error('Failed to register for tournament')
    }
  }

  const formatDate = (timestamp: Timestamp) => {
    return new Date(timestamp.toDate()).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-8 px-4 md:px-0">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Tournaments</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join competitive tournaments, showcase your skills, and win amazing prizes.
            Register now to participate in upcoming events.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tournaments.map((tournament) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black border border-violet-500/20 rounded-lg overflow-hidden hover:border-violet-500/40 transition-all duration-300"
              >
                <div className="relative h-48">
                  <Image
                    src={getValidImageUrl(tournament.image, 'tournament')}
                    alt={tournament.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tournament.status === 'upcoming' ? 'bg-green-500/20 text-green-400' :
                      tournament.status === 'ongoing' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{tournament.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{tournament.description}</p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Trophy className="w-4 h-4 text-violet-400" />
                      Prize Pool: {tournament.prizePool}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Users className="w-4 h-4 text-violet-400" />
                      Teams: {tournament.registeredTeams}/{tournament.maxTeams}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4 text-violet-400" />
                      {formatDate(tournament.startDate)}
                    </div>
                  </div>

                  <Button
                    className={`w-full ${
                      registeredTournaments.includes(tournament.id)
                        ? 'bg-violet-900 text-violet-200 cursor-not-allowed'
                        : 'bg-violet-600 hover:bg-violet-700 text-white'
                    }`}
                    onClick={() => handleRegister(tournament.id)}
                    disabled={registeredTournaments.includes(tournament.id)}
                  >
                    {registeredTournaments.includes(tournament.id)
                      ? 'Registered'
                      : 'Register Now'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            ))}

            {tournaments.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400">
                  No tournaments available at the moment.
                  Check back later for upcoming events!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 