# Pandify App

A modern web application for creating and managing music playlists, built with Angular.

## Made By:

Jay Dahiya

## Features

- User authentication with Auth0
- Create, edit, and delete playlists
- Browse and add tracks from albums to playlists
- Responsive design for all devices

## Technologies Used

- Angular (latest version)
- Auth0 for authentication
- RxJS for reactive programming
- CSS for styling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Navigate to the project directory
```
cd angular-app/music-playlist-app
```

2. Install dependencies
```
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
AUTH0_DOMAIN=your-auth0-domain
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_AUDIENCE=your-auth0-audience
API_URL=your-api-url
```

4. Start the development server
```
npm start
```

5. Open your browser and navigate to `http://localhost:4200`

## Project Structure

- `src/app/components`: Reusable UI components
- `src/app/pages`: Page components
- `src/app/services`: Services for API calls and authentication
- `src/app/models`: TypeScript interfaces for data models
- `src/app/guards`: Route guards for authentication
- `src/environments`: Environment configuration

## Available Scripts

- `npm start`: Start the development server
- `npm run build`: Build the application for production
- `npm run test`: Run tests
- `npm run lint`: Lint the codebase