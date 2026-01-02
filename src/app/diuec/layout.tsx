'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function DiuecLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const { user, isAdmin, loading } = useAuth()

    useEffect(() => {
        if (!loading && user && !isAdmin) {
            router.push('/')
        }
    }, [user, isAdmin, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-t-2 border-violet-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    return <>{children}</>
}
