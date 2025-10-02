import express from 'express';
import path from 'path';
import { protect } from '../middlewares/authMiddleware.js';

const viewRouter = express.Router();
const __dirname = path.resolve();

function serveIndexHTML(req, res) {
    res.sendFile(path.join(__dirname, 'frontend/public/index.html'));
}

function protectSPARoutes(req, res, next) {
    const urlPath = req.url;

    if (urlPath === '/login' || urlPath.startsWith('/register') ||
        urlPath.endsWith('.ico') || urlPath.endsWith('.css') || urlPath.endsWith('.js')) {
        return next();
    }

    protect(req, res, function(err) {
        if (err) return res.redirect('/login');
        serveIndexHTML(req, res);
    });
}

viewRouter.use(protectSPARoutes);
viewRouter.get(/(.*)/, serveIndexHTML);

export default viewRouter;
