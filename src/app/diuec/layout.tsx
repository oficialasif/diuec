'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function DiuecLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, isAdmin, loading } = useAuth()

    useEffect(() => {
        // Don't check admin status on the login page itself
        const isLoginPage = pathname === '/diuec'

        if (!loading && !isLoginPage) {
            // Only check admin status for dashboard routes
            if (!user) {
                // Not logged in, redirect to login
                router.push('/diuec')
            } else if (!isAdmin) {
                // Logged in but not admin, redirect to home
                router.push('/')
            }
        }
    }, [user, isAdmin, loading, router, pathname])

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-t-2 border-violet-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    return <>{children}</>
}
