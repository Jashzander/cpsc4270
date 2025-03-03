import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import {config as configEnv} from 'dotenv'
import {auth} from 'express-openid-connect'
import proxy from 'express-http-proxy'
import cors from 'cors'
import {expressjwt as jwt} from 'express-jwt'
import jwksRsa from 'jwks-rsa'
import playlistsRouter from './routes/playlists.mjs'
import tagsRouter from './routes/tags.mjs'
import initDb from './models/mongodb/initDb.mjs'
import {getPositivelyAssociatedTracksByTag} from './models/mongodb/tags.mjs'

configEnv()

const app = express()

app.use(logger('dev'))
app.use(express.json({ strict: false }))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// Configure CORS for API access
app.use(cors({
  origin: 'http://localhost:5173', // React app origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true
}))

// Configure Auth0 for server-side rendered pages
const authConfig = {
  authRequired: false, // Change to false so API clients can authenticate with JWT instead
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.SITE_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
}
app.use(auth(authConfig))

// Server-side auth middleware
app.use((req, res, next) => {
  if (req.oidc?.user) {
    req.userId = req.oidc.user.sub
    res.cookie('userId', req.userId, { sameSite: 'strict' })
  }
  next()
})

// Set up JWT validation for API requests
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AUTH0_ISSUER_BASE_URL}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `${process.env.AUTH0_ISSUER_BASE_URL}/`,
  algorithms: ['RS256']
})

// Define API routes with JWT authentication
app.use('/api/playlists', checkJwt, (req, res, next) => {
  req.userId = req.auth.sub; // JWT payload is in req.auth
  next();
}, playlistsRouter);

app.use('/api/tracks/:trackId/tags', checkJwt, (req, res, next) => {
  req.userId = req.auth.sub;
  next();
}, tagsRouter);

// Keep existing routes for server-side rendering
app.use('/playlists', playlistsRouter)
app.use('/tracks/:trackId/tags', tagsRouter)

app.get('/api/recommended-tracks', checkJwt, async (req, res) => {
  const { tag } = req.query
  if(!tag) {
    res.sendStatus(400)
    return
  }
  const tracks = await getPositivelyAssociatedTracksByTag(tag)
  res.send(tracks)
})

// Keep existing endpoint for server-side rendering
app.get('/recommended-tracks', async (req, res) => {
  const { tag } = req.query
  if(!tag) {
    res.sendStatus(400)
    return
  }
  const tracks = await getPositivelyAssociatedTracksByTag(tag)
  res.send(tracks)
})

// Proxy to HW1 album server
app.use('/api/albums', checkJwt, proxy('http://localhost:3001', {
  proxyReqPathResolver: function (req) {
    return `/albums${req.url}`
  }
}))

// Keep existing proxy for server-side rendering
app.use('/albums', proxy('http://localhost:3001', {
  proxyReqPathResolver: function (req) {
    return `/albums${req.url}`
  }
}))

// Proxy to React dev server
app.use('/', proxy('http://localhost:5173', {
  proxyReqPathResolver: function (req) {
    return req.url
  }
}))

initDb().then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log('server running')
  })
})