import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  createUserWithEmailAndPassword 
} from 'firebase/auth'
import { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore'

// Your Firebase configuration
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
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

const ADMIN_EMAIL = 'admin@diuec.com'
const ADMIN_PASSWORD = 'Admin@123456' // You should change this password after first login

async function createAdminAccount() {
  try {
    // Create admin user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    )
    
    const user = userCredential.user

    // Create admin profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: ADMIN_EMAIL,
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
    })

    console.log('Admin account created successfully!')
    console.log('Email:', ADMIN_EMAIL)
    console.log('Password:', ADMIN_PASSWORD)
    console.log('Please change this password after first login')
    
    process.exit(0)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating admin account:', error.message)
    } else {
      console.error('Error creating admin account:', error)
    }
    process.exit(1)
  }
}

createAdminAccount() 