// backend/socketManager.js
import Trip from './models/Trip.js';

export function initializeSocket(io) {
    io.on('connection', (socket) => {
        console.log(`Usuario conectado con Socket ID: ${socket.id}`);

        socket.on('joinTripRoom', ({ tripId }) => {
            const roomName = `trip-${tripId}`;
            socket.join(roomName);
            console.log(`Usuario ${socket.id} se unió a la sala ${roomName}`);
        });

        socket.on('driverLocationUpdate', ({ tripId, location }) => {
            const roomName = `trip-${tripId}`;
            socket.to(roomName).emit('passengerLocationUpdate', location);
        });

        socket.on('startTrip', async ({ tripId }) => {
            await Trip.updateStatus(tripId, 'en_curso');
            io.to(`trip-${tripId}`).emit('tripStarted', { tripId });
            console.log(`Viaje ${tripId} ha comenzado.`);
        });

        socket.on('endTrip', async ({ tripId }) => {
            await Trip.updateStatus(tripId, 'finalizado');
            io.to(`trip-${tripId}`).emit('tripEnded', { tripId });
            console.log(`Viaje ${tripId} ha finalizado.`);
        });

        socket.on('disconnect', () => {
            console.log(`Usuario desconectado con Socket ID: ${socket.id}`);
        });
    });
}