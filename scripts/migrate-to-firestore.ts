import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { firestore } from '../src/lib/firebaseAdmin'

const prisma = new PrismaClient()

async function migrate() {
  try {
    console.log('Fetching users from SQLite...')
    const users = await prisma.user.findMany({ include: { dailyLogs: true, goals: true, badges: true } })

    console.log(`Found ${users.length} users; writing to Firestore...`)
    for (const u of users) {
      const userRef = firestore.collection('users').doc(u.id)
      const { dailyLogs, goals, badges, ...userRest } = u as any
      await userRef.set(userRest)

      const logsCol = userRef.collection('dailyLogs')
      for (const log of dailyLogs || []) {
        const lod = { ...log }
        await logsCol.doc(log.id).set(lod)
      }

      const goalsCol = userRef.collection('goals')
      for (const g of goals || []) {
        await goalsCol.doc(g.id).set(g)
      }

      const badgesCol = userRef.collection('badges')
      for (const b of badges || []) {
        await badgesCol.doc(b.id).set(b)
      }
    }

    console.log('Migration complete')
  } catch (err) {
    console.error('Migration failed', err)
  } finally {
    await prisma.$disconnect()
  }
}

migrate()
