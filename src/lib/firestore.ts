import { firestore } from './firebaseAdmin'

type User = {
  id: string
  email: string
  name: string
  [k: string]: any
}

export const usersCollection = () => firestore.collection('users')

export async function getUserByEmail(email: string) {
  const snap = await usersCollection().where("email", "==", email).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as any) };
}

export async function getUserById(id: string) {
  const snap = await usersCollection().doc(id).get()
  return snap.exists ? { id: snap.id, ...(snap.data() as any) } : null
}

export async function createOrUpdateUser(user: Partial<User> & { id: string }) {
  const ref = usersCollection().doc(user.id)
  await ref.set(user, { merge: true })
  const snap = await ref.get()
  return { id: snap.id, ...(snap.data() as any) }
}

export async function listUsers(limit = 100) {
  const snap = await usersCollection().limit(limit).get()
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
}

// Daily logs nested under user
export async function getDailyLogs(userId: string) {
  const col = usersCollection().doc(userId).collection('dailyLogs')
  const snap = await col.get()
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
}

export async function addDailyLog(userId: string, log: any) {
  const col = usersCollection().doc(userId).collection('dailyLogs')
  const id = log.id || firestore.collection('_').doc().id
  await col.doc(id).set({ ...log, id })
  const snap = await col.doc(id).get()
  return { id: snap.id, ...(snap.data() as any) }
}

export async function getGoals(userId: string) {
  const col = usersCollection().doc(userId).collection('goals')
  const snap = await col.get()
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
}

export async function addGoal(userId: string, goal: any) {
  const col = usersCollection().doc(userId).collection('goals')
  const id = goal.id || firestore.collection('_').doc().id
  await col.doc(id).set({ ...goal, id })
  const snap = await col.doc(id).get()
  return { id: snap.id, ...(snap.data() as any) }
}

export async function getBadges(userId: string) {
  const col = usersCollection().doc(userId).collection('badges')
  const snap = await col.get()
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
}

export async function addBadge(userId: string, badge: any) {
  const col = usersCollection().doc(userId).collection('badges')
  const id = badge.id || firestore.collection('_').doc().id
  await col.doc(id).set({ ...badge, id })
  const snap = await col.doc(id).get()
  return { id: snap.id, ...(snap.data() as any) }
}

export default {
  getUserById,
  getUserByEmail,
  createOrUpdateUser,
  listUsers,
  getDailyLogs,
  addDailyLog,
  getGoals,
  addGoal,
  getBadges,
  addBadge,
}
