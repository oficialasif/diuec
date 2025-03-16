'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { AdminRouteGuard } from '@/components/auth/AdminRouteGuard'
import toast from 'react-hot-toast'

interface TeamMember {
  id: string
  name: string
  role: string
  image: string
}

export default function TeamManagement() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [newMember, setNewMember] = useState({ name: '', role: '', image: '' })
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchTeam()
  }, [])

  const fetchTeam = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'team'))
      const teamData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamMember[]
      setTeam(teamData)
    } catch (error) {
      console.error('Error fetching team:', error)
      toast.error('Failed to fetch team members')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async () => {
    try {
      await addDoc(collection(db, 'team'), newMember)
      toast.success('Team member added successfully')
      setNewMember({ name: '', role: '', image: '' })
      setIsDialogOpen(false)
      fetchTeam()
    } catch (error) {
      console.error('Error adding team member:', error)
      toast.error('Failed to add team member')
    }
  }

  const handleUpdateMember = async () => {
    if (!editingMember) return

    try {
      await updateDoc(doc(db, 'team', editingMember.id), {
        name: editingMember.name,
        role: editingMember.role,
        image: editingMember.image
      })
      toast.success('Team member updated successfully')
      setEditingMember(null)
      setIsDialogOpen(false)
      fetchTeam()
    } catch (error) {
      console.error('Error updating team member:', error)
      toast.error('Failed to update team member')
    }
  }

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return

    try {
      await deleteDoc(doc(db, 'team', id))
      toast.success('Team member deleted successfully')
      fetchTeam()
    } catch (error) {
      console.error('Error deleting team member:', error)
      toast.error('Failed to delete team member')
    }
  }

  return (
    <AdminRouteGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Team Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={editingMember ? editingMember.name : newMember.name}
                    onChange={(e) => {
                      if (editingMember) {
                        setEditingMember({ ...editingMember, name: e.target.value })
                      } else {
                        setNewMember({ ...newMember, name: e.target.value })
                      }
                    }}
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <Input
                    value={editingMember ? editingMember.role : newMember.role}
                    onChange={(e) => {
                      if (editingMember) {
                        setEditingMember({ ...editingMember, role: e.target.value })
                      } else {
                        setNewMember({ ...newMember, role: e.target.value })
                      }
                    }}
                    placeholder="Enter role"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <Input
                    value={editingMember ? editingMember.image : newMember.image}
                    onChange={(e) => {
                      if (editingMember) {
                        setEditingMember({ ...editingMember, image: e.target.value })
                      } else {
                        setNewMember({ ...newMember, image: e.target.value })
                      }
                    }}
                    placeholder="Enter image URL"
                  />
                </div>
                <Button
                  onClick={editingMember ? handleUpdateMember : handleAddMember}
                  className="w-full"
                >
                  {editingMember ? 'Update Member' : 'Add Member'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div
                key={member.id}
                className="border border-gray-800 rounded-lg overflow-hidden"
              >
                <div className="relative h-48">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 space-x-2">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteMember(member.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={() => {
                        setEditingMember(member)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-gray-400">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminRouteGuard>
  )
} 