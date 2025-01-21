const express = require('express');
const router = express.Router();
const albums = require('../public/javascripts/albums.js');
const artists = require('../public/javascripts/artists');
const concerts = require('../public/javascripts/concerts');

// Album routes
router.get('/albums', albums.getAllAlbums);
router.get('/albums/:id', albums.getAlbumById);
router.post('/albums', albums.createAlbum);
router.delete('/albums/:id', albums.deleteAlbum);

// Track routes
router.get('/albums/:id/tracks', albums.getAllTracks);
router.post('/albums/:id/tracks', albums.addTrack);
router.delete('/albums/:albumId/tracks/:trackNumber', albums.deleteTrack);

// Artist routes
router.get('/artists', artists.getAllArtists);
router.post('/artists', artists.createArtist);
router.put('/artists/:id', artists.updateArtist);

// Concert routes
router.get('/concerts', concerts.getAllConcerts);
router.patch('/concerts/:id', concerts.updateConcert);

module.exports = router; 