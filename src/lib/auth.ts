import { auth } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'

export type AuthUser = User

export async function signUp(email: string, password: string) {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    return { user, error: null }
  } catch (error: any) {
    return {
      user: null,
      error: error.message || 'An error occurred during sign up',
    }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    return { user, error: null }
  } catch (error: any) {
    return {
      user: null,
      error: error.message || 'An error occurred during sign in',
    }
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth)
    return { error: null }
  } catch (error: any) {
    return {
      error: error.message || 'An error occurred during sign out',
    }
  }
}

export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return onAuthStateChanged(auth, callback)
} 