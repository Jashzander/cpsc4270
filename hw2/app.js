// app.js
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const errorHandler = require('./public/javascripts/errorHandler');
require('dotenv').config();

// Import database connection
const sequelize = require('./public/javascripts/database');

// Import models
require('./public/javascripts/User');
require('./public/javascripts/Playlist');
require('./public/javascripts/Tag');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/auth', authRoutes);
app.use('/playlists', playlistRoutes);

// Home page route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Start server only after database connection is established
async function startServer() {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('Database connection established');

        // Force sync in development (this drops existing tables)
        await sequelize.sync({ force: true }); 
        console.log('Database models synchronized');

        const port = process.env.PORT || 3001;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
}

// Initialize server
if (require.main === module) {
    startServer();
}

module.exports = app;
