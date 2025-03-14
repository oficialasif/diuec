import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyBRiwxdKhJG935aL-gOgUQ28YUqqxhzVu8",
  authDomain: "diu-esports-community.firebaseapp.com",
  databaseURL: "https://diu-esports-community-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "diu-esports-community",
  storageBucket: "diu-esports-community.firebasestorage.app",
  messagingSenderId: "403239318204",
  appId: "1:403239318204:web:cc4b9f2b6392042493d6b9",
  measurementId: "G-XR1GT796ZE"
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

// Initialize Analytics and export it conditionally
export const analytics = typeof window !== 'undefined' 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null) 
  : null

export default app 