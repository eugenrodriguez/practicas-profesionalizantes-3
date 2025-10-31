//backend/controllers/tripController.js:
import Trip from '../models/Trip.js';
import { getSocketIo } from '../app.js';

export class TripController {
    async createTrip(req, res) {
        try {
            const user = req.user;
            if (!user.roles || !user.roles.includes('conductor')) {
                return res.status(403).json({ success: false, error: 'Se requiere rol conductor' });
            }

            const conductorId = user.id;
            
            const { 
                origen, destino, fecha_salida, asientos_disponibles, precio, 
                origen_lat, origen_lng, destino_lat, destino_lng, waypoints 
            } = req.body;

            if (!origen || !destino || !fecha_salida) {
                return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
            }

            const tripId = await Trip.create(conductorId, {
                origen,
                destino,
                fecha_salida,
                asientos_disponibles: Number(asientos_disponibles) || 1,
                precio: Number(precio) || 0.0,
                origen_lat,
                origen_lng,
                destino_lat,
                destino_lng,
                waypoints
            });

            return res.status(201).json({ success: true, tripId });
        } catch (error) {
            console.error('Error creando viaje:', error);
            return res.status(500).json({ success: false, error: 'Error interno al crear viaje' });
        }
    }

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

    async requestSeat(req, res) {
        try {
            const user = req.user;
            const viajeId = Number(req.params.id);
            const { asientos } = req.body;
            const asientosSolicitados = Number(asientos) || 1;

            if (!user.roles || !user.roles.includes('pasajero')) {
                return res.status(403).json({ success: false, error: 'Se requiere rol pasajero' });
            }

            const pasajeroId = user.id;
            const id = await Trip.createRequest(viajeId, pasajeroId, asientosSolicitados);
            return res.status(201).json({ success: true, requestId: id });
        } catch (error) {
            console.error('Error creando solicitud:', error);
            if (error.code === 'DUP_REQUEST') return res.status(400).json({ success: false, error: 'Ya solicitaste este viaje' });
            return res.status(500).json({ success: false, error: 'Error interno al crear solicitud' });
        }
    }

    async respondRequest(req, res) {
        try {
            const user = req.user;
            const requestId = Number(req.params.id);
            const { action } = req.body; 

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

    async searchTrips(req, res) {
        try {
            const { origen, destino, fecha } = req.query;
            
            const trips = await Trip.searchAvailable({ origen, destino, fecha });
            return res.json({ success: true, trips });
        } catch (error) {
            console.error('Error buscando viajes:', error);
            return res.status(500).json({ success: false, error: 'Error interno al buscar viajes' });
        }
    }

    async getMyRequests(req, res) {
        try {
            const user = req.user;
            if (!user.roles || !user.roles.includes('pasajero')) {
                return res.status(403).json({ success: false, error: 'Se requiere rol pasajero' });
            }
            
            const pasajeroId = user.id;
            const requests = await Trip.getRequestsByPassenger(pasajeroId);
            return res.json({ success: true, requests });
        } catch (error) {
            console.error('Error obteniendo solicitudes:', error);
            return res.status(500).json({ success: false, error: 'Error interno al obtener solicitudes' });
        }
    }

    async getAvailableTrips(req, res) {
        try {
            const trips = await Trip.getAllAvailable();
            return res.json({ success: true, trips });
        } catch (error) {
            console.error('Error obteniendo viajes disponibles:', error);
            return res.status(500).json({ success: false, error: 'Error interno al obtener viajes' });
        }
    }

    async changeTripStatus(req, res) {
        try {
            const user = req.user;
            const tripId = Number(req.params.id);
            const { estado } = req.body; 
            if (!estado) {
                return res.status(400).json({ success: false, error: 'Falta el nuevo estado' });
            }

            if (!user.roles.includes('conductor')) {
                return res.status(403).json({ success: false, error: 'Acción no autorizada' });
            }

            const trip = await Trip.getById(tripId);
            if (!trip) {
                return res.status(404).json({ success: false, error: 'Viaje no encontrado' });
            }
            if (trip.conductor_id !== user.id) {
                return res.status(403).json({ success: false, error: 'No eres el propietario de este viaje' });
            }

            await Trip.updateStatus(tripId, estado);
            return res.json({ success: true, message: `Viaje actualizado a estado: ${estado}` });

        } catch (error) {
            console.error('Error cambiando estado del viaje:', error);
            return res.status(500).json({ success: false, error: 'Error interno al cambiar estado del viaje' });
        }
    }

    async getAllDriverRequests(req, res) {
        try {
            const user = req.user;
            if (!user.roles.includes('conductor')) {
                return res.status(403).json({ success: false, error: 'Se requiere rol conductor' });
            }
            
            const conductorId = user.id;
            const requests = await Trip.getAllRequestsByDriver(conductorId);
            return res.json({ success: true, requests });
        } catch (error) {
            console.error('Error obteniendo todas las solicitudes del conductor:', error);
            return res.status(500).json({ success: false, error: 'Error interno al obtener solicitudes' });
        }
    }

    async getTripById(req, res) {
        try {
            const tripId = Number(req.params.id);
            const trip = await Trip.getTripWithParticipants(tripId);
            
            if (!trip) {
                return res.status(404).json({ success: false, error: 'Viaje no encontrado' });
            }
            return res.json({ success: true, trip });
        } catch (error) {
            console.error('Error obteniendo viaje por ID:', error);
            return res.status(500).json({ success: false, error: 'Error interno del servidor' });
        }
    }

    async deleteTrip(req, res) {
        try {
            const user = req.user;
            const tripId = Number(req.params.id);

            if (!user.roles.includes('conductor')) {
                return res.status(403).json({ success: false, error: 'Acción no autorizada' });
            }

            const trip = await Trip.getById(tripId);
            if (!trip) {
                return res.status(404).json({ success: false, error: 'Viaje no encontrado' });
            }
            if (trip.conductor_id !== user.id) {
                return res.status(403).json({ success: false, error: 'No eres el propietario de este viaje' });
            }

            if (trip.estado !== 'pendiente') {
                return res.status(400).json({ success: false, error: 'Solo se pueden eliminar viajes que están pendientes de publicación.' });
            }

            await Trip.deleteById(tripId);
            return res.json({ success: true, message: 'Viaje eliminado correctamente' });

        } catch (error) {
            console.error('Error eliminando viaje:', error);
            return res.status(500).json({ success: false, error: 'Error interno al eliminar el viaje' });
        }
    }

    async cancelTrip(req, res) {
        try {
            const user = req.user;
            const tripId = Number(req.params.id);

            if (!user.roles.includes('conductor')) {
                return res.status(403).json({ success: false, error: 'Acción no autorizada' });
            }

            const trip = await Trip.getById(tripId);
            if (!trip) {
                return res.status(404).json({ success: false, error: 'Viaje no encontrado' });
            }
            if (trip.conductor_id !== user.id) {
                return res.status(403).json({ success: false, error: 'No eres el propietario de este viaje' });
            }

            const passengerIds = await Trip.getAcceptedPassengerIds(tripId); 

            await Trip.updateStatus(tripId, 'cancelado');

            const io = getSocketIo();
            if (io && passengerIds.length > 0) {
                passengerIds.forEach(passengerId => {
                    io.to(`user-${passengerId}`).emit('tripCancelled', { 
                        tripId: trip.id,
                        tripOrigin: trip.origen,
                        tripDestination: trip.destino
                    });
                });
            }

            return res.json({ success: true, message: 'Viaje cancelado correctamente' });
        } catch (error) {
            console.error('Error cancelando viaje:', error);
            return res.status(500).json({ success: false, error: 'Error interno al cancelar el viaje' });
        }
    }

    async cancelBooking(req, res) {
        try {
            const user = req.user; 
            const requestId = Number(req.params.id);

            await Trip.cancelRequestById(requestId, user.id);

            return res.json({ success: true, message: 'Reserva cancelada correctamente' });
        } catch (error) {
            console.error('Error cancelando reserva:', error);
            if (error.code === 'UNAUTHORIZED') return res.status(403).json({ success: false, error: error.message });
            return res.status(500).json({ success: false, error: 'Error interno al cancelar la reserva' });
        }
    }
}

export default new TripController();
