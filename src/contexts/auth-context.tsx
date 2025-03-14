'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { User } from 'firebase/auth'

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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get or create user profile
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
          // Create new user profile
          const newProfile: Omit<UserProfile, 'uid'> = {
            displayName: user.displayName,
            email: user.email,
            photoURL: DEFAULT_AVATAR,
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
        } else {
          setUserProfile({ uid: user.uid, ...userSnap.data() } as UserProfile)
        }
        setUser(user as AuthUser)
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
} 