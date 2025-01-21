const express = require('express');
const router = express.Router();

let artists = [
    {id: 1, name: "Kanye West", biography: "Greatest Of All Time", socialMediaLinks: {"twitter": "https://twitter.com/kanyewest"}},
    {id: 2, name: "Frank Ocean", biography: "Artist with Soul", socialMediaLinks: {"twitter": "https://twitter.com/frankisocean"}}
];
let nextArtistId = 3;

const findById = (arr, id) => arr.find(item => item.id === id);

// Input validation middleware
const validateArtist = (req, res, next) => {
    const { name, biography, socialMediaLinks } = req.body;
    
    // Required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
    }
    if (!biography || typeof biography !== 'string' || biography.trim().length === 0) {
        return res.status(400).json({ error: 'Biography is required and must be a non-empty string' });
    }
    
    // Optional field validation
    if (socialMediaLinks && typeof socialMediaLinks !== 'object') {
        return res.status(400).json({ error: 'Social media links must be an object' });
    }

    next();
};

// Export route handlers
module.exports = {
    getAllArtists: (req, res) => {
        res.json(artists);
    },
    
    createArtist: [validateArtist, (req, res) => {
        const { name, biography, socialMediaLinks } = req.body;
        const artist = { 
            id: nextArtistId++, 
            name: name.trim(), 
            biography: biography.trim(), 
            socialMediaLinks: socialMediaLinks || {} 
        };
        artists.push(artist);
        res.status(201).json(artist);
    }],
    
    updateArtist: (req, res) => {
        const { name, biography, socialMediaLinks } = req.body;
        const artist = findById(artists, parseInt(req.params.id));
        if (!artist) return res.status(404).send('Artist not found');
        if (name) artist.name = name;
        if (biography) artist.biography = biography;
        if (socialMediaLinks) artist.socialMediaLinks = socialMediaLinks;
        res.json(artist);
    }
};