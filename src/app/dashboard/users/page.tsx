'use client'

import { useState, useEffect } from 'react'
import { collection, query, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AdminRouteGuard } from '@/components/auth/AdminRouteGuard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, MoreHorizontal, Shield, ShieldOff, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  displayName: string
  role: 'admin' | 'user'
  createdAt: any
  lastLogin: any
  status: 'active' | 'suspended'
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'))
      const querySnapshot = await getDocs(q)
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[]
      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      })
      toast.success('User role updated successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    }
  }

  const handleUpdateUserStatus = async (userId: string, newStatus: 'active' | 'suspended') => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus
      })
      toast.success('User status updated successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error('Failed to update user status')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'users', userId))
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = (
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  return (
    <AdminRouteGuard>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black border-violet-500/20 text-white w-64"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-black border-violet-500/20 text-white rounded-md px-3"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        <div className="bg-black/50 rounded-lg border border-violet-500/20">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-violet-400">User</TableHead>
                <TableHead className="text-violet-400">Email</TableHead>
                <TableHead className="text-violet-400">Role</TableHead>
                <TableHead className="text-violet-400">Status</TableHead>
                <TableHead className="text-violet-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-white">
                    {user.displayName}
                  </TableCell>
                  <TableCell className="text-gray-400">{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' ? 'bg-violet-500' : 'bg-gray-500'
                    } text-white`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <select
                      value={user.status}
                      onChange={(e) => handleUpdateUserStatus(user.id, e.target.value as 'active' | 'suspended')}
                      className="bg-black border-violet-500/20 text-white rounded-md px-2 py-1"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.role === 'user' ? (
                          <DropdownMenuItem onClick={() => handleUpdateUserRole(user.id, 'admin')}>
                            <Shield className="w-4 h-4 mr-2" />
                            Make Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleUpdateUserRole(user.id, 'user')}>
                            <ShieldOff className="w-4 h-4 mr-2" />
                            Remove Admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No users found
            </div>
          )}
        </div>
      </div>
    </AdminRouteGuard>
  )
} 