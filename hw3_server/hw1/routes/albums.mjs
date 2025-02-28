import { Router } from 'express'
import tracksRouter from './tracks.mjs'
import { getAlbums, addAlbum, getAlbumById, deleteAlbum } from '../models/in_memory/albums.mjs'
import { deleteAllTracksForAlbum } from '../models/in_memory/tracks.mjs'
import { isNonEmptyString } from '../validators.mjs'

const router = Router()

router.get('/', (req, res) => {
    res.send(getAlbums())
})

router.post('/', (req, res) => {
    const album = extractAlbum(req.body)
    if(!album) {
        res.status(400).end()
    }
    const id = addAlbum(album)
    res.status(201).send(`${req.originalUrl}/${id}`)
})

function extractAlbum(userInput) {
    const {
        name,
        yearReleased,
        genre
    } = userInput
    if(!isNonEmptyString(name) || !isNonEmptyString(genre)) {
        return
    }
    const yearReleasedAsInt = parseInt(yearReleased)
    if(isNaN(yearReleasedAsInt)) {
        return
    }
    return {
        name,
        yearReleased: yearReleasedAsInt,
        genre
    }
}

router.get('/:id', (req, res) => {
    const idAsInt = parseInt(req.params.id)
    // technically this is covered automatically by !album below, but less efficiently
    if(isNaN(idAsInt)) {
        res.status(404).end()
    }
    const album = getAlbumById(idAsInt)
    if(!album) {
        res.status(404).end()
    }
    res.send(album)
})

router.delete('/:id', (req, res) => {
    const idAsInt = parseInt(req.params.id)
    if(!isNaN(idAsInt)) {
        deleteAllTracksForAlbum(idAsInt)
        deleteAlbum(idAsInt)
    }
    // Only way to fail is if deleteAlbum throws an exception; if it never existed, it's still gone
    res.status(204).end()
})

router.use('/:albumId/tracks', tracksRouter)

export default router