export const environment = {
  production: false,
  auth0: {
    domain: 'dev-3ikqfhre4ycycusj.us.auth0.com',
    clientId: 'Gsm5ywQcpo0GO0nF2Sy90euaa8CJHBbf',
    audience: 'https://hw2-api',
    redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
    scope: 'read:playlists write:playlists read:albums'
  },
  apiUrl: 'http://localhost:3000'
};
