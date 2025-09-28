import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url' 

const router = express.Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

function renderView(viewName) {
    return (req, res) => {
        res.sendFile(path.join(__dirname, '../../frontend/views', viewName + '.html'))
    }
}

router.get('/', renderView('index'))
router.get('/login', renderView('login'))
router.get('/register', renderView('register'))


export default router   