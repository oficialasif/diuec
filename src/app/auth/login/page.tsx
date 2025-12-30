'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthModal } from '@/components/auth/auth'
import { Button } from '@/components/shared/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(true)

    const handleClose = () => {
        setIsOpen(false)
        router.push('/')
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="text-center space-y-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">DIU ESPORTS</h1>
                <p className="text-gray-400">Please sign in to continue</p>

                <Button variant="outline" onClick={() => router.push('/')} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Button>

                <AuthModal
                    isOpen={isOpen}
                    onClose={handleClose}
                    onLogin={() => router.push('/dashboard')}
                />
            </div>
        </div>
    )
}
