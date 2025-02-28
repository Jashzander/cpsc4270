import {getDatabase} from './db.mjs'

const getCollection = async () => (await getDatabase()).collection('tags')

export async function getTagsForTrack(trackId) {
  const collection = await getCollection()
  return collection.find({trackId}).map(doc => doc.tag).toArray()
}

export async function addTag(trackId, tag) {
  const collection = await getCollection()
  await collection.insertOne({trackId, tag})
}

export async function voteForTag(trackId, tag, userId, isUpvote) {
  const collection = await getCollection()

  await collection.updateOne({trackId, tag}, {
    $addToSet: { [(isUpvote ? 'upvotes' : 'downvotes')]: userId },
    $pull: { [(isUpvote ? 'downvotes' : 'upvotes')]: userId }
  })
}

export async function getPositivelyAssociatedTracksByTag(tagName) {
  const collection = await getCollection()
  return collection.aggregate([
    { '$match': { 'tag': tagName } },
    { '$addFields': {
      'upvoteCount': {
        '$size': { '$ifNull': ['$upvotes', []] }
      },
      'downvoteCount': {
        '$size': { '$ifNull': ['$downvotes', []] }
      }
    }},
    { '$match': {
      '$expr': { '$gt': ['$upvoteCount', '$downvoteCount'] }
    }},
    {
      '$project': {
        trackId: 1,
        upvoteCount: 1,
        downvoteCount: 1,
        _id: 0
      }
    }
  ]).toArray()
}