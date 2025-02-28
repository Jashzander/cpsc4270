import { Router } from 'express'
import { addArtist, getArtists, updateArtist } from '../models/in_memory/artists.mjs'
import { isNonEmptyString, isNullishOrArray, isNullishOrNonEmptyString } from '../validators.mjs'

const router = Router()

router.get('/', (req, res) => {
    res.send(getArtists())
})

router.post('/', (req, res) => {
    const artist = extractArtist(req.body)
    if(!artist) {
        res.status(400).end()
        return
    }
    const id = addArtist(artist)
    res.status(201).send(`${req.originalUrl}/${id}`)
})

function extractArtist(userInput) {
    const {
        name,
        biography,
        socialMediaLinks
    } = userInput.body
    if(!isNonEmptyString(name) || !isNonEmptyString(biography) || !isNullishOrArray(socialMediaLinks)) {
        return
    }
    return {
        name,
        biography,
        socialMediaLinks
    }
}
router.patch('/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const {
        name,
        biography,
        socialMediaLinks
    } = req.body
    if(isNaN(id)
        || !isNullishOrNonEmptyString(name)
        || !isNullishOrNonEmptyString(biography)
        || !isNullishOrArray(socialMediaLinks)
    ) {
        res.status(400).end()
    }
    const updatedFields = {}
    if(name) {
        updatedFields.name = name
    }
    if(biography) {
        updatedFields.biography = biography
    }
    if(socialMediaLinks) {
        updatedFields.socialMediaLinks = socialMediaLinks
    }
    const artistWasFound = updateArtist(updatedFields)
    if(!artistWasFound) {
        res.status(404)
    }
    res.end()
})

export default router