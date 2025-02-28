import { Router } from 'express';
import {addTag, getTagsForTrack, voteForTag} from '../models/mongodb/tags.mjs'

const router = Router({
  mergeParams: true
});

router.post('/', async (req, res) => {
  const trackId = req.params.trackId
  const tag = req.body
  try {
    await addTag(trackId, tag)
  } catch(e) {
    res.status(409).end()
  }
  res.status(200).end()
})

router.get('/', async (req, res) => {
  const tags = await getTagsForTrack(req.params.trackId)
  res.json(tags)
})

router.put('/:tagName/user-votes/my', async (req, res) => {
  const trackId = req.params.trackId
  const tagName = req.params.tagName
  const vote = !!req.body
  await voteForTag(trackId, tagName, req.userId, vote)
  res.status(200).end()
})

export default router;