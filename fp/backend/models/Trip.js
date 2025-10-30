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
        const sql = `
            SELECT 
                v.*, 
                (SELECT COUNT(*) 
                 FROM solicitudes_viaje sv 
                 WHERE sv.viaje_id = v.id AND sv.estado = 'pendiente') AS solicitudes_pendientes
            FROM viajes v
            WHERE v.conductor_id = ? 
            ORDER BY v.fecha_salida DESC
        `;
        return db.query(sql, [conductorId]);
    }

    async getById(id) {
        const sql = `SELECT * FROM viajes WHERE id = ?`;
        const res = await db.query(sql, [id]);
        return res[0] || null;
    }

    async updateStatus(tripId, newStatus) {
        const sql = `UPDATE viajes SET estado = ? WHERE id = ?`;
        const result = await db.query(sql, [newStatus, tripId]);
        return result.affectedRows > 0;
    }

    async getByIdWithDriver(id) {
        const sql = `SELECT v.*, u.name as conductor_name 
                     FROM viajes v
                     JOIN users u ON v.conductor_id = u.id
                     WHERE v.id = ?`;
        const res = await db.query(sql, [id]);
        return res[0] || null;
    }

    async createRequest(viajeId, pasajeroId, asientosSolicitados = 1) {
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
            'INSERT INTO solicitudes_viaje (viaje_id, pasajero_id, asientos_solicitados) VALUES (?, ?, ?)',
            [viajeId, pasajeroId, asientosSolicitados]
        );
        return res.insertId;
    }

    async getRequestsByTrip(viajeId) {
        const sql = `SELECT sv.id, sv.viaje_id, sv.pasajero_id, sv.estado, sv.asientos_solicitados, sv.requested_at,
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
            const reqData = await db.query('SELECT viaje_id, asientos_solicitados FROM solicitudes_viaje WHERE id = ?', [requestId]);
            if (!reqData.length) throw new Error('Solicitud no encontrada');

            const { viaje_id, asientos_solicitados } = reqData[0];
            
            const tripData = await db.query('SELECT asientos_disponibles FROM viajes WHERE id = ?', [viaje_id]);
            if (!tripData.length) throw new Error('Viaje no encontrado');
            
            if (tripData[0].asientos_disponibles < asientos_solicitados) {
                const err = new Error('No hay suficientes asientos disponibles para esta solicitud');
                err.code = 'NO_SEATS';
                throw err;
            }
            
            await db.query('UPDATE viajes SET asientos_disponibles = asientos_disponibles - ? WHERE id = ?', [asientos_solicitados, viaje_id]);
        }
        
        await db.query('UPDATE solicitudes_viaje SET estado = ? WHERE id = ?', [estado, requestId]);
        return true;
    }

    async searchAvailable({ origen, destino, fecha }) {
        let sql = `SELECT v.*, u.name as conductor_name, c.vehiculo, c.patente
                     FROM viajes v
                     JOIN conductores c ON v.conductor_id = c.id
                     JOIN users u ON c.id = u.id
                     WHERE v.estado = 'activo' AND v.asientos_disponibles > 0`;
        
        const params = [];
        
        if (origen) {
            sql += ` AND v.origen LIKE ?`;
            params.push(`%${origen}%`);
        }
        
        if (destino) {
            sql += ` AND v.destino LIKE ?`;
            params.push(`%${destino}%`);
        }
        
        if (fecha) {
            sql += ` AND DATE(v.fecha_salida) = DATE(?)`;
            params.push(fecha);
        }
        
        sql += ` ORDER BY v.fecha_salida ASC`;
        
        return db.query(sql, params);
    }

    async getAllAvailable() {
        const sql = `SELECT v.*, u.name as conductor_name, c.vehiculo, c.patente
                       FROM viajes v
                       JOIN conductores c ON v.conductor_id = c.id
                       JOIN users u ON c.id = u.id
                       WHERE v.estado = 'activo' AND v.asientos_disponibles > 0
                       ORDER BY v.fecha_salida ASC`;
        return db.query(sql);
    }

    async getRequestsByPassenger(pasajeroId) {
        const sql = `SELECT sv.id, sv.viaje_id, sv.estado, sv.requested_at,
                            v.origen, v.destino, v.fecha_salida, v.precio,
                            u.name as conductor_name
                       FROM solicitudes_viaje sv
                       JOIN viajes v ON sv.viaje_id = v.id
                       JOIN users u ON v.conductor_id = u.id
                       WHERE sv.pasajero_id = ?
                       ORDER BY sv.requested_at DESC`;
        return db.query(sql, [pasajeroId]);
    }

    async getAllRequestsByDriver(conductorId) {
        const sql = `SELECT 
                        sv.id, 
                        sv.estado, 
                        sv.asientos_solicitados, 
                        sv.requested_at,
                        v.origen, 
                        v.destino,
                        v.id as viaje_id,
                        u.name as pasajero_name
                     FROM solicitudes_viaje sv
                     JOIN viajes v ON sv.viaje_id = v.id
                     JOIN pasajeros p ON sv.pasajero_id = p.id
                     JOIN users u ON p.id = u.id
                     WHERE v.conductor_id = ?
                     ORDER BY sv.requested_at DESC`;
        return db.query(sql, [conductorId]);
    }
}

export default new Trip();