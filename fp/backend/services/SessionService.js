//backend/services/SessionService.js:
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export class SessionService {
    constructor(secret = process.env.JWT_SECRET, cookieExpiresDays = process.env.JWT_COOKIE_EXPIRES || 1) {
        this.secret = secret;
        this.cookieExpiresDays = cookieExpiresDays;
        this.protect = this.protect.bind(this);
    }

    createToken(user) {
        return jwt.sign(
            { id: user.id, roles: user.roles },
            this.secret,
            { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
        );
    }

    setJWTCookie(res, token) {
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + this.cookieExpiresDays * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });
    }

    clearJWTCookie(res) {
        res.cookie('jwt', 'loggedout', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });
    }

    async protect(req, res, next) {
        try {
            const token = req.cookies.jwt;
            if (!token) {
                return res.status(401).json({ error: 'Acceso denegado. Token no encontrado.' });
            }

            const decoded = jwt.verify(token, this.secret);
            const user = await User.findUserById(decoded.id);

            if (!user) {
                return res.status(401).json({ error: 'Usuario asociado al token no existe.' });
            }

            req.user = user;
            next();
        } catch (error) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token inválido o expirado. Vuelva a iniciar sesión.' });
            }
            console.error("Error en protect:", error);
            return res.status(500).json({ error: 'Error de autenticación interna.' });
        }
    }

    requireRole(roleName) {
        return async (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ error: 'No autenticado' });
            }

            if (!req.user.roles.includes(roleName)) {
                return res.status(403).json({ error: `Se requiere rol de ${roleName}` });
            }

            next();
        };
    }
}