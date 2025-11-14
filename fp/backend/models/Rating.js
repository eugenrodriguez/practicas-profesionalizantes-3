import { db } from '../config/db.js';

class Rating {
    async create(viajeId, calificadorId, calificadoId, calificacion, comentario) {
        const sql = `
            INSERT INTO ratings (viaje_id, calificador_id, calificado_id, calificacion, comentario)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE calificacion = VALUES(calificacion), comentario = VALUES(comentario);
        `;
        const result = await db.query(sql, [viajeId, calificadorId, calificadoId, calificacion, comentario]);
        return result.insertId;
    }

    async getAverageForUser(userId) {
        const sql = `SELECT AVG(calificacion) as promedio FROM ratings WHERE calificado_id = ?`;
        const res = await db.query(sql, [userId]);
        return res[0]?.promedio || 0;
    }
}

export default new Rating();