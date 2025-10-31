// backend/socketManager.js
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

        socket.on('driverLocationUpdate', ({ tripId, location }) => {
            const roomName = `trip-${tripId}`;
            console.log(`Actualizando ubicación del conductor en sala ${roomName}:`, location);
            io.to(roomName).emit('driverLocationUpdate', location);
        });

        socket.on('startTrip', async ({ tripId }) => {
            await Trip.updateStatus(tripId, 'en_curso');
            io.to(`trip-${tripId}`).emit('tripStarted', { tripId });
            console.log(`Viaje ${tripId} ha comenzado.`);
        });

        socket.on('endTrip', async ({ tripId }) => {
            await Trip.updateStatus(tripId, 'completado'); 
            io.to(`trip-${tripId}`).emit('tripEnded', { tripId });
            console.log(`Viaje ${tripId} ha finalizado.`);
        });

        socket.on('disconnect', () => {
            console.log(`Usuario desconectado con Socket ID: ${socket.id}`);
        });
    });
    return io;
}