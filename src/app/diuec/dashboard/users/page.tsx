'use client'

import { useState, useEffect } from 'react'
import { getAllUsers, updateUserRole, deleteUser } from '@/lib/admin-services'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { Search, Shield, Trash2, Edit } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { getValidImageUrl } from '@/lib/utils/image'

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [filteredUsers, setFilteredUsers] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [selectedRole, setSelectedRole] = useState<'all' | 'admin' | 'user'>('all')

    useEffect(() => {
        fetchUsers()
    }, [])

    useEffect(() => {
        filterUsers()
    }, [searchTerm, selectedRole, users])

    const fetchUsers = async () => {
        setLoading(true)
        const { users: fetchedUsers } = await getAllUsers(100)
        setUsers(fetchedUsers)
        setLoading(false)
    }

    const filterUsers = () => {
        let filtered = users

        // Filter by role
        if (selectedRole !== 'all') {
            filtered = filtered.filter(user => user.role === selectedRole)
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        setFilteredUsers(filtered)
    }

    const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
        try {
            await updateUserRole(userId, newRole)
            toast.success(`Role updated to ${newRole}`)
            fetchUsers()
        } catch (error) {
            toast.error('Failed to update role')
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return

        try {
            await deleteUser(userId)
            toast.success('User deleted')
            fetchUsers()
        } catch (error) {
            toast.error('Failed to delete user')
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
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
                <p className="text-gray-400">Manage user accounts and permissions</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-zinc-900 border-zinc-800 text-white"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={selectedRole === 'all' ? 'default' : 'outline'}
                        onClick={() => setSelectedRole('all')}
                        className={selectedRole === 'all' ? 'bg-violet-600' : ''}
                    >
                        All ({users.length})
                    </Button>
                    <Button
                        variant={selectedRole === 'admin' ? 'default' : 'outline'}
                        onClick={() => setSelectedRole('admin')}
                        className={selectedRole === 'admin' ? 'bg-violet-600' : ''}
                    >
                        Admins ({users.filter(u => u.role === 'admin').length})
                    </Button>
                    <Button
                        variant={selectedRole === 'user' ? 'default' : 'outline'}
                        onClick={() => setSelectedRole('user')}
                        className={selectedRole === 'user' ? 'bg-violet-600' : ''}
                    >
                        Users ({users.filter(u => u.role === 'user').length})
                    </Button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-zinc-800/50 border-b border-zinc-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Joined</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-800">
                                                <Image
                                                    src={getValidImageUrl(user.photoURL, 'avatar')}
                                                    alt={user.displayName || 'User'}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <span className="font-medium text-white">{user.displayName || 'No Name'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                ? 'bg-violet-600/20 text-violet-300 border border-violet-600/30'
                                                : 'bg-gray-600/20 text-gray-300 border border-gray-600/30'
                                            }`}>
                                            {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                            {user.role || 'user'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
                                                className="text-violet-400 hover:text-violet-300"
                                            >
                                                <Edit className="w-4 h-4 mr-1" />
                                                {user.role === 'admin' ? 'Demote' : 'Promote'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No users found matching your search
                    </div>
                )}
            </div>
        </div>
    )
}
