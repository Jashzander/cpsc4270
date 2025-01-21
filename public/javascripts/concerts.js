const express = require('express');
const router = express.Router();

let concerts = [
    { id: 1, startTime: "2025-01-20T18:00:00Z", duration: "3hrs", primaryArtist: "Kanye West", additionalArtists: ["Tyler The Creator"]},
    { id: 2, startTime: "2025-01-21T19:00:00Z", duration: "2hrs", primaryArtist: "Frank Ocean", additionalArtists: ["Kendrick Lamar"] }
];
let nextConcertId = 3;

const findById = (arr, id) => arr.find(item => item.id === id);

// Input validation middleware
const validateConcert = (req, res, next) => {
    const { startTime, duration, primaryArtist, additionalArtists } = req.body;

    // Required fields
    if (!startTime || !Date.parse(startTime)) {
        return res.status(400).json({ error: 'Valid start time is required (ISO 8601 format)' });
    }
    if (!duration || typeof duration !== 'string' || !duration.match(/^\d+hrs?$/)) {
        return res.status(400).json({ error: 'Duration is required (format: "2hrs" or "2hr")' });
    }
    if (!primaryArtist || typeof primaryArtist !== 'string' || primaryArtist.trim().length === 0) {
        return res.status(400).json({ error: 'Primary artist is required' });
    }

    // Optional field validation
    if (additionalArtists && !Array.isArray(additionalArtists)) {
        return res.status(400).json({ error: 'Additional artists must be an array' });
    }

    next();
};

// Routes
router.post('/', validateConcert, (req, res) => {
    const { startTime, duration, primaryArtist, additionalArtists } = req.body;
    const concert = {
        id: nextConcertId++,
        startTime,
        duration,
        primaryArtist: primaryArtist.trim(),
        additionalArtists: additionalArtists || []
    };
    concerts.push(concert);
    res.status(201).json(concert);
});

// Export route handlers
module.exports = {
    getAllConcerts: (req, res) => {
        const { minDate, maxDate } = req.query;
        
        if (!minDate && !maxDate) {
            return res.json(concerts);
        }

        try {
            const min = minDate ? new Date(minDate) : new Date(0);
            const max = maxDate ? new Date(maxDate) : new Date(8640000000000000);
            
            const result = concerts.filter(c => {
                const start = new Date(c.startTime);
                return start >= min && start <= max;
            });
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: 'Invalid date format' });
        }
    },
    
    updateConcert: (req, res) => {
        const { startTime } = req.body;
        const concert = findById(concerts, parseInt(req.params.id));
        if (!concert) return res.status(404).send('Concert not found');
        if (!startTime) return res.status(400).send('Invalid start time');
        concert.startTime = startTime;
        res.json(concert);
    }
};