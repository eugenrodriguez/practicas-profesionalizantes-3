import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import path from 'path'
import router from './routes/router.js'
import { fileURLToPath } from 'url'


const app = express()
dotenv.config({ path: './env/.env' })

const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.set('views', path.join(__dirname, '../frontend/views'))

app.use(express.static(path.join(__dirname, '../frontend/public')))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/', router)

function startMessage() {
    console.log('Server start on port 4000')
}

app.listen(4000, startMessage)

export default app
