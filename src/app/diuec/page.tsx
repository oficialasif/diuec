'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { Shield, Lock, Mail, Loader2, KeyRound } from 'lucide-react'

export default function DiuecAdminPortal() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()

  const checkAdminRole = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))

      if (!userDoc.exists()) {
        console.log('User document does not exist for UID:', userId)
        return false
      }

      const userData = userDoc.data()
      console.log('User data for UID', userId, ':', userData)

      if (userData?.role !== 'admin') {
        console.log('User role is not admin:', userData?.role)
        return false
      }

      return true
    } catch (error) {
      console.error('Error checking admin role:', error)
      return false
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Check if user is admin
      const isAdmin = await checkAdminRole(user.uid)
      if (!isAdmin) {
        await signOut(auth)
        toast.error('Access denied. Admin privileges required.')
        setLoading(false)
        return
      }

      toast.success('Welcome back, Admin')
      router.push('/diuec/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Failed to login')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      const user = userCredential.user

      console.log('Google user UID:', user.uid)
      console.log('Google user email:', user.email)

      // First check if this UID has admin role
      let isAdmin = await checkAdminRole(user.uid)

      // If not admin by UID, check by email (for existing email/password admins)
      if (!isAdmin && user.email) {
        console.log('Checking admin by email:', user.email)

        // Query Firestore to find user by email
        const { collection, query, where, getDocs } = await import('firebase/firestore')
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('email', '==', user.email))
        const snapshot = await getDocs(q)

        console.log('Email query results:', snapshot.size, 'documents found')

        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data()
          console.log('Found user by email:', userData)

          if (userData.role === 'admin') {
            console.log('Creating admin profile for Google UID')
            // Update the current user's UID with admin role
            const { doc, setDoc } = await import('firebase/firestore')
            await setDoc(doc(db, 'users', user.uid), {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || userData.displayName,
              photoURL: user.photoURL || userData.photoURL,
              role: 'admin',
              bio: userData.bio || '',
              phoneNumber: userData.phoneNumber || '',
              createdAt: userData.createdAt || new Date(),
              updatedAt: new Date()
            })
            isAdmin = true
            console.log('Admin role created for Google UID')
          }
        } else {
          console.log('No user found with email:', user.email)
        }
      }

      if (!isAdmin) {
        await signOut(auth)
        toast.error('Access denied. Admin privileges required.')
        setGoogleLoading(false)
        return
      }

      toast.success('Admin access granted via Google')
      router.push('/diuec/dashboard')
    } catch (error: any) {
      console.error('Google login error:', error)
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login cancelled')
      } else {
        toast.error(error.message || 'Failed to login with Google')
      }
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-violet-500/10">
            <KeyRound className="h-10 w-10 text-violet-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
            DIUEC Portal
          </h2>
          <p className="text-sm text-gray-500 font-mono">
            Authorized Personnel Only
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Admin ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 rounded-lg bg-black/50 border border-zinc-700 text-white placeholder-zinc-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm p-3 transition-colors"
                  placeholder="admin@diuec.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Secure Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-10 rounded-lg bg-black/50 border border-zinc-700 text-white placeholder-zinc-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm p-3 transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg shadow-violet-900/20 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Authenticating...
                </>
              ) : (
                'Access Dashboard'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-zinc-900/50 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-zinc-700 rounded-lg shadow-sm text-sm font-medium text-white bg-black/50 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {googleLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
