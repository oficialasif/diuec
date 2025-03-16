'use client'

import { useState, useEffect } from 'react'
import { collection, query, orderBy, getDocs, deleteDoc, doc, updateDoc, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AdminRouteGuard } from '@/components/auth/AdminRouteGuard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Search, Edit2, Trash2, Plus, Trophy, Users, Calendar, DollarSign, Image as ImageIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { getValidImageUrl } from '@/lib/utils/image'

interface Tournament {
  id: string
  name: string
  description: string
  photoUrl: string
  startDate: Timestamp
  endDate: Timestamp
  maxParticipants: number
  currentParticipants: number
  status: 'upcoming' | 'ongoing' | 'completed'
  prize: string
  registrationFee: number
  rules: string[]
}

export default function TournamentsManagement() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newTournament, setNewTournament] = useState({
    name: '',
    description: '',
    photoUrl: '',
    startDate: '',
    endDate: '',
    maxParticipants: 0,
    prize: '',
    registrationFee: 0,
    rules: ['']
  })

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      const q = query(collection(db, 'tournaments'), orderBy('startDate', 'desc'))
      const querySnapshot = await getDocs(q)
      const tournamentsData = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          rules: Array.isArray(data.rules) ? data.rules : []
        }
      }) as Tournament[]
      setTournaments(tournamentsData)
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      toast.error('Failed to load tournaments')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTournament = async () => {
    try {
      const tournamentData = {
        ...newTournament,
        startDate: Timestamp.fromDate(new Date(newTournament.startDate)),
        endDate: Timestamp.fromDate(new Date(newTournament.endDate)),
        currentParticipants: 0,
        status: 'upcoming',
        rules: newTournament.rules.filter(rule => rule.trim() !== '')
      }

      await addDoc(collection(db, 'tournaments'), tournamentData)
      toast.success('Tournament added successfully')
      setIsAddDialogOpen(false)
      setNewTournament({
        name: '',
        description: '',
        photoUrl: '',
        startDate: '',
        endDate: '',
        maxParticipants: 0,
        prize: '',
        registrationFee: 0,
        rules: ['']
      })
      fetchTournaments()
    } catch (error) {
      console.error('Error adding tournament:', error)
      toast.error('Failed to add tournament')
    }
  }

  const handleUpdateTournament = async (tournamentId: string) => {
    if (!editingTournament) return

    try {
      await updateDoc(doc(db, 'tournaments', tournamentId), {
        name: editingTournament.name,
        description: editingTournament.description,
        photoUrl: editingTournament.photoUrl,
        prize: editingTournament.prize,
        registrationFee: editingTournament.registrationFee,
        rules: editingTournament.rules,
        status: editingTournament.status
      })
      toast.success('Tournament updated successfully')
      setEditingTournament(null)
      fetchTournaments()
    } catch (error) {
      console.error('Error updating tournament:', error)
      toast.error('Failed to update tournament')
    }
  }

  const handleDeleteTournament = async (tournamentId: string) => {
    if (!confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'tournaments', tournamentId))
      toast.success('Tournament deleted successfully')
      fetchTournaments()
    } catch (error) {
      console.error('Error deleting tournament:', error)
      toast.error('Failed to delete tournament')
    }
  }

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate()
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const filteredTournaments = tournaments.filter(tournament =>
    (tournament?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (tournament?.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  return (
    <AdminRouteGuard>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Tournaments Management</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black border-violet-500/20 text-white w-64"
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tournament
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/90 border border-violet-500/20 text-white">
                <DialogHeader>
                  <DialogTitle>Add New Tournament</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Tournament Name"
                    value={newTournament.name}
                    onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
                    className="bg-black border-violet-500/20"
                  />
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Tournament Photo URL"
                      value={newTournament.photoUrl}
                      onChange={(e) => setNewTournament({ ...newTournament, photoUrl: e.target.value })}
                      className="bg-black border-violet-500/20"
                    />
                  </div>
                  <Textarea
                    placeholder="Description"
                    value={newTournament.description}
                    onChange={(e) => setNewTournament({ ...newTournament, description: e.target.value })}
                    className="bg-black border-violet-500/20"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="datetime-local"
                      placeholder="Start Date"
                      value={newTournament.startDate}
                      onChange={(e) => setNewTournament({ ...newTournament, startDate: e.target.value })}
                      className="bg-black border-violet-500/20"
                    />
                    <Input
                      type="datetime-local"
                      placeholder="End Date"
                      value={newTournament.endDate}
                      onChange={(e) => setNewTournament({ ...newTournament, endDate: e.target.value })}
                      className="bg-black border-violet-500/20"
                    />
                  </div>
                  <Input
                    type="number"
                    placeholder="Max Participants"
                    value={newTournament.maxParticipants}
                    onChange={(e) => setNewTournament({ ...newTournament, maxParticipants: parseInt(e.target.value) })}
                    className="bg-black border-violet-500/20"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Prize</label>
                      <Input
                        placeholder="e.g. $1000"
                        value={newTournament.prize}
                        onChange={(e) => setNewTournament({ ...newTournament, prize: e.target.value })}
                        className="bg-black border-violet-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Registration Fee</label>
                      <Input
                        type="number"
                        placeholder="e.g. 50"
                        value={newTournament.registrationFee}
                        onChange={(e) => setNewTournament({ ...newTournament, registrationFee: parseInt(e.target.value) })}
                        className="bg-black border-violet-500/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {newTournament.rules.map((rule, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Rule ${index + 1}`}
                          value={rule}
                          onChange={(e) => {
                            const updatedRules = [...newTournament.rules]
                            updatedRules[index] = e.target.value
                            setNewTournament({ ...newTournament, rules: updatedRules })
                          }}
                          className="bg-black border-violet-500/20"
                        />
                        {index === newTournament.rules.length - 1 && (
                          <Button
                            variant="ghost"
                            onClick={() => setNewTournament({ ...newTournament, rules: [...newTournament.rules, ''] })}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-violet-600 hover:bg-violet-700"
                    onClick={handleAddTournament}
                  >
                    Create Tournament
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <svg className="w-8 h-8 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="mt-2 text-gray-400">Loading tournaments...</p>
            </div>
          ) : (
            <>
              {filteredTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="bg-black/50 rounded-lg border border-violet-500/20 p-6"
                >
                  <div className="flex gap-6">
                    {tournament.photoUrl && (
                      <div className="relative w-48 h-48 rounded-lg overflow-hidden">
                        <Image
                          src={getValidImageUrl(tournament.photoUrl, 'tournament')}
                          alt={tournament.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{tournament.name}</h3>
                          <p className="text-gray-400 mt-1">{tournament.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-violet-400 hover:text-violet-500 hover:bg-violet-500/10"
                            onClick={() => setEditingTournament(tournament)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                            onClick={() => handleDeleteTournament(tournament.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{tournament.currentParticipants} / {tournament.maxParticipants} Participants</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Trophy className="w-4 h-4" />
                          <span>Prize: {tournament.prize}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <DollarSign className="w-4 h-4" />
                          <span>Registration Fee: ${tournament.registrationFee}</span>
                        </div>
                      </div>

                      {Array.isArray(tournament.rules) && tournament.rules.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Tournament Rules:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {tournament.rules.map((rule, index) => (
                              <li key={index} className="text-gray-400 text-sm">{rule}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {editingTournament?.id === tournament.id && (
                    <div className="space-y-4 mt-4 border-t border-violet-500/20 pt-4">
                      <Input
                        value={editingTournament.name}
                        onChange={(e) => setEditingTournament({ ...editingTournament, name: e.target.value })}
                        className="bg-black border-violet-500/20"
                      />
                      <Input
                        value={editingTournament.photoUrl}
                        onChange={(e) => setEditingTournament({ ...editingTournament, photoUrl: e.target.value })}
                        className="bg-black border-violet-500/20"
                        placeholder="Tournament Photo URL"
                      />
                      <Textarea
                        value={editingTournament.description}
                        onChange={(e) => setEditingTournament({ ...editingTournament, description: e.target.value })}
                        className="bg-black border-violet-500/20"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          value={editingTournament.prize}
                          onChange={(e) => setEditingTournament({ ...editingTournament, prize: e.target.value })}
                          className="bg-black border-violet-500/20"
                          placeholder="Prize"
                        />
                        <Input
                          type="number"
                          value={editingTournament.registrationFee}
                          onChange={(e) => setEditingTournament({ ...editingTournament, registrationFee: parseInt(e.target.value) })}
                          className="bg-black border-violet-500/20"
                          placeholder="Registration Fee"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdateTournament(tournament.id)}
                          className="bg-violet-600 hover:bg-violet-700"
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setEditingTournament(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filteredTournaments.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  No tournaments found
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminRouteGuard>
  )
} 