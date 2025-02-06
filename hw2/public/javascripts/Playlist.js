const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Playlist = sequelize.define('Playlist', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: { // ADDED THIS FIELD
        type: DataTypes.STRING,
        allowNull: true
    },
    isPrivate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    tracks: {
        type: DataTypes.JSON,  // Store tracks as JSON array
        defaultValue: []
    },
    userId: {
        type: DataTypes.STRING,  // Store Auth0 user ID
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = Playlist;