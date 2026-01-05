'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { Button } from '@/components/shared/ui/button'
import { ArrowLeft, Download, ChevronDown, ChevronUp, Users, Calendar, Hash } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { TournamentRegistration, Team } from '@/lib/models'

interface RegistrationWithDetails extends TournamentRegistration {
    teamDetails?: Team
    userDetails?: {
        displayName: string
        photoURL: string
        email: string
    }
}

// Helper function to convert Firestore Timestamp to Date
const toDate = (timestamp: any): Date | null => {
    if (!timestamp) return null
    if (timestamp instanceof Date) return timestamp
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000)
    return null
}

export default function TournamentRegistrationsPage({ params }: { params: Promise<{ id: string }> }) {
    const [tournamentId, setTournamentId] = useState<string>('')
    const [tournament, setTournament] = useState<any>(null)
    const [registrations, setRegistrations] = useState<RegistrationWithDetails[]>([])
    const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        params.then(p => {
            setTournamentId(p.id)
        })
    }, [params])

    useEffect(() => {
        if (tournamentId) {
            fetchData()
        }
    }, [tournamentId])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch tournament details
            const tournamentDoc = await getDoc(doc(db, 'tournaments', tournamentId))
            if (tournamentDoc.exists()) {
                setTournament({ id: tournamentDoc.id, ...tournamentDoc.data() })
            }

            // Fetch registrations (will sort in JavaScript to avoid index requirement)
            const q = query(
                collection(db, 'tournament_registrations'),
                where('tournamentId', '==', tournamentId)
            )
            const snap = await getDocs(q)

            const regsWithDetails: RegistrationWithDetails[] = []

            for (const regDoc of snap.docs) {
                const regData = regDoc.data() as TournamentRegistration
                const registration: RegistrationWithDetails = {
                    ...regData,
                    id: regDoc.id
                }

                // Fetch team details if teamId exists
                if (regData.teamId) {
                    const teamDoc = await getDoc(doc(db, 'teams', regData.teamId))
                    if (teamDoc.exists()) {
                        registration.teamDetails = { id: teamDoc.id, ...teamDoc.data() } as Team
                    }
                }

                // Fetch user details for solo tournaments or captain info
                if (regData.userId) {
                    const userDoc = await getDoc(doc(db, 'users', regData.userId))
                    if (userDoc.exists()) {
                        const userData = userDoc.data()
                        registration.userDetails = {
                            displayName: userData.displayName || 'Unknown',
                            photoURL: userData.photoURL || '',
                            email: userData.email || ''
                        }
                    }
                }

                regsWithDetails.push(registration)
            }

            // Sort by createdAt in JavaScript (ascending - earliest first)
            regsWithDetails.sort((a, b) => {
                const aTime = a.createdAt instanceof Date
                    ? a.createdAt.getTime()
                    : (a.createdAt as any)?.seconds * 1000 || 0
                const bTime = b.createdAt instanceof Date
                    ? b.createdAt.getTime()
                    : (b.createdAt as any)?.seconds * 1000 || 0
                return aTime - bTime
            })

            setRegistrations(regsWithDetails)
        } catch (error) {
            console.error('Error fetching registrations:', error)
            toast.error('Failed to load registrations')
        } finally {
            setLoading(false)
        }
    }

    const toggleTeamExpansion = (registrationId: string) => {
        const newExpanded = new Set(expandedTeams)
        if (newExpanded.has(registrationId)) {
            newExpanded.delete(registrationId)
        } else {
            newExpanded.add(registrationId)
        }
        setExpandedTeams(newExpanded)
    }

    const exportToCSV = () => {
        try {
            // CSV headers
            const headers = ['Serial No.', 'Team/Player Name', 'Captain/Player', 'Members', 'Registration Date', 'Registration Time', 'Status']

            // CSV rows
            const rows = registrations.map((reg, index) => {
                const serialNo = index + 1
                const teamName = reg.teamDetails?.name || reg.ingameName || reg.userDetails?.displayName || 'Unknown'
                const captain = reg.userDetails?.displayName || 'Unknown'
                const members = reg.teamDetails?.members.map(m => m.displayName).join('; ') || 'N/A'
                const regDate = toDate(reg.createdAt)?.toLocaleDateString() || 'N/A'
                const regTime = toDate(reg.createdAt)?.toLocaleTimeString() || 'N/A'
                const status = reg.status || 'pending'

                return [serialNo, teamName, captain, members, regDate, regTime, status]
            })

            // Combine headers and rows
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n')

            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', `${tournament?.name || 'tournament'}_registrations.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success('Team list exported successfully!')
        } catch (error) {
            console.error('Error exporting CSV:', error)
            toast.error('Failed to export team list')
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/diuec/dashboard/tournaments">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Tournament Registrations</h1>
                        <p className="text-gray-400">{tournament?.name || 'Loading...'}</p>
                    </div>
                </div>
                <Button
                    onClick={exportToCSV}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={registrations.length === 0}
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export Team List
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-600/20 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Total Registrations</p>
                            <p className="text-2xl font-bold text-white">{registrations.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Approved</p>
                            <p className="text-2xl font-bold text-white">
                                {registrations.filter(r => r.status === 'approved').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Pending</p>
                            <p className="text-2xl font-bold text-white">
                                {registrations.filter(r => r.status === 'pending').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registrations List */}
            <div className="space-y-3">
                {registrations.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                        <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500">No registrations yet</p>
                    </div>
                ) : (
                    registrations.map((registration, index) => {
                        const isExpanded = expandedTeams.has(registration.id)
                        const teamName = registration.teamDetails?.name || registration.ingameName || registration.userDetails?.displayName || 'Unknown'
                        const regDate = toDate(registration.createdAt)

                        return (
                            <div
                                key={registration.id}
                                className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors"
                            >
                                {/* Team Header */}
                                <div
                                    className="p-4 cursor-pointer"
                                    onClick={() => toggleTeamExpansion(registration.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Serial Number */}
                                            <div className="w-12 h-12 bg-violet-600/20 rounded-lg flex items-center justify-center">
                                                <span className="text-xl font-bold text-violet-400">#{index + 1}</span>
                                            </div>

                                            {/* Team Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-bold text-white">{teamName}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${registration.status === 'approved'
                                                        ? 'bg-green-600/20 text-green-300'
                                                        : registration.status === 'rejected'
                                                            ? 'bg-red-600/20 text-red-300'
                                                            : 'bg-yellow-600/20 text-yellow-300'
                                                        }`}>
                                                        {registration.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>
                                                            {regDate ? regDate.toLocaleDateString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span>
                                                            {regDate ? regDate.toLocaleTimeString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                    {registration.teamDetails && (
                                                        <div className="flex items-center gap-1">
                                                            <Users className="w-4 h-4" />
                                                            <span>{registration.teamDetails.members.length} members</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expand Icon */}
                                        {registration.teamDetails && (
                                            <div className="text-gray-400">
                                                {isExpanded ? (
                                                    <ChevronUp className="w-5 h-5" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Team Members */}
                                {isExpanded && registration.teamDetails && (
                                    <div className="border-t border-zinc-800 bg-black/20 p-4">
                                        <h4 className="text-sm font-semibold text-gray-400 mb-3">Team Members</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {registration.teamDetails.members.map((member, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-lg p-3"
                                                >
                                                    <img
                                                        src={member.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg'}
                                                        alt={member.displayName}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-white">{member.displayName}</p>
                                                        <p className="text-xs text-gray-400 capitalize">{member.role}</p>
                                                    </div>
                                                    {member.role === 'captain' && (
                                                        <span className="px-2 py-1 bg-violet-600/20 text-violet-300 text-xs rounded-full font-medium">
                                                            Captain
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
