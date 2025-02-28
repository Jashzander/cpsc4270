import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs/promises'
import YAML from 'yaml'

import albumsRouter from './routes/albums.mjs'
import artistsRouter from './routes/artists.mjs'
import concertsRouter from './routes/concerts.mjs'

const app = express()

app.use(logger('dev')) // logs each request to the console
app.use(express.json()) // turns request bodies into objects when Content-Type is application/json
app.use(cookieParser()) // converts cookies from one big string into an object

fs.readFile('./api.yaml', { encoding: 'utf-8' }).then(fileContents => {
    const apiSpec = YAML.parse(fileContents)
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiSpec))
})

app.use('/albums', albumsRouter)
app.use('/artists', artistsRouter)
app.use('/concerts', concertsRouter)

app.listen(process.env.PORT || 3001, () => {
    console.log('server running')
})