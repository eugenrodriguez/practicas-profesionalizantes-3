import Trip from '../models/Trip.js';

export class TripController {
    // POST /trips  (crear viaje) -> conductor sólo
    async createTrip(req, res) {
        try {
            // req.user es el user (req.user.id === id en users === id en conductores)
            const user = req.user;
            // verificar que tenga rol conductor
            if (!user.roles || !user.roles.includes('conductor')) {
                return res.status(403).json({ success: false, error: 'Se requiere rol conductor' });
            }

            const conductorId = user.id;
            const { origen, destino, fecha_salida, asientos_disponibles, precio } = req.body;

            if (!origen || !destino || !fecha_salida) {
                return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
            }

            const tripId = await Trip.create(conductorId, {
                origen,
                destino,
                fecha_salida,
                asientos_disponibles: Number(asientos_disponibles) || 1,
                precio: Number(precio) || 0.0
            });

            return res.status(201).json({ success: true, tripId });
        } catch (error) {
            console.error('Error creando viaje:', error);
            return res.status(500).json({ success: false, error: 'Error interno al crear viaje' });
        }
    }

    // GET /trips/my -> viajes del conductor autenticado
    async getUserTrips(req, res) {
        try {
            const user = req.user;
            if (!user.roles || !user.roles.includes('conductor')) {
                return res.status(403).json({ success: false, error: 'Se requiere rol conductor' });
            }
            const conductorId = user.id;
            const trips = await Trip.getByConductor(conductorId);
            return res.json({ success: true, trips });
        } catch (error) {
            console.error('Error obteniendo viajes:', error);
            return res.status(500).json({ success: false, error: 'Error interno al obtener viajes' });
        }
    }

    // GET /trips/:id/requests -> solicitudes para viaje (conductor)
    async getRequests(req, res) {
        try {
            const user = req.user;
            const viajeId = Number(req.params.id);
            if (!user.roles || !user.roles.includes('conductor')) {
                return res.status(403).json({ success: false, error: 'Se requiere rol conductor' });
            }
            const trip = await Trip.getById(viajeId);
            if (!trip) return res.status(404).json({ success: false, error: 'Viaje no encontrado' });
            if (trip.conductor_id !== user.id) return res.status(403).json({ success: false, error: 'No autorizado para ver solicitudes' });

            const requests = await Trip.getRequestsByTrip(viajeId);
            return res.json({ success: true, requests });
        } catch (error) {
            console.error('Error obteniendo solicitudes:', error);
            return res.status(500).json({ success: false, error: 'Error interno al obtener solicitudes' });
        }
    }

    // POST /trips/:id/request -> pasajero solicita asiento
    async requestSeat(req, res) {
        try {
            const user = req.user;
            const viajeId = Number(req.params.id);

            if (!user.roles || !user.roles.includes('pasajero')) {
                return res.status(403).json({ success: false, error: 'Se requiere rol pasajero' });
            }

            const pasajeroId = user.id;
            const id = await Trip.createRequest(viajeId, pasajeroId);
            return res.status(201).json({ success: true, requestId: id });
        } catch (error) {
            console.error('Error creando solicitud:', error);
            if (error.code === 'DUP_REQUEST') return res.status(400).json({ success: false, error: 'Ya solicitaste este viaje' });
            return res.status(500).json({ success: false, error: 'Error interno al crear solicitud' });
        }
    }

    // PUT /trips/requests/:id  -> conductor acepta/rechaza
    async respondRequest(req, res) {
        try {
            const user = req.user;
            const requestId = Number(req.params.id);
            const { action } = req.body; // 'aceptar' | 'rechazar'

            if (!user.roles || !user.roles.includes('conductor')) {
                return res.status(403).json({ success: false, error: 'Se requiere rol conductor' });
            }
            if (!['aceptar', 'rechazar'].includes(action)) {
                return res.status(400).json({ success: false, error: 'Acción inválida' });
            }

            await Trip.respondRequest(requestId, action);
            return res.json({ success: true });
        } catch (error) {
            console.error('Error respondiendo solicitud:', error);
            if (error.code === 'NO_SEATS') return res.status(400).json({ success: false, error: 'No hay asientos disponibles' });
            return res.status(500).json({ success: false, error: 'Error interno al responder solicitud' });
        }
    }
}

export default new TripController();
