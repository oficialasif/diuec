import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyDUp66xjZbk-e_ej9s9EwRflV03fDVVDQU",
  authDomain: "diuec-1.firebaseapp.com",
  projectId: "diuec-1",
  storageBucket: "diuec-1.firebasestorage.app",
  messagingSenderId: "501548933013",
  appId: "1:501548933013:web:a027a0f7111893a57aa09c",
  measurementId: "G-XDFYZSCBJP"
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.')
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support offline persistence')
    }
  })
}

// Initialize Analytics and export it conditionally
export const analytics = typeof window !== 'undefined' 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null) 
  : null

export default app 