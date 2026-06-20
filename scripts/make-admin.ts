import 'dotenv/config'
import { firestore } from '../src/lib/firebaseAdmin'
import { getUserById, createOrUpdateUser } from '../src/lib/firestore'

async function main() {
  const adminEmail = 'admin@ecotrack.app'
  
  try {
    // Check if user exists by querying collection
    const snap = await firestore.collection('users').where('email', '==', adminEmail).limit(1).get()
    
    if (!snap.empty) {
      // User exists, update to admin
      const docId = snap.docs[0].id
      await firestore.collection('users').doc(docId).update({ isAdmin: true })
      console.log('✅ Admin updated:', adminEmail)
    } else {
      // Create new admin user
      // Use email as UID for Firebase Auth (in production, should use Firebase Auth UID)
      const adminId = adminEmail.split('@')[0] + '_admin_' + Date.now()
      
      const adminData = {
        id: adminId,
        email: adminEmail,
        name: 'EcoTrack Admin',
        password: '', // Firebase Auth handles passwords
        country: 'India',
        city: 'Mumbai',
        occupation: 'Administrator',
        diet: 'veg',
        vehicle: 'metro',
        onboarded: true,
        isAdmin: true,
        xp: 5000,
        streak: 99,
        googleAuth: false,
        createdAt: new Date().toISOString(),
      }
      
      await createOrUpdateUser(adminData)
      console.log('✅ Admin created:', adminEmail)
      console.log('   ID:', adminId)
      console.log('   Note: Create this user in Firebase Auth Console with email/password')
    }
    
    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err)
    process.exit(1)
  }
}
