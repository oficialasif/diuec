'use client'

import { useState, useEffect } from 'react'
import { collection, query, orderBy, getDocs, deleteDoc, doc, updateDoc, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AdminRouteGuard } from '@/components/auth/AdminRouteGuard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Search, Edit2, Trash2, Plus, Trophy, Users, Calendar, DollarSign, Image as ImageIcon, Gamepad2, Swords } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
import { getValidImageUrl } from '@/lib/utils/image'
import { Tournament } from '@/lib/models'

// We need a partial type for the form since Firestore returns Timestamps but forms use strings/Dates
type TournamentForm = Omit<Tournament, 'id' | 'startDate' | 'endDate' | 'registrationStart' | 'registrationEnd' | 'currentParticipants' | 'registeredTeams'> & {
  startDate: string
  endDate: string
  registrationStart: string
  registrationEnd: string
}

const DEFAULT_FORM: TournamentForm = {
  title: '',
  description: '',
  image: '',
  game: 'VALORANT',
  format: 'SQUAD',
  type: 'ELIMINATION',
  teamSize: 5,
  prizePool: '',
  entryFee: '0',
  maxTeams: 16,
  status: 'upcoming',
  rules: [''],
  startDate: '',
  endDate: '',
  registrationStart: '',
  registrationEnd: '',
}

