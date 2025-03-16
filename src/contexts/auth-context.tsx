'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, setPersistence, browserLocalPersistence, signOut as firebaseSignOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { User } from 'firebase/auth'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Cookies from 'js-cookie'

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg'

interface AuthUser extends User {
  role?: 'user' | 'admin'
}

interface UserProfile {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  bio: string
  role: 'user' | 'admin'
  level: number
  followers: string[]
  following: string[]
  achievements: string[]
  createdAt: Date
  updatedAt: Date
}

interface AuthContextType {
  user: AuthUser | null
  userProfile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
  isAdmin: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Set persistence to LOCAL at initialization
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error('Error setting persistence:', error)
      })
  }, [])

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setUserProfile(null)
      router.push('/')
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user profile from Firestore
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          const profile = userSnap.data() as UserProfile
          setUserProfile(profile)
          
          // Set session cookie
          Cookies.set('session', 'true', { expires: 7 })

          // Handle login page redirect
          if (pathname === '/login') {
            router.push('/dashboard')
          }
        }
        setUser(user as AuthUser)
      } else {
        setUser(null)
        setUserProfile(null)
        Cookies.remove('session')

        // Redirect to login if trying to access protected routes
        if (pathname.startsWith('/dashboard')) {
          router.push('/login')
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router, pathname])

  const isAdmin = userProfile?.role === 'admin'

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      signOut,
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 