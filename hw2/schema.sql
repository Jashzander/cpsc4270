-- Drop tables if they exist to ensure clean setup
DROP TABLE IF EXISTS Tags;
DROP TABLE IF EXISTS Playlists;
DROP TABLE IF EXISTS Users;

-- Create Users table
CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- Create Playlists table
CREATE TABLE Playlists (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    isPrivate BOOLEAN DEFAULT FALSE,
    tracks JSON DEFAULT NULL,
    userId VARCHAR(255) NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Create Tags table
CREATE TABLE Tags (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    trackId INTEGER NOT NULL,
    tag VARCHAR(255) NOT NULL,
    userId VARCHAR(255) NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    votedUsers JSON DEFAULT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Add indexes for better query performance
CREATE INDEX idx_playlist_user ON Playlists(userId);
CREATE INDEX idx_tag_track ON Tags(trackId);
CREATE INDEX idx_tag_user ON Tags(userId);
CREATE INDEX idx_tag_name ON Tags(tag);

-- Add unique constraint to prevent duplicate tags per track
CREATE UNIQUE INDEX idx_unique_track_tag ON Tags(trackId, tag); 