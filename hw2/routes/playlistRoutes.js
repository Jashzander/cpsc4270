const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Playlist = require('../public/javascripts/Playlist');
const Tag = require('../public/javascripts/Tag');
const auth = require('../middleware/auth');

// Create a new playlist
router.post('/', auth, async (req, res) => {
    try {
        const playlist = await Playlist.create({
            name: req.body.name,
            description: req.body.description,
            userId: req.user.id
        });
        res.status(201).json(playlist);
    } catch (error) {
        res.status(400).json({ error: 'Error creating playlist' });
    }
});

// List all user playlists
router.get('/my-playlists', auth, async (req, res) => {
    try {
        const playlists = await Playlist.findAll({
            where: { userId: req.user.id }
        });
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching playlists' });
    }
});

// Add a tag to a track
router.post('/tags', auth,
    body('trackId').isNumeric(),
    body('tag').isString().notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { trackId, tag } = req.body;
            const newTag = await Tag.create({ trackId, tag, userId: req.user.id });
            res.status(201).json(newTag);
        } catch (error) {
            res.status(500).json({ error: 'Error adding tag' });
        }
    }
);

// Upvote a tag
router.post('/tags/:id/upvote', auth, async (req, res) => {
    try {
        const tag = await Tag.findByPk(req.params.id);
        if (!tag) return res.status(404).json({ error: 'Tag not found' });

        let votedUsers = tag.votedUsers || [];
        const existingVote = votedUsers.find(v => v.userId === req.user.id);

        if (existingVote && existingVote.voteType === 'up') {
            return res.status(400).json({ error: 'Already upvoted' });
        }

        if (existingVote) {
            tag.downvotes -= 1;
            existingVote.voteType = 'up';
        } else {
            tag.upvotes += 1;
            votedUsers.push({ userId: req.user.id, voteType: 'up' });
        }

        tag.votedUsers = votedUsers;
        await tag.save();
        res.json(tag);
    } catch (error) {
        res.status(500).json({ error: 'Error upvoting tag' });
    }
});

// Downvote a tag (similar to upvote)
router.post('/tags/:id/downvote', auth, async (req, res) => {
    try {
        const tag = await Tag.findByPk(req.params.id);
        if (!tag) return res.status(404).json({ error: 'Tag not found' });

        let votedUsers = tag.votedUsers || [];
        const existingVote = votedUsers.find(v => v.userId === req.user.id);

        if (existingVote && existingVote.voteType === 'down') {
            return res.status(400).json({ error: 'Already downvoted' });
        }

        if (existingVote) {
            tag.upvotes -= 1;
            existingVote.voteType = 'down';
        } else {
            tag.downvotes += 1;
            votedUsers.push({ userId: req.user.id, voteType: 'down' });
        }

        tag.votedUsers = votedUsers;
        await tag.save();
        res.json(tag);
    } catch (error) {
        res.status(500).json({ error: 'Error downvoting tag' });
    }
});

// Add tracks to playlist
router.post('/:id/tracks', auth, async (req, res) => {
    try {
        const playlist = await Playlist.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found or unauthorized' });
        }

        const tracks = playlist.tracks || [];
        const newTracks = Array.isArray(req.body.tracks) ? req.body.tracks : [req.body.tracks];
        playlist.tracks = [...tracks, ...newTracks];
        
        await playlist.save();
        res.json(playlist);
    } catch (error) {
        res.status(500).json({ error: 'Error adding tracks' });
    }
});

// Remove track from playlist
router.delete('/:id/tracks/:trackIndex', auth, async (req, res) => {
    try {
        const playlist = await Playlist.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found or unauthorized' });
        }

        const tracks = playlist.tracks || [];
        const trackIndex = parseInt(req.params.trackIndex);
        
        if (trackIndex < 0 || trackIndex >= tracks.length) {
            return res.status(400).json({ error: 'Invalid track index' });
        }

        tracks.splice(trackIndex, 1);
        playlist.tracks = tracks;
        
        await playlist.save();
        res.json(playlist);
    } catch (error) {
        res.status(500).json({ error: 'Error removing track' });
    }
});

// Reorder tracks in playlist
router.patch('/:id/reorder', auth, async (req, res) => {
    try {
        const playlist = await Playlist.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found or unauthorized' });
        }

        const { fromIndex, toIndex } = req.body;
        const tracks = playlist.tracks || [];
        
        if (fromIndex < 0 || fromIndex >= tracks.length || 
            toIndex < 0 || toIndex >= tracks.length) {
            return res.status(400).json({ error: 'Invalid indices' });
        }

        const [track] = tracks.splice(fromIndex, 1);
        tracks.splice(toIndex, 0, track);
        playlist.tracks = tracks;
        
        await playlist.save();
        res.json(playlist);
    } catch (error) {
        res.status(500).json({ error: 'Error reordering tracks' });
    }
});

// Update playlist privacy
router.patch('/:id/privacy', auth, async (req, res) => {
    try {
        const playlist = await Playlist.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found or unauthorized' });
        }

        playlist.isPrivate = req.body.isPrivate;
        await playlist.save();
        res.json(playlist);
    } catch (error) {
        res.status(500).json({ error: 'Error updating privacy setting' });
    }
});

// List all public playlists
router.get('/public', async (req, res) => {
    try {
        const playlists = await Playlist.findAll({
            where: { isPrivate: false }
        });
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching public playlists' });
    }
});

// Get tracks by tag (where upvotes > downvotes)
router.get('/tracks/by-tag/:tag', async (req, res) => {
    try {
        const tags = await Tag.findAll({
            where: {
                tag: req.params.tag
            }
        });

        const popularTags = tags.filter(tag => tag.upvotes > tag.downvotes);
        const trackIds = [...new Set(popularTags.map(tag => tag.trackId))];
        
        res.json({ trackIds });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching tracks by tag' });
    }
});

module.exports = router;