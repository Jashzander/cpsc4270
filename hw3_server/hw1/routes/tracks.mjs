import { Router } from 'express'
import { addTrack, deleteTrack, getTracksForAlbum } from '../models/in_memory/tracks.mjs'
import { getAlbumById } from '../models/in_memory/albums.mjs'
import { isNonEmptyString } from '../validators.mjs'

const router = new Router({ mergeParams: true })

router.use((req, res, next) => {
    const albumIdAsInt = parseInt(req.params.albumId)
    if(isNaN(albumIdAsInt) || !getAlbumById(albumIdAsInt)) {
        res.status(404).end()
        return
    }
    req.albumId = albumIdAsInt
    next()
})

router.get('/', (req, res) => {
    res.send(getTracksForAlbum(req.albumId))
})

router.post('/', (req, res) => {
    const track = extractTrack(req.body)
    if(!track) {
        res.status(400).end()
    }
    track.albumId = req.albumId
    addTrack(req.albumId, track)
})

const durationPattern = /^[0-9]{2}:[0-9]{2}(:[0-9]{2})?$/

function extractTrack(userInput) {
    const { title, duration, primaryArtist } = userInput
    if(!isNonEmptyString(title)
        || !isNonEmptyString(duration)
        || !isNonEmptyString(primaryArtist)
        || !durationPattern.test(duration)
    ) {
        return
    }
    return {
        title,
        duration,
        primaryArtist
    }
}

router.delete('/:trackNumber', (req, res) => {
    const trackNumberAsInt = parseInt(req.params.trackNumber)
    if(!isNaN(trackNumberAsInt)) {
        deleteTrack(req.albumId, trackNumberAsInt)
    }
    res.status(204).end()
})

export default router