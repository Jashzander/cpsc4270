import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import {config as configEnv} from 'dotenv'
import {auth} from 'express-openid-connect'
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
app.use(express.static('./public'))

const authConfig = {
  authRequired: true,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.SITE_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
}
app.use(auth(authConfig))
app.use((req, res, next) => {
  req.userId = req.oidc.user.sub
  next()
})

app.use('/playlists', playlistsRouter)
app.use('/tracks/:trackId/tags', tagsRouter)

app.get('/recommended-tracks', async (req, res) => {
  const { tag } = req.query
  if(!tag) {
    res.sendStatus(400)
    return
  }
  const tracks = await getPositivelyAssociatedTracksByTag(tag)
  res.send(tracks)
})

initDb().then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log('server running')
  })
})