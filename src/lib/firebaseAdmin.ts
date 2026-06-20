/*
import admin from 'firebase-admin'
import fs from 'fs'

let app: admin.app.App

if (!admin.apps.length) {
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT || './serviceAccountKey.json'
  const creds = JSON.parse(fs.readFileSync(keyPath, 'utf8'))
  app = admin.initializeApp({
    credential: admin.credential.cert(creds),
  })
} else {
  app = admin.app()
}

export const firestore = admin.firestore()
export default app
*/
import admin from 'firebase-admin'

let app: admin.app.App

if (!admin.apps.length) {
  let creds;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    // Vercel ya Production ke liye (String se Parse karega)
    creds = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else {
    // Local development ke liye individual variables ka fallback
    creds = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Private key mein newline character (\n) ko sahi se handle karne ke liye
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
  }

  // Agar variables mil gye hain toh initialize karein
  app = admin.initializeApp({
    credential: admin.credential.cert(creds),
  })
} else {
  app = admin.app()
}

export const firestore = admin.firestore()
export default app;
