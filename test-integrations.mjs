// Quick test script to verify Cloudinary and Firebase setup
// Run with: node --env-file=.env test-integrations.mjs

console.log('🔍 Testing Environment Variables...\n')

// Test Cloudinary
console.log('📸 CLOUDINARY CONFIGURATION:')
console.log('  CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing')
console.log('  CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing')
console.log('  CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing')

// Test Firebase
console.log('\n🔥 FIREBASE CONFIGURATION:')
const firebaseVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'
]

let firebaseOk = true
firebaseVars.forEach(varName => {
    const isSet = !!process.env[varName]
    console.log(`  ${varName}:`, isSet ? '✅ Set' : '⚠️  Using fallback')
    if (!isSet) firebaseOk = false
})

// Test Clerk
console.log('\n🔐 CLERK CONFIGURATION:')
console.log('  CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? '✅ Set' : '❌ Missing')
console.log('  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing')

// Summary
console.log('\n' + '='.repeat(50))
console.log('📋 SUMMARY:')
console.log('='.repeat(50))

const cloudinaryOk = process.env.CLOUDINARY_CLOUD_NAME && 
                     process.env.CLOUDINARY_API_KEY && 
                     process.env.CLOUDINARY_API_SECRET

console.log(`Cloudinary Upload: ${cloudinaryOk ? '✅ READY' : '❌ NOT CONFIGURED'}`)
console.log(`Firebase Setup: ${firebaseOk ? '✅ READY' : '⚠️  USING FALLBACK VALUES'}`)
console.log(`Clerk Auth: ${process.env.CLERK_SECRET_KEY ? '✅ READY' : '❌ NOT CONFIGURED'}`)

if (cloudinaryOk && process.env.CLERK_SECRET_KEY) {
    console.log('\n✨ All integrations are properly configured!')
} else {
    console.log('\n⚠️  Some integrations may not work properly.')
}