export default function TournamentsManagement() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState<TournamentForm>(DEFAULT_FORM)

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
          startDate: data.startDate?.toDate ? data.startDate.toDate() : new Date(),
          endDate: data.endDate?.toDate ? data.endDate.toDate() : new Date(),
          registrationStart: data.registrationStart?.toDate ? data.registrationStart.toDate() : new Date(),
          registrationEnd: data.registrationEnd?.toDate ? data.registrationEnd.toDate() : new Date(),
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
        ...formData,
        startDate: Timestamp.fromDate(new Date(formData.startDate || Date.now())),
        endDate: Timestamp.fromDate(new Date(formData.endDate || Date.now())),
        registrationStart: Timestamp.fromDate(new Date(formData.registrationStart || Date.now())),
        registrationEnd: Timestamp.fromDate(new Date(formData.registrationEnd || Date.now())),
        registeredTeams: 0,
        rules: formData.rules.filter(rule => rule.trim() !== '')
      }

      await addDoc(collection(db, 'tournaments'), tournamentData)
      toast.success('Tournament added successfully')
      setIsAddDialogOpen(false)
      setFormData(DEFAULT_FORM)
      fetchTournaments()
    } catch (error) {
      console.error('Error adding tournament:', error)
      toast.error('Failed to add tournament')
    }
  }

  const handleUpdateTournament = async (tournamentId: string) => {
    try {
      const updateData = {
        ...formData,
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        endDate: Timestamp.fromDate(new Date(formData.endDate)),
        registrationStart: Timestamp.fromDate(new Date(formData.registrationStart)),
        registrationEnd: Timestamp.fromDate(new Date(formData.registrationEnd)),
        rules: formData.rules.filter(rule => rule.trim() !== '')
      }

      await updateDoc(doc(db, 'tournaments', tournamentId), updateData)
      toast.success('Tournament updated successfully')
      setEditingId(null)
      setFormData(DEFAULT_FORM)
      fetchTournaments()
    } catch (error) {
      console.error('Error updating tournament:', error)
      toast.error('Failed to update tournament')
    }
  }

  const handleEditClick = (tournament: Tournament) => {
    setEditingId(tournament.id)
    setFormData({
      ...tournament,
      startDate: new Date(tournament.startDate).toISOString().slice(0, 16),
      endDate: new Date(tournament.endDate).toISOString().slice(0, 16),
      registrationStart: new Date(tournament.registrationStart).toISOString().slice(0, 16),
      registrationEnd: new Date(tournament.registrationEnd).toISOString().slice(0, 16),
    })
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const filteredTournaments = tournaments.filter(tournament =>
    (tournament?.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (tournament?.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const TournamentFormFields = () => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <Input
        placeholder="Tournament Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="bg-black border-violet-500/20"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Game</label>
          <Select
            value={formData.game}
            onValueChange={(val) => setFormData({ ...formData, game: val })}
          >
            <SelectTrigger className="bg-black border-violet-500/20">
              <SelectValue placeholder="Select Game" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VALORANT">Valorant</SelectItem>
              <SelectItem value="CS2">CS2</SelectItem>
              <SelectItem value="PUBGM">PUBG Mobile</SelectItem>
              <SelectItem value="FIFA">FIFA / eFootball</SelectItem>
              <SelectItem value="MLBB">Mobile Legends</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Format</label>
          <Select
            value={formData.format}
            onValueChange={(val: any) => setFormData({ ...formData, format: val, teamSize: val === 'SOLO' ? 1 : val === 'DUO' ? 2 : val === 'TRIO' ? 3 : 5 })}
          >
            <SelectTrigger className="bg-black border-violet-500/20">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SOLO">Solo (1v1)</SelectItem>
              <SelectItem value="DUO">Duo (2v2)</SelectItem>
              <SelectItem value="SQUAD">Squad (Team)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Type</label>
          <Select
            value={formData.type}
            onValueChange={(val: any) => setFormData({ ...formData, type: val })}
          >
            <SelectTrigger className="bg-black border-violet-500/20">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ELIMINATION">Elimination Bracket</SelectItem>
              <SelectItem value="BATTLE_ROYALE">Battle Royale</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Team Size</label>
          <Input
            type="number"
            value={formData.teamSize}
            onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) })}
            className="bg-black border-violet-500/20"
          />
        </div>
      </div>

      <Input
        placeholder="Banner Image URL"
        value={formData.image}
        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
        className="bg-black border-violet-500/20"
      />

      <Textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="bg-black border-violet-500/20"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Start Date</label>
          <Input
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="bg-black border-violet-500/20"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">End Date</label>
          <Input
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="bg-black border-violet-500/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Reg. Start</label>
          <Input
            type="datetime-local"
            value={formData.registrationStart}
            onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
            className="bg-black border-violet-500/20"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Reg. End</label>
          <Input
            type="datetime-local"
            value={formData.registrationEnd}
            onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
            className="bg-black border-violet-500/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Max Teams</label>
          <Input
            type="number"
            value={formData.maxTeams}
            onChange={(e) => setFormData({ ...formData, maxTeams: parseInt(e.target.value) })}
            className="bg-black border-violet-500/20"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Prize Pool</label>
          <Input
            value={formData.prizePool}
            onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
            className="bg-black border-violet-500/20"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Entry Fee</label>
          <Input
            value={formData.entryFee}
            onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
            className="bg-black border-violet-500/20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Rules</label>
        {formData.rules.map((rule, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder={`Rule ${index + 1}`}
              value={rule}
              onChange={(e) => {
                const updatedRules = [...formData.rules]
                updatedRules[index] = e.target.value
                setFormData({ ...formData, rules: updatedRules })
              }}
              className="bg-black border-violet-500/20"
            />
            {index === formData.rules.length - 1 && (
              <Button
                variant="ghost"
                onClick={() => setFormData({ ...formData, rules: [...formData.rules, ''] })}
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
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
                <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => setFormData(DEFAULT_FORM)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tournament
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/95 border border-violet-500/20 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Tournament</DialogTitle>
                </DialogHeader>
                <TournamentFormFields />
                <Button
                  className="w-full bg-violet-600 hover:bg-violet-700 mt-4"
                  onClick={handleAddTournament}
                >
                  Create Tournament
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : (
            <>
              {filteredTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="bg-black/50 rounded-lg border border-violet-500/20 p-6"
                >
                  <div className="flex gap-6">
                    {tournament.image && (
                      <div className="relative w-48 h-48 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={getValidImageUrl(tournament.image, 'tournament')}
                          alt={tournament.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-semibold text-white">{tournament.title}</h3>
                            <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded">{tournament.game} / {tournament.format}</span>
                          </div>
                          <p className="text-gray-400 mt-1 line-clamp-2">{tournament.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-violet-400 hover:text-violet-500 hover:bg-violet-500/10"
                            onClick={() => handleEditClick(tournament)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Link href={`/brackets?tournamentId=${tournament.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white hover:text-violet-400 hover:bg-violet-500/10"
                              title="View Brackets"
                            >
                              <Swords className="w-4 h-4" />
                            </Button>
                          </Link>
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

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{tournament.registeredTeams} / {tournament.maxTeams} Teams</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Trophy className="w-4 h-4" />
                          <span>Pool: {tournament.prizePool}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <DollarSign className="w-4 h-4" />
                          <span>Fee: {tournament.entryFee}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {editingId === tournament.id && (
                    <div className="space-y-4 mt-6 border-t border-violet-500/20 pt-6">
                      <h4 className="text-lg font-semibold text-white mb-4">Edit Tournament</h4>
                      <TournamentFormFields />
                      <div className="flex gap-2 justify-end mt-4">
                        <Button
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleUpdateTournament(tournament.id)}
                          className="bg-violet-600 hover:bg-violet-700"
                        >
                          Save Changes
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
