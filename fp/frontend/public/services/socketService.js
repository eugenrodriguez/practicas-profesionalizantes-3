import { Toast } from '../utils/Toast.js';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.eventHandlers = new Map(); 
        this.tripRooms = new Set(); 
    }

    connect() {
        if (this.socket && this.isConnected) {
            console.log('Socket ya está conectado');
            return this.socket;
        }

        console.log('Conectando socket global...');
        this.socket = io();

        this.socket.on('connect', () => {
            console.log('Socket global conectado:', this.socket.id);
            this.isConnected = true;

            this.tripRooms.forEach(tripId => {
                this.socket.emit('joinTripRoom', { tripId });
                console.log(`Reconectado a sala trip-${tripId}`);
            });
        });

        this.socket.on('disconnect', () => {
            console.log('Socket global desconectado');
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Error de conexión socket:', error);
        });

        return this.socket;
    }

    getSocket() {
        if (!this.socket) {
            this.connect();
        }
        return this.socket;
    }

    joinTripRoom(tripId) {
        const socket = this.getSocket();
        this.tripRooms.add(tripId);
        socket.emit('joinTripRoom', { tripId });
        console.log(`Unido a sala trip-${tripId}`);
    }

    leaveTripRoom(tripId) {
        const socket = this.getSocket();
        this.tripRooms.delete(tripId);
        socket.emit('leaveTripRoom', { tripId });
        console.log(`Saliendo de sala trip-${tripId}`);
    }

    on(event, handler) {
        const socket = this.getSocket();
        
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event).add(handler);

        socket.on(event, handler);
    }

    off(event, handler) {
        const socket = this.getSocket();
        
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).delete(handler);
        }

        socket.off(event, handler);
    }

    emit(event, data) {
        const socket = this.getSocket();
        socket.emit(event, data);
    }

    disconnect() {
        if (this.socket) {
            console.log('🔌 Desconectando socket global...');
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.tripRooms.clear();
        }
    }

    removeComponentListeners(listeners) {
        listeners.forEach(({ event, handler }) => {
            this.off(event, handler);
        });
    }
}

export const socketService = new SocketService();