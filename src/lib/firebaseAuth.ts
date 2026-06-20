import admin from 'firebase-admin'

export async function verifyIdToken(idToken: string) {
  if (!idToken) throw new Error('No token provided')
  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    return decoded
  } catch (err) {
    throw err
  }
}

export default { verifyIdToken }
