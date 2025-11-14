import { socketService } from './socketService.js';

class TripSimulationService {
    constructor() {
        this.activeSimulations = new Map(); 
    }

    startSimulation(tripId, routeCoordinates) {
        if (this.activeSimulations.has(tripId)) {
            console.warn(`Ya existe una simulación activa para el viaje ${tripId}, deteniéndola...`);
            this.stopSimulation(tripId);
        }

        if (!routeCoordinates || routeCoordinates.length === 0) {
            console.error('No hay coordenadas de ruta para simular');
            return false;
        }

        console.log(`Iniciando simulación para viaje ${tripId} con ${routeCoordinates.length} puntos`);

        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex >= routeCoordinates.length) {
                console.log(`Simulación completada para viaje ${tripId}`);
                clearInterval(interval);
                this.activeSimulations.delete(tripId);
                
                socketService.emit('endTrip', { tripId });
                return;
            }

            const currentCoord = routeCoordinates[currentIndex];
            const location = {
                latitude: currentCoord.lat,
                longitude: currentCoord.lng
            };

            socketService.emit('driverLocationUpdate', { tripId, location });
            
            console.log(`Viaje ${tripId} - Punto ${currentIndex}/${routeCoordinates.length}`);
            
            currentIndex += 5; 
        }, 1000);

        this.activeSimulations.set(tripId, {
            interval,
            coordinates: routeCoordinates,
            currentIndex
        });

        return true;
    }

    stopSimulation(tripId) {
        const simulation = this.activeSimulations.get(tripId);
        
        if (simulation) {
            console.log(`Deteniendo simulación para viaje ${tripId}`);
            clearInterval(simulation.interval);
            this.activeSimulations.delete(tripId);
            return true;
        }
        
        return false;
    }

    isSimulationActive(tripId) {
        return this.activeSimulations.has(tripId);
    }

    getActiveSimulations() {
        return Array.from(this.activeSimulations.keys());
    }

    stopAllSimulations() {
        console.log('Deteniendo todas las simulaciones activas...');
        this.activeSimulations.forEach((simulation, tripId) => {
            clearInterval(simulation.interval);
        });
        this.activeSimulations.clear();
    }
}

export const tripSimulationService = new TripSimulationService();