// frontend/public/components/dashboard/LiveTripWC.js
import { api } from '../../services/api.js';

class LiveTripWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.socket = null;
        this.tripId = null;
        this._user = null;
        this.tripData = null;
        this.map = null;
        this.driverMarker = null;
        this.simulationInterval = null;
    }

    set user(userData) {
        this._user = userData;
        if (this.isConnected && this.tripData) {
            this.render(); 
            this.loadLeaflet(); 
        }
    }

    get user() {
        return this._user;
    }

    async connectedCallback() {
        const params = new URLSearchParams(window.location.search);
        this.tripId = params.get('id');

        if (!this.tripId) {
            this.displayError('No se especificó un ID de viaje.');
            return;
        }

        const tripRes = await api.getTripById(this.tripId);
        if (!tripRes.success) {
            this.displayError('Error al cargar los datos del viaje.');
            return;
        }
        this.tripData = tripRes.trip;

        this.render();
        this.loadLeaflet();
        this.connectSocket();
    }

    disconnectedCallback() {
        if (this.socket) this.socket.disconnect();
        if (this.simulationInterval) clearInterval(this.simulationInterval);
    }

    displayError(message) {
        this.shadowRoot.innerHTML = '';
        const errorMsg = document.createElement('p');
        errorMsg.textContent = message;
        errorMsg.style.padding = '20px';
        this.shadowRoot.appendChild(errorMsg);
    }

    connectSocket() {
        this.socket = io();
        this.socket.on('connect', () => {
            this.socket.emit('joinTripRoom', { tripId: this.tripId });
        });
        this.socket.on('passengerLocationUpdate', (location) => {
            if (this.driverMarker) {
                const newLatLng = [location.latitude, location.longitude];
                this.driverMarker.setLatLng(newLatLng);
                this.map.panTo(newLatLng, { animate: true });
            }
        });
        this.socket.on('tripEnded', () => {
            if (this.simulationInterval) clearInterval(this.simulationInterval);
            this.showRatingUI();
        });
    }

    loadLeaflet() {
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        const routingCSS = document.createElement('link');
        routingCSS.rel = 'stylesheet';
        routingCSS.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css';
        const leafletJS = document.createElement('script');
        leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        leafletJS.onload = () => {
            const routingJS = document.createElement('script');
            routingJS.src = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js';
            routingJS.onload = () => this.initMap();
            this.shadowRoot.appendChild(routingJS);
        };
        this.shadowRoot.append(leafletCSS, routingCSS, leafletJS);
    }

    initMap() {
        const mapContainer = this.shadowRoot.getElementById('map');
        if (!mapContainer || !this.tripData) return;

        const { origen_lat, origen_lng, destino_lat, destino_lng } = this.tripData;
        if (!origen_lat || !origen_lng || !destino_lat || !destino_lng) {
            this.displayError('El viaje no tiene coordenadas válidas para mostrar la ruta.');
            return;
        }

        const startCoords = [origen_lat, origen_lng];
        this.map = L.map(mapContainer).setView(startCoords, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

        L.marker(startCoords, {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png', shadowSize: [41, 41]
            })
        }).addTo(this.map).bindPopup('Origen');

        L.marker([destino_lat, destino_lng], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png', shadowSize: [41, 41]
            })
        }).addTo(this.map).bindPopup('Destino');

        const waypoints = [ L.latLng(origen_lat, origen_lng), L.latLng(destino_lat, destino_lng) ];
        if (this.tripData.waypoints && this.tripData.waypoints.length > 2) {
            try {
                const intermediatePoints = JSON.parse(this.tripData.waypoints).map(wp => L.latLng(wp.lat, wp.lng));
                waypoints.splice(1, 0, ...intermediatePoints);
            } catch (e) { console.error("Error al parsear waypoints:", e); }
        }

        const routingControl = L.Routing.control({
            waypoints, routeWhileDragging: false, show: false, addWaypoints: false, createMarker: () => null,
            lineOptions: { styles: [{ color: '#00796b', weight: 5 }] }
        }).addTo(this.map);

        routingControl.on('routesfound', (e) => {
            const route = e.routes[0];
            if (route) this.routeCoordinates = route.coordinates;
        });

        const carIcon = L.icon({
            iconUrl: 'https://i.imgur.com/L4fVwL3.png',
            iconSize: [32, 32], iconAnchor: [16, 16]
        });
        this.driverMarker = L.marker(startCoords, { icon: carIcon }).addTo(this.map).bindPopup('Conductor');

        setTimeout(() => this.map.invalidateSize(), 100);
    }
    
    startSimulation() {
        if (!this.routeCoordinates || this.routeCoordinates.length === 0) return;
        let currentIndex = 0;
        this.simulationInterval = setInterval(() => {
            if (currentIndex >= this.routeCoordinates.length) {
                clearInterval(this.simulationInterval);
                this.socket.emit('endTrip', { tripId: this.tripId }); 
                return;
            }
            const currentCoord = this.routeCoordinates[currentIndex];
            const location = { latitude: currentCoord.lat, longitude: currentCoord.lng };
            this.socket.emit('driverLocationUpdate', { tripId: this.tripId, location });
            if (this.driverMarker) {
                this.driverMarker.setLatLng([location.latitude, location.longitude]);
            }
            currentIndex += 5;
        }, 1000);
    }

    showRatingUI() {
        this.shadowRoot.getElementById('map-container').style.display = 'none';
        const ratingContainer = this.shadowRoot.getElementById('rating-container');
        ratingContainer.style.display = 'block';
        const isDriver = this.user.id === this.tripData.conductor_id;
        const ratingTitle = ratingContainer.querySelector('h2');
        ratingTitle.textContent = isDriver ? 'Califica a tus pasajeros' : `Califica tu viaje con ${this.tripData.conductor_name}`;
    }

    render() {
        this.shadowRoot.innerHTML = '';
        const style = document.createElement('style');
        style.textContent = `
            #map { height: 400px; width: 100%; background-color: #eee; }
            .live-trip-container { padding: 20px; max-width: 800px; margin: auto; }
            #driver-controls { display: none; gap: 10px; margin-top: 10px; justify-content: center; }
            #rating-container { display: none; text-align: center; padding-top: 50px; }
            button { padding: 10px 15px; border-radius: 5px; border: none; cursor: pointer; font-weight: bold; }
            #start-btn { background-color: #4CAF50; color: white; }
            #end-btn { background-color: #f44336; color: white; }
            button:disabled { background-color: #ccc; cursor: not-allowed; }
        `;
        const container = document.createElement('div');
        container.className = 'live-trip-container';
        const title = document.createElement('h2');
        title.textContent = 'Seguimiento del Viaje';
        const mapContainer = document.createElement('div');
        mapContainer.id = 'map-container';
        const mapDiv = document.createElement('div');
        mapDiv.id = 'map';
        
        mapContainer.append(mapDiv);


        if (this.user && this.tripData && this.user.id === this.tripData.conductor_id) {
            const driverControls = document.createElement('div');
            driverControls.id = 'driver-controls';
            driverControls.style.display = 'flex'; 

            const startBtn = document.createElement('button');
            startBtn.id = 'start-btn';
            
            if (this.tripData.estado === 'en_curso') {
                startBtn.textContent = 'Viaje en Curso';
                startBtn.disabled = true;
                this.startSimulation(); 
            } else if (this.tripData.estado === 'finalizado') {
                startBtn.textContent = 'Viaje Finalizado';
                startBtn.disabled = true;
            } else {
                startBtn.textContent = 'Iniciar Viaje';
            }

            startBtn.addEventListener('click', () => {
                this.socket.emit('startTrip', { tripId: this.tripId });
                this.startSimulation();
                alert('Viaje iniciado');
                startBtn.textContent = 'Viaje en Curso';
                startBtn.disabled = true;
            });

            driverControls.append(startBtn);
            mapContainer.append(driverControls);
        }

        const ratingContainer = document.createElement('div');
        ratingContainer.id = 'rating-container';
        const ratingTitle = document.createElement('h2');
        ratingTitle.textContent = 'Califica tu experiencia';
        const ratingText = document.createElement('p');
        ratingText.textContent = '¡Gracias por viajar con nosotros!';
        ratingContainer.append(ratingTitle, ratingText);

        container.append(title, mapContainer, ratingContainer);
        this.shadowRoot.append(style, container);
    }
}

customElements.define('live-trip-wc', LiveTripWC);