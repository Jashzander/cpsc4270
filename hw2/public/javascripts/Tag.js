const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Tag = sequelize.define('Tag', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    trackId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tag: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    upvotes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    downvotes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    votedUsers: {
        type: DataTypes.JSON,  // Store voted users as JSON array
        allowNull: false,
        defaultValue: []
    }
}, {
    timestamps: true
});

module.exports = Tag;