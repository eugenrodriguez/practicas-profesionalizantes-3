import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export async function protect(req, res, next) {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ error: 'Acceso denegado. Token no encontrado.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const results = await query('SELECT id, name, role FROM users WHERE id = ?', [decoded.id]);

        if (results.length === 0) {
            return res.status(401).json({ error: 'Usuario asociado al token no existe.' });
        }

        req.user = results[0];

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token inválido o expirado. Vuelva a iniciar sesión.' });
        }
        console.error("Error en authMiddleware:", error);
        return res.status(500).json({ error: 'Error de autenticación interna.' });
    }
}
