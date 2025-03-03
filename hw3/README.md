# Pandify - Music Playlist Manager

A React-based frontend application for managing music playlists. This application allows users to create, edit, and manage their music playlists with authentication provided by Auth0.

## Features

- User authentication with Auth0
- View a list of your playlists
- Create new playlists
- Edit existing playlists
  - Rename playlists
  - Change privacy settings
  - Add tracks from available albums
  - Remove tracks from playlists
  - Reorder tracks within playlists
- Browse available albums and tracks

## Technologies Used

- React 19
- React Router v7
- Auth0 for authentication
- Vite for build tooling
- CSS for styling

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your Auth0 credentials:
   ```
   VITE_AUTH0_DOMAIN=your-auth0-domain
   VITE_AUTH0_CLIENT_ID=your-auth0-client-id
   VITE_AUTH0_AUDIENCE=your-auth0-audience
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Project Structure

The source files are organized as follows:
- `src/components/`: UI components
- `src/pages/`: Page components
- `src/context/`: Context providers
- `src/hooks/`: Custom React hooks
- `src/utils/`: Utility functions

## Authentication

This application uses Auth0 for authentication. The configuration is set up in `src/main.jsx` and the authentication state is managed in `src/context/AuthContext.jsx`.

## License

This project is part of a homework assignment for CPSC4270.