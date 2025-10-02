import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routes/router.js';
import viewRouter from './routes/viewRouter.js';

const app = express();
dotenv.config({ path: './env/.env' });
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../frontend/public')));

app.use('/api/v1', router);
app.use('/', viewRouter);

function startMessage() {
    console.log('Server start on port 4000');
    console.log('Frontend disponible en: http://localhost:4000/');
    console.log('API corriendo en: http://localhost:4000/api/v1');
}

app.listen(4000, startMessage);

export default app;
