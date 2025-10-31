//backend/models/Trip.js:
import { db } from '../config/db.js';

class Trip {
    async create(conductorId, { origen, destino, fecha_salida, asientos_disponibles, precio, origen_lat, origen_lng, destino_lat, destino_lng, waypoints }) {
        const sql = `INSERT INTO viajes 
                     (conductor_id, origen, destino, origen_lat, origen_lng, destino_lat, destino_lng, waypoints, fecha_salida, asientos_disponibles, precio, estado)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`;
        
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

    async getRouteCoordinates(tripId) {
        const sql = `SELECT origen_lat, origen_lng, destino_lat, destino_lng, waypoints FROM viajes WHERE id = ?`;
        const res = await db.query(sql, [tripId]);
        if (!res[0]) return null;

        const { origen_lat, origen_lng, destino_lat, destino_lng, waypoints } = res[0];
        
        const route = [{ lat: origen_lat, lng: origen_lng }];

        if (waypoints) {
            const parsedWaypoints = JSON.parse(waypoints);
            parsedWaypoints.forEach(wp => route.push({ lat: wp.lat, lng: wp.lng }));
        }

        route.push({ lat: destino_lat, lng: destino_lng });
        
        const interpolatedRoute = [];
        for (let i = 0; i < route.length - 1; i++) {
            const start = route[i];
            const end = route[i+1];
            const segments = 50; // Puntos intermedios
            for (let j = 0; j <= segments; j++) {
                interpolatedRoute.push({ lat: start.lat + (end.lat - start.lat) * (j / segments), lng: start.lng + (end.lng - start.lng) * (j / segments) });
            }
        }
        return interpolatedRoute;
    }

    async updateDate(tripId, newDate) {
        const sql = `UPDATE viajes SET fecha_salida = ? WHERE id = ?`;
        const result = await db.query(sql, [newDate, tripId]);
        return result.affectedRows > 0;
    }

    async getTripWithParticipants(id) {
        const sql = `SELECT v.*, u.name as conductor_name 
                     FROM viajes v
                     JOIN users u ON v.conductor_id = u.id
                     WHERE v.id = ?`;
        const tripRes = await db.query(sql, [id]);
        const trip = tripRes[0];

        if (!trip) return null;

        const passengersSql = `
            SELECT u.id, u.name
            FROM solicitudes_viaje sv
            JOIN users u ON sv.pasajero_id = u.id
            WHERE sv.viaje_id = ? AND sv.estado = 'aceptada'
        `;
        const passengers = await db.query(passengersSql, [id]);

        trip.pasajeros = passengers;

        return trip;
    }

    async createRequest(viajeId, pasajeroId, asientosSolicitados = 1) {
        const sqlCheck = 'SELECT id, asientos_solicitados FROM solicitudes_viaje WHERE viaje_id = ? AND pasajero_id = ?';
        const existingRequest = await db.query(sqlCheck, [viajeId, pasajeroId]);

        if (existingRequest.length > 0) {
            const requestId = existingRequest[0].id;
            const newSeatCount = existingRequest[0].asientos_solicitados + asientosSolicitados;
            
            const sqlUpdate = 'UPDATE solicitudes_viaje SET asientos_solicitados = ?, estado = "pendiente" WHERE id = ?';
            await db.query(sqlUpdate, [newSeatCount, requestId]);
            return requestId; // Devolvemos el ID de la solicitud actualizada
        } else {
            const sqlInsert = 'INSERT INTO solicitudes_viaje (viaje_id, pasajero_id, asientos_solicitados) VALUES (?, ?, ?)';
            const res = await db.query(sqlInsert, [viajeId, pasajeroId, asientosSolicitados]);
            return res.insertId;
        }
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

    async cancelRequestById(requestId, pasajeroId) {
        const sqlCheck = 'SELECT * FROM solicitudes_viaje WHERE id = ? AND pasajero_id = ?';
        const request = await db.query(sqlCheck, [requestId, pasajeroId]);

        if (request.length === 0) {
            const err = new Error('No tienes permiso para cancelar esta solicitud o no existe.');
            err.code = 'UNAUTHORIZED';
            throw err;
        }

        const { viaje_id, asientos_solicitados, estado } = request[0];

        if (estado === 'aceptada') {
            const sqlUpdateTrip = 'UPDATE viajes SET asientos_disponibles = asientos_disponibles + ? WHERE id = ?';
            await db.query(sqlUpdateTrip, [asientos_solicitados, viaje_id]);
        }

        return db.query('DELETE FROM solicitudes_viaje WHERE id = ?', [requestId]);
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
                            v.origen, v.destino, v.fecha_salida, v.precio, v.estado as estado_viaje,
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

    async deleteRequestsByTripId(tripId) {
        const sql = `DELETE FROM solicitudes_viaje WHERE viaje_id = ?`;
        const result = await db.query(sql, [tripId]);
        return result.affectedRows;
    }

    async deleteById(tripId) {
        const sql = `DELETE FROM viajes WHERE id = ?`;
        const result = await db.query(sql, [tripId]);
        return result.affectedRows > 0;
    }

    async getAcceptedPassengerIds(tripId) {
        const sql = `SELECT pasajero_id FROM solicitudes_viaje WHERE viaje_id = ? AND estado = 'aceptada'`;
        const results = await db.query(sql, [tripId]);
        return results.map(r => r.pasajero_id);
    }
}

export default new Trip();