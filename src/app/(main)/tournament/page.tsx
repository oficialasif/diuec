'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/shared/ui/button'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { toast } from 'react-hot-toast'

interface Tournament {
  id: string
  name: string
  description: string
  game: string
  startDate: Date
  prizePool: string
  maxParticipants: number
  currentParticipants: number
  status: 'upcoming' | 'ongoing' | 'completed'
  participants: string[]
}

export default function Tournament() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const { user, userProfile } = useAuth()

  useEffect(() => {
    loadTournaments()
  }, [])

  const loadTournaments = async () => {
    try {
      const tournamentsRef = collection(db, 'tournaments')
      const q = query(tournamentsRef, orderBy('startDate', 'asc'))
      const snapshot = await getDocs(q)
      const tournamentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate.toDate(),
      })) as Tournament[]
      setTournaments(tournamentsData)
    } catch (error) {
      console.error('Error loading tournaments:', error)
      toast.error('Failed to load tournaments')
    } finally {
      setLoading(false)
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

      if (tournament.participants.includes(user.uid)) {
        toast.error('You are already registered for this tournament')
        return
      }

      if (tournament.currentParticipants >= tournament.maxParticipants) {
        toast.error('Tournament is full')
        return
      }

      // Add user to tournament participants
      // This is a simplified version - you might want to add more registration logic
      await addDoc(collection(db, 'tournament_registrations'), {
        tournamentId,
        userId: user.uid,
        userDisplayName: userProfile?.displayName,
        registeredAt: serverTimestamp(),
      })

      toast.success('Successfully registered for tournament')
      loadTournaments() // Reload tournaments to update the UI
    } catch (error) {
      console.error('Error registering for tournament:', error)
      toast.error('Failed to register for tournament')
    }
  }

  return (
    <div className="min-h-screen bg-black py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white">Tournaments</h1>
          <p className="mt-2 text-gray-400">
            Join competitive gaming tournaments and win prizes
          </p>
        </motion.div>

        {loading ? (
          <div className="mt-8 text-center text-gray-400">Loading tournaments...</div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="rounded-lg bg-white/5 p-6 ring-1 ring-white/10"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">
                    {tournament.name}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      tournament.status === 'upcoming'
                        ? 'bg-green-400/10 text-green-400'
                        : tournament.status === 'ongoing'
                        ? 'bg-yellow-400/10 text-yellow-400'
                        : 'bg-red-400/10 text-red-400'
                    }`}
                  >
                    {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-400">{tournament.description}</p>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Game:</span> {tournament.game}
                  </p>
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Start Date:</span>{' '}
                    {tournament.startDate.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Prize Pool:</span>{' '}
                    {tournament.prizePool}
                  </p>
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Participants:</span>{' '}
                    {tournament.currentParticipants}/{tournament.maxParticipants}
                  </p>
                </div>
                <div className="mt-6">
                  <Button
                    className="w-full"
                    onClick={() => handleRegister(tournament.id)}
                    disabled={
                      !user ||
                      tournament.status !== 'upcoming' ||
                      tournament.currentParticipants >= tournament.maxParticipants ||
                      tournament.participants.includes(user.uid)
                    }
                  >
                    {!user
                      ? 'Sign in to Register'
                      : tournament.participants.includes(user.uid)
                      ? 'Already Registered'
                      : tournament.currentParticipants >= tournament.maxParticipants
                      ? 'Tournament Full'
                      : tournament.status !== 'upcoming'
                      ? 'Registration Closed'
                      : 'Register Now'}
                  </Button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
} 