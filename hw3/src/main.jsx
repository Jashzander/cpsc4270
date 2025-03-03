import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from "@auth0/auth0-react"
import './index.css'
import App from './App.jsx'

// Auth0 configuration
const domain = import.meta.env.VITE_AUTH0_DOMAIN || "dev-3ikqfhre4ycycusj.us.auth0.com";
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || "Gsm5ywQcpo0GO0nF2Sy90euaa8CJHBbf";
const audience = import.meta.env.VITE_AUTH0_AUDIENCE || "https://hw2-api";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      redirectUri={window.location.origin}
      audience={audience}
      scope="read:playlists write:playlists read:albums"
    >
      <App />
    </Auth0Provider>
  </StrictMode>,
)
