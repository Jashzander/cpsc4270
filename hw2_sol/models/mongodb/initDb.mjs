import {getDatabase} from './db.mjs'

export default async function initDb() {
  const db = await getDatabase()
  await db.collection('tags').createIndex({trackId: 1, tag: 1}, {unique: true})
}