'use client'

import { useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/shared/ui/button'
import { toast } from 'react-hot-toast'

export default function SetupAdminPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)

    const makeCurrentUserAdmin = async () => {
        if (!user) {
            toast.error('Please sign in first')
            return
        }

        setLoading(true)
        try {
            const userRef = doc(db, 'users', user.uid)
            const userDoc = await getDoc(userRef)

            if (!userDoc.exists()) {
                toast.error('User document not found')
                setLoading(false)
                return
            }

            await updateDoc(userRef, {
                role: 'admin'
            })

            toast.success('Successfully set as admin! Please refresh and try logging in to /diuec')
            setLoading(false)
        } catch (error: any) {
            console.error('Error:', error)
            toast.error(error.message || 'Failed to update role')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                <h1 className="text-2xl font-bold mb-4">Admin Setup</h1>
                {user ? (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400">
                            Current User: {user.email}
                        </p>
                        <p className="text-sm text-gray-400">
                            UID: {user.uid}
                        </p>
                        <Button
                            onClick={makeCurrentUserAdmin}
                            disabled={loading}
                            className="w-full bg-violet-600 hover:bg-violet-700"
                        >
                            {loading ? 'Setting up...' : 'Make Me Admin'}
                        </Button>
                        <p className="text-xs text-gray-500">
                            This will set your current account as admin. Use this only once during initial setup.
                        </p>
                    </div>
                ) : (
                    <p className="text-gray-400">Please sign in first</p>
                )}
            </div>
        </div>
    )
}
