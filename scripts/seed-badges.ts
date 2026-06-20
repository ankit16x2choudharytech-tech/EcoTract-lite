import 'dotenv/config'
import { firestore } from '../src/lib/firebaseAdmin'
import { BADGE_DEFS } from '../src/lib/carbon'

async function main() {
  const badgeDefsCollection = firestore.collection('badgeDefs')
  
  try {
    for (const def of BADGE_DEFS) {
      // Check if badge definition exists
      const snap = await badgeDefsCollection.where('name', '==', def.name).limit(1).get()
      
      if (snap.empty) {
        // Map default badges to auto-criteria
        let criteria = 'manual'
        let threshold = 0
        
        if (def.name === 'Green Starter') {
          criteria = 'loggedDays'
          threshold = 1
        } else if (def.name === 'Eco Explorer') {
          criteria = 'loggedDays'
          threshold = 5
        } else if (def.name === 'Carbon Fighter') {
          criteria = 'loggedDays'
          threshold = 25
        } else if (def.name === 'Planet Protector') {
          criteria = 'streak'
          threshold = 30
        } else if (def.name === 'Earth Hero') {
          criteria = 'manual'
          threshold = 0 // bestDayKg<=5, keep manual
        }
        
        const badgeData = {
          name: def.name,
          description: def.description,
          icon: def.icon,
          criteria,
          threshold,
          isDefault: true,
          createdAt: new Date().toISOString(),
        }
        
        await badgeDefsCollection.add(badgeData)
        console.log('✅ Seeded badge:', def.name)
      } else {
        console.log('ℹ️  Already exists:', def.name)
      }
    }
    
    // Count total badge defs
    const countSnap = await badgeDefsCollection.get()
    console.log(`\n✅ Done. Total badge defs: ${countSnap.size}`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err)
    process.exit(1)
  }
}

main()
