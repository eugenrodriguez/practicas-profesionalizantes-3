// backend/models/Trip.js
import { db } from '../config/db.js';

class Trip {
    async create(conductorId, { origen, destino, fecha_salida, asientos_disponibles, precio, origen_lat, origen_lng, destino_lat, destino_lng, waypoints }) {
        const sql = `INSERT INTO viajes 
            (conductor_id, origen, destino, origen_lat, origen_lng, destino_lat, destino_lng, waypoints, fecha_salida, asientos_disponibles, precio)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const waypointsJson = waypoints ? JSON.stringify(waypoints) : null;
        
        const res = await db.query(sql, [
            conductorId, 
            origen, 
            destino, 
            origen_lat, 
            origen_lng, 
            destino_lat, 
            destino_lng, 
            waypointsJson,
            fecha_salida, 
            asientos_disponibles, 
            precio
        ]);
        return res.insertId;
    }

    async getByConductor(conductorId) {
        const sql = `SELECT id, origen, destino, origen_lat, origen_lng, destino_lat, destino_lng, waypoints, 
                     fecha_salida, asientos_disponibles, precio, estado, created_at
                     FROM viajes WHERE conductor_id = ? ORDER BY fecha_salida DESC`;
        return db.query(sql, [conductorId]);
    }

    async getById(id) {
        const sql = `SELECT * FROM viajes WHERE id = ?`;
        const res = await db.query(sql, [id]);
        return res[0] || null;
    }

    async createRequest(viajeId, pasajeroId) {
        const exists = await db.query(
            'SELECT id FROM solicitudes_viaje WHERE viaje_id = ? AND pasajero_id = ?',
            [viajeId, pasajeroId]
        );
        if (exists.length > 0) {
            const err = new Error('Ya solicitaste este viaje');
            err.code = 'DUP_REQUEST';
            throw err;
        }

        const res = await db.query(
            'INSERT INTO solicitudes_viaje (viaje_id, pasajero_id) VALUES (?, ?)',
            [viajeId, pasajeroId]
        );
        return res.insertId;
    }

    async getRequestsByTrip(viajeId) {
        const sql = `SELECT sv.id, sv.viaje_id, sv.pasajero_id, sv.estado, sv.requested_at,
                            u.name as pasajero_name, p.telefono, p.direccion
                     FROM solicitudes_viaje sv
                     JOIN pasajeros p ON sv.pasajero_id = p.id
                     JOIN users u ON p.id = u.id
                     WHERE sv.viaje_id = ?
                     ORDER BY sv.requested_at DESC`;
        return db.query(sql, [viajeId]);
    }

    async respondRequest(requestId, action) {
        const estado = action === 'aceptar' ? 'aceptada' : 'rechazada';
        
        if (estado === 'aceptada') {
            const r = await db.query('SELECT viaje_id FROM solicitudes_viaje WHERE id = ?', [requestId]);
            if (!r.length) throw new Error('Solicitud no encontrada');
            const viajeId = r[0].viaje_id;
            
            const v = await db.query('SELECT asientos_disponibles FROM viajes WHERE id = ?', [viajeId]);
            if (!v.length) throw new Error('Viaje no encontrado');
            if (v[0].asientos_disponibles <= 0) {
                const err = new Error('No hay asientos disponibles');
                err.code = 'NO_SEATS';
                throw err;
            }
            
            await db.query('UPDATE viajes SET asientos_disponibles = asientos_disponibles - 1 WHERE id = ?', [viajeId]);
        }
        
        await db.query('UPDATE solicitudes_viaje SET estado = ? WHERE id = ?', [estado, requestId]);
        return true;
    }
}

export default new Trip();