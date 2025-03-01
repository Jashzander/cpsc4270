import {Router} from 'express'
import {body, validationResult, matchedData} from 'express-validator'
import {
  addPlaylist,
  addTrackToPlaylist, getPlaylists,
  moveTrack,
  removeTrackFromPlaylist,
  setIsPublic
} from '../models/mongodb/playlists.mjs'

const router = Router()

router.post(
  '/',
  body('name').isString(),
  body('isPublic').isBoolean(),
  async (req, res) => {
    const validation = validationResult(req)
    if(!validation.isEmpty()) {
      return res.status(400).json({
        errors: validation.array()
      })
    }
    const playlist = matchedData(req)
    playlist.createdBy = req.userId
    playlist.tracks = []
    const generatedId = await addPlaylist(playlist)

    res.status(201).send(`${req.originalUrl}/${generatedId}`)
  }
)

router.post(('/:id/tracks'), async (req, res) => {
  const { trackId } = req.body
  if(!trackId || typeof(trackId) !== 'string') {
    res.status(400).end()
    return
  }
  const playlistId = req.params.id
  const wasFound = await addTrackToPlaylist(playlistId, trackId)
  if(wasFound) {
    res.status(201).end()
    return
  }
  res.status(404).end()
})

// could potentially use https://www.rfc-editor.org/rfc/rfc6902
// simpler but less documented approach: take an object with trackId and position, move track to that position in array
router.patch(
  '/:id/tracks',
  body('trackId').isString(),
  body('position').isInt(),
  async (req, res) => {
    const validation = validationResult(req)
    if(!validation.isEmpty()) {
      return res.status(400).json({
        errors: validation.array()
      })
    }
    const { trackId, position } = matchedData(req)
    const playlistId = req.params.id

    await moveTrack(playlistId, trackId, position)
    res.status(200).end()
})

/* Alternative: most people would use POST under the "submit for processing" part of POST's
   definition. This is slightly less descriptive than PATCH, but better meshes with the
   traditional way of doing this sort of action. When in doubt, follow your company/team's
   conventions unless they're demonstrably harmful (e.g. cause security vulnerabilities).
 */
/*
router.post('/:id/track-reordering', async (req, res) => {

})*/

router.delete('/:playlistId/tracks/:trackId', async (req, res) => {
  const { playlistId, trackId } = req.params
  const wasFound = await removeTrackFromPlaylist(playlistId, trackId)
  if(wasFound) {
    res.status(204).end()
    return
  }
  res.status(404).end()
})

router.put('/:id/isPublic', async (req, res) => {
  const { id } = req.params
  const isPublic = req.body
  if(isPublic == null) {
    res.status(400).end()
    return
  }
  // hack: we could check if isPublic is a boolean, but !! converts anything truthy into true and falsy into false
  const wasFound = setIsPublic(id, !!isPublic)
  if(wasFound) {
    res.status(200).end()
    return
  }
  res.status(404).end()
})

router.get('/', async (req, res) => {
  const playlists = await getPlaylists(req.userId)
  res.send(playlists)
})

export default router