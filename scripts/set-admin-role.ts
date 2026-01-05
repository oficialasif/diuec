// Quick script to set admin role for a specific user
// Run this with: npx tsx scripts/set-admin-role.ts

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Your user UID from the console logs
const USER_UID = 'zdfFRxth4wVjOSCdVb1CB33ekm73'

async function setAdminRole() {
    try {
        // Initialize Firebase Admin (you'll need to set up service account)
        // For now, just use the Firebase Console or the /setup-admin page

        console.log('⚠️  This script requires Firebase Admin SDK setup.')
        console.log('📝 Instead, use one of these methods:')
        console.log('')
        console.log('1. Navigate to: http://localhost:3000/setup-admin')
        console.log('   - Log in with your Google account')
        console.log('   - Click "Make Me Admin"')
        console.log('')
        console.log('2. Firebase Console:')
        console.log('   - Go to Firestore Database')
        console.log('   - Find users collection')
        console.log(`   - Find document: ${USER_UID}`)
        console.log('   - Change role field from "user" to "admin"')
        console.log('')
    } catch (error) {
        console.error('Error:', error)
    }
}

setAdminRole()
