import {getDatabase} from './db.mjs'
import {ObjectId} from 'mongodb'

const getCollection = async () => (await getDatabase()).collection('playlists')

export async function addPlaylist(playlist) {
  const collection = await getCollection()
  const { insertedId } = await collection.insertOne(playlist)
  return insertedId
}

export async function addTrackToPlaylist(playlistId, trackId) {
  const collection = await getCollection()
  const result = await collection.updateOne({ _id: new ObjectId(playlistId) }, { $addToSet: { tracks: trackId } })
  return result.matchedCount > 0
}

export async function moveTrack(playistId, trackId, newPosition) {
  const collection = await getCollection()
  // TODO: wrap this in a transaction so we can't accidentally remove and fail to re-add
  // could also get array, modify locally, then upload, but that risks squashing concurrent changes
  const objectId = new ObjectId(playistId)
  await collection.updateOne({ _id: objectId }, { $pull: { tracks: trackId } })
  await collection.updateOne({ _id: objectId }, { $push: { tracks: { $each: [trackId], $position: newPosition } } })
}

export async function removeTrackFromPlaylist(playlistId, trackId) {
  const collection = await getCollection()
  const result = await collection.updateOne({ _id: new ObjectId(playlistId) }, { $pull: { tracks: trackId } })
  return result.matchedCount > 0
}

export async function setIsPublic(playlistId, isPublic) {
  const collection = await getCollection()
  const result = await collection.updateOne({ _id: new ObjectId(playlistId) }, { $set: { isPublic } })
  return result.matchedCount > 0
}

export async function getPlaylists(userId) {
  const collection = await getCollection()

  return collection.find({
    $or: [
      { isPublic: true },
      { createdBy: { $eq: userId } }
    ]
  }).toArray()
}