'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { Shield, Lock, Mail, Loader2 } from 'lucide-react'

export default function AdminLoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            // Check if user is admin
            const userDoc = await getDoc(doc(db, 'users', user.uid))
            const userData = userDoc.data()

            if (userData?.role !== 'admin') {
                await signOut(auth)
                toast.error('Access denied. Admin privileges required.')
                setLoading(false)
                return
            }

            toast.success('Admin access granted')
            router.push('/dashboard')
        } catch (error: any) {
            console.error('Login error:', error)
            toast.error(error.message || 'Failed to login')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-violet-900/30 rounded-full flex items-center justify-center mb-4">
                        <Shield className="h-8 w-8 text-violet-500" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">
                        Admin Access
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Daffodil International University Esports Community
                    </p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 shadow-2xl backdrop-blur-sm">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full pl-10 rounded-lg bg-black border border-zinc-800 text-white placeholder-gray-500 focus:border-violet-500 focus:ring-violet-500 sm:text-sm p-2.5 transition-colors"
                                    placeholder="admin@diuec.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full pl-10 rounded-lg bg-black border border-zinc-800 text-white placeholder-gray-500 focus:border-violet-500 focus:ring-violet-500 sm:text-sm p-2.5 transition-colors"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Verifying...
                                </>
                            ) : (
                                'Portal Login'
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center text-xs text-zinc-600">
                    <Link href="/" className="hover:text-violet-500 transition-colors">
                        Return to Community
                    </Link>
                </div>
            </div>
        </div>
    )
}
