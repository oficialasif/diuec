'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { User } from 'firebase/auth'
import { useRouter } from 'next/navigation'
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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Set persistence to LOCAL at initialization
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error('Error setting persistence:', error)
      })
  }, [])

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      setUser(null)
      setUserProfile(null)
      Cookies.remove('session') // Remove session cookie
      toast.success('Signed out successfully')
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Error signing out')
    }
  }

  useEffect(() => {
    let unsubscribe: () => void

    const initializeAuth = async () => {
      try {
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          console.log('Auth state changed:', user?.email) // Debug log
          
          if (user) {
            // Set session cookie when user is authenticated
            const token = await user.getIdToken()
            Cookies.set('session', token, { 
              expires: 7, // 7 days
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax'
            })

            const userRef = doc(db, 'users', user.uid)
            const userSnap = await getDoc(userRef)

            if (!userSnap.exists()) {
              const newProfile: Omit<UserProfile, 'uid'> = {
                displayName: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email,
                photoURL: user.photoURL || `${DEFAULT_AVATAR}?seed=${user.uid}`,
                bio: '',
                role: 'user',
                level: 1,
                followers: [],
                following: [],
                achievements: [],
                createdAt: new Date(),
                updatedAt: new Date(),
              }
              await setDoc(userRef, newProfile)
              setUserProfile({ uid: user.uid, ...newProfile })
              toast.success('Welcome to DIU Esports Community!')
            } else {
              setUserProfile({ uid: user.uid, ...userSnap.data() } as UserProfile)
            }
            setUser(user as AuthUser)
          } else {
            setUser(null)
            setUserProfile(null)
            Cookies.remove('session') // Remove session cookie when user is not authenticated
          }
        })
      } catch (error) {
        console.error('Error in auth initialization:', error)
        setUser(null)
        setUserProfile(null)
        Cookies.remove('session')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut: handleSignOut }}>
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