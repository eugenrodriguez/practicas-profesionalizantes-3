import express from 'express';
import path from 'path';
import { SessionService } from '../services/SessionService.js';

const viewRouter = express.Router();
const sessionService = new SessionService();
const __dirname = path.resolve();

function serveSPA(req, res) {
    res.sendFile(path.join(__dirname, 'frontend/public/index.html'));
}

const publicRoutes = [
    '/login',
    '/register',
    '/register/driver',
    '/register/passenger',
    '/'
];

publicRoutes.forEach(route => {
    viewRouter.get(route, serveSPA);
});

viewRouter.get(/^\/dashboard(\/.*)?$/, sessionService.protect, serveSPA);

viewRouter.get(/^\/(?!api|components|css|services|js|images|assets).*/, serveSPA);

export default viewRouter;