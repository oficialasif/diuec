'use client'

import { useAuth } from '@/contexts/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shared/ui/avatar'
import { Button } from '@/components/shared/ui/button'
import { LogOut, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminHeader() {
    const { user, userProfile, signOut } = useAuth()
    const router = useRouter()

    const handleSignOut = async () => {
        await signOut()
        router.push('/diuec')
    }

    return (
        <header className="h-16 bg-black/80 backdrop-blur-xl border-b border-zinc-800 px-6 flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold text-white">Administration</h2>
                <p className="text-xs text-gray-500">Manage your esports platform</p>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Admin Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
                    <div className="text-right">
                        <p className="text-sm font-medium text-white">{userProfile?.displayName}</p>
                        <p className="text-xs text-violet-400">Administrator</p>
                    </div>
                    <Avatar className="h-10 w-10 ring-2 ring-violet-500/50">
                        <AvatarImage src={userProfile?.photoURL || ''} />
                        <AvatarFallback className="bg-violet-600 text-white">
                            {userProfile?.displayName?.charAt(0) || 'A'}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Sign Out */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </header>
    )
}
