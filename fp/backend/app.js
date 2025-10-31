// backend/app.js
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http'; 
import { Server } from 'socket.io'; 
import { initializeSocket } from './socketManager.js';

import router from './routes/router.js';
import viewRouter from './routes/viewRouter.js';

dotenv.config({ path: './env/.env' });

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);
let socketIoInstance = null;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../frontend/public')));

app.use('/api/v1', router);
app.use('/', viewRouter);

socketIoInstance = initializeSocket(io);
export const getSocketIo = () => socketIoInstance;

const PORT = 4000;
function startMessage() {
    console.log(`Server start on port ${PORT}`);
    console.log(`Frontend disponible en: http://localhost:${PORT}/`);
    console.log(`API corriendo en: http://localhost:${PORT}/api/v1`);
}

httpServer.listen(PORT, startMessage);

export default app;