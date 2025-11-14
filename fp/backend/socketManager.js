import Trip from './models/Trip.js';
import jwt from 'jsonwebtoken';

export function initializeSocket(io) {
    io.on('connection', (socket) => {
        console.log(`Usuario conectado con Socket ID: ${socket.id}`);

        const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('jwt=')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.join(`user-${decoded.id}`);
                console.log(`Socket ${socket.id} se unió a la sala personal user-${decoded.id}`);
            } catch (err) {
                console.log('Fallo al autenticar socket con token');
            }
        }

        socket.on('joinTripRoom', ({ tripId }) => {
            const roomName = `trip-${tripId}`;
            socket.join(roomName);
            console.log(`Usuario ${socket.id} se unió a la sala ${roomName}`);
        });

        socket.on('leaveTripRoom', ({ tripId }) => {
            const roomName = `trip-${tripId}`;
            socket.leave(roomName);
            console.log(`Usuario ${socket.id} salió de la sala ${roomName}`);
        });

        socket.on('driverLocationUpdate', ({ tripId, location }) => {
            const roomName = `trip-${tripId}`;
            console.log(`Actualizando ubicación del conductor en sala ${roomName}:`, location);
            io.to(roomName).emit('driverLocationUpdate', location);
        });

        socket.on('startTrip', async ({ tripId }) => {
            try {
                const trip = await Trip.getById(tripId);
                if (!trip) {
                    socket.emit('tripStartError', { error: 'Viaje no encontrado' });
                    return;
                }

                const activeTrip = await Trip.getActiveTripByDriver(trip.conductor_id);
                if (activeTrip && activeTrip.id !== tripId) {
                    socket.emit('tripStartError', { 
                        error: 'Ya tienes un viaje en curso. Debes finalizarlo antes de iniciar otro.',
                        activeTripId: activeTrip.id
                    });
                    return;
                }

                await Trip.updateStatus(tripId, 'en_curso');
                io.to(`trip-${tripId}`).emit('tripStarted', { tripId });

                const passengerIds = await Trip.getAcceptedPassengerIds(tripId);
                if (passengerIds.length > 0) {
                    passengerIds.forEach(passengerId => {
                        io.to(`user-${passengerId}`).emit('tripHasStarted', {
                            tripId: trip.id,
                            tripOrigin: trip.origen,
                            tripDestination: trip.destino
                        });
                    });
                }
                console.log(`Viaje ${tripId} ha comenzado.`);
            } catch (error) {
                console.error(`Error iniciando viaje ${tripId}:`, error);
                socket.emit('tripStartError', { error: 'Error al iniciar el viaje' });
            }
        });

        socket.on('endTrip', async ({ tripId }) => {
            try {
                await Trip.updateStatus(tripId, 'completado'); 
                io.to(`trip-${tripId}`).emit('tripEnded', { tripId });
                console.log(`Viaje ${tripId} ha finalizado.`);
            } catch (error) {
                console.error(`Error finalizando viaje ${tripId}:`, error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`Usuario desconectado con Socket ID: ${socket.id}`);
        });
    });
    
    return io;
}