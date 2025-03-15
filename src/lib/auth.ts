import { auth } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

const ADMIN_EMAIL = 'admin@diuec.com'

export type AuthUser = User

export async function signUp(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.email?.split('@')[0],
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      bio: '',
      role: 'user', // Default role is user
      level: 1,
      followers: [],
      following: [],
      achievements: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return { user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // If it's the admin email, update the user's role in Firestore
    if (email === ADMIN_EMAIL) {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: 'Admin',
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        bio: 'System Administrator',
        role: 'admin',
        level: 99,
        followers: [],
        following: [],
        achievements: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true })
    }

    return { user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return onAuthStateChanged(auth, callback)
} 