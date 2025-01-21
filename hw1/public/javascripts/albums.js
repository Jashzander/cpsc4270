const express = require('express');
const router = express.Router();

let albums = [
    {
        id: 1,
        name: "My Beautiful Dark Twisted Fantasy",
        yearReleased: 2010,
        genre: "Hip Hop",
        tracks: [
            { trackNumber: 1, title: "Dark Fantasy", duration: "4:40", primaryArtist: "Kanye West" },
            { trackNumber: 2, title: "Gorgeous", duration: "5:57", primaryArtist: "Kanye West" },
            { trackNumber: 3, title: "POWER", duration: "4:52", primaryArtist: "Kanye West" },
            { trackNumber: 4, title: "All Of The Lights", duration: "4:59", primaryArtist: "Kanye West" },
            { trackNumber: 5, title: "Monster", duration: "6:18", primaryArtist: "Kanye West" },
            { trackNumber: 6, title: "Runaway", duration: "9:08", primaryArtist: "Kanye West" }
        ]
    },
    {
        id: 2,
        name: "Blonde",
        yearReleased: 2016,
        genre: "R&B",
        tracks: [
            { trackNumber: 1, title: "Nikes", duration: "5:14", primaryArtist: "Frank Ocean" },
            { trackNumber: 2, title: "Ivy", duration: "4:09", primaryArtist: "Frank Ocean" },
            { trackNumber: 3, title: "Pink + White", duration: "3:04", primaryArtist: "Frank Ocean" },
            { trackNumber: 4, title: "Solo", duration: "4:17", primaryArtist: "Frank Ocean" },
            { trackNumber: 5, title: "Nights", duration: "5:07", primaryArtist: "Frank Ocean" },
            { trackNumber: 6, title: "White Ferrari", duration: "4:08", primaryArtist: "Frank Ocean" }
        ]
    },
    {
        id: 3,
        name: "Graduation",
        yearReleased: 2007,
        genre: "Hip Hop",
        tracks: [
            { trackNumber: 1, title: "Good Morning", duration: "3:15", primaryArtist: "Kanye West" },
            { trackNumber: 2, title: "Champion", duration: "2:47", primaryArtist: "Kanye West" },
            { trackNumber: 3, title: "Stronger", duration: "5:11", primaryArtist: "Kanye West" },
            { trackNumber: 4, title: "I Wonder", duration: "4:03", primaryArtist: "Kanye West" },
            { trackNumber: 5, title: "Can't Tell Me Nothing", duration: "4:31", primaryArtist: "Kanye West" }
        ]
    },
    {
        id: 4,
        name: "Channel Orange",
        yearReleased: 2012,
        genre: "R&B",
        tracks: [
            { trackNumber: 1, title: "Thinkin Bout You", duration: "3:20", primaryArtist: "Frank Ocean" },
            { trackNumber: 2, title: "Sweet Life", duration: "4:22", primaryArtist: "Frank Ocean" },
            { trackNumber: 3, title: "Super Rich Kids", duration: "5:04", primaryArtist: "Frank Ocean" },
            { trackNumber: 4, title: "Pyramids", duration: "9:54", primaryArtist: "Frank Ocean" },
            { trackNumber: 5, title: "Lost", duration: "3:54", primaryArtist: "Frank Ocean" }
        ]
    }
];
let nextAlbumId = 5;

const findById = (arr, id) => arr.find(item => item.id === id);
const removeById = (arr, id) => {
    const index = arr.findIndex(item => item.id === id);
    if (index !== -1) arr.splice(index, 1);
};

// Input validation middleware
const validateAlbum = (req, res, next) => {
    const { name, yearReleased, genre } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
    }
    
    const year = parseInt(yearReleased);
    if (!year || year < 1900 || year > new Date().getFullYear() + 5) {
        return res.status(400).json({ error: 'Valid year is required (between 1900 and 5 years from now)' });
    }
    
    if (!genre || typeof genre !== 'string' || genre.trim().length === 0) {
        return res.status(400).json({ error: 'Genre is required and must be a non-empty string' });
    }

    next();
};

const validateTrack = (req, res, next) => {
    const { trackNumber, title, duration, primaryArtist } = req.body;

    if (!Number.isInteger(trackNumber) || trackNumber < 1) {
        return res.status(400).json({ error: 'Track number must be a positive integer' });
    }
    
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
    }
    
    if (!duration || !duration.match(/^([0-9]+:)?[0-5]?[0-9]:[0-5][0-9]$/)) {
        return res.status(400).json({ error: 'Duration must be in format MM:SS or HH:MM:SS' });
    }
    
    if (!primaryArtist || typeof primaryArtist !== 'string' || primaryArtist.trim().length === 0) {
        return res.status(400).json({ error: 'Primary artist is required and must be a non-empty string' });
    }

    next();
};

// Export all the route handlers
module.exports = {
    getAllAlbums: (req, res) => {
        res.json(albums);
    },
    
    getAlbumById: (req, res) => {
        const album = findById(albums, parseInt(req.params.id));
        if (!album) return res.status(404).send('Album not found');
        res.json(album);
    },
    
    createAlbum: [validateAlbum, (req, res) => {
        const { name, yearReleased, genre } = req.body;
        const album = {
            id: nextAlbumId++,
            name: name.trim(),
            yearReleased: parseInt(yearReleased),
            genre: genre.trim(),
            tracks: []
        };
        albums.push(album);
        res.status(201).json(album);
    }],
    
    deleteAlbum: (req, res) => {
        const albumId = parseInt(req.params.id);
        const album = findById(albums, albumId);
        if (!album) return res.status(404).send('Album not found');
        removeById(albums, albumId);
        res.status(204).send();
    },
    
    getAllTracks: (req, res) => {
        const album = findById(albums, parseInt(req.params.id));
        if (!album) return res.status(404).send('Album not found');
        res.json(album.tracks);
    },
    
    addTrack: [validateTrack, (req, res) => {
        const { trackNumber, title, duration, primaryArtist } = req.body;
        const album = findById(albums, parseInt(req.params.id));
        if (!album) return res.status(404).send('Album not found');
        
        if (album.tracks.some(t => t.trackNumber === trackNumber)) {
            return res.status(400).json({ error: 'Track number already exists in this album' });
        }

        const track = {
            trackNumber,
            title: title.trim(),
            duration,
            primaryArtist: primaryArtist.trim()
        };
        album.tracks.push(track);
        album.tracks.sort((a, b) => a.trackNumber - b.trackNumber);
        res.status(201).json(track);
    }],
    
    deleteTrack: (req, res) => {
        const album = findById(albums, parseInt(req.params.albumId));
        if (!album) return res.status(404).send('Album not found');
        const trackIndex = album.tracks.findIndex(t => t.trackNumber === parseInt(req.params.trackNumber));
        if (trackIndex === -1) return res.status(404).send('Track not found');
        album.tracks.splice(trackIndex, 1);
        res.status(204).send();
    }
};