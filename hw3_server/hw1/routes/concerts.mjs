import { Router } from 'express'
import { isNonEmptyString } from '../validators.mjs'
import { getConcerts, updateConcertStartTime } from '../models/in_memory/concerts.mjs'

const router = Router()

router.get('/', (req, res) => {
    const {
        startDate,
        endDate
    } = req.query
    if(!isNonEmptyString(startDate) || !isNonEmptyString(endDate)) {
        res.status(400).end()
        return
    }
    const parsedStartDate = new Date(startDate)
    const parsedEndDate = new Date(endDate)
    if(isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
        res.status(400).end()
    } else {
        res.send(getConcerts(startDate, endDate))
    }
})

router.put('/:id/start-time', (req, res) => {
    const id = parseInt(req.path.id)
    const startTime = req.body
    if(isNaN(id) || !isNonEmptyString(startTime)) {
        res.status(400).end()
        return 
    }
    const parsedStartTime = new Date(startTime)
    if(isNaN(parsedStartTime)) {
        res.status(400).end()
        return
    }
    const concertWasFound = updateConcertStartTime()
    if(!concertWasFound) {
        res.status(404)
    }
    res.end()
})

export default router