import { api } from '../../services/api.js';
import { socketService } from '../../services/socketService.js';
import { tripSimulationService } from '../../services/tripSimulationService.js';
import './RatingWC.js'; 
import { Toast } from '../../utils/Toast.js';
 
class LiveTripService {
    static async getTripById(tripId) {
        return await api.getTripById(tripId);
    }
}

class LiveTripSocketManager {
    constructor() {
        this.componentListeners = [];
    }

    setupListeners(tripId, callbacks) {
        socketService.connect();
        socketService.joinTripRoom(tripId);

        const handleDriverLocationUpdate = (location) => callbacks.onLocationUpdate(location);
        const handleTripStarted = (data) => callbacks.onTripStarted(data);
        const handleTripEnded = (data) => callbacks.onTripEnded(data);

        socketService.on('driverLocationUpdate', handleDriverLocationUpdate);
        socketService.on('tripStarted', handleTripStarted);
        socketService.on('tripEnded', handleTripEnded);

        this.componentListeners.push(
            { event: 'driverLocationUpdate', handler: handleDriverLocationUpdate },
            { event: 'tripStarted', handler: handleTripStarted },
            { event: 'tripEnded', handler: handleTripEnded }
        );
        console.log('Socket listeners configurados para viaje', tripId);
    }

    removeListeners() {
        socketService.removeComponentListeners(this.componentListeners);
        this.componentListeners = [];
        console.log('Socket listeners removidos.');
    }

    emitStartTrip(tripId) {
        socketService.emit('startTrip', { tripId });
    }
}

class LiveTripMapManager {
    constructor(shadowRoot) {
        this.shadowRoot = shadowRoot;
        this.map = null;
        this.driverMarker = null;
        this.routeCoordinates = null;
        this.isMapInitialized = false;
    }

    loadScripts() {
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        
        const routingCSS = document.createElement('link');
        routingCSS.rel = 'stylesheet';
        routingCSS.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css';
        
        const leafletJS = document.createElement('script');
        leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        
        return new Promise((resolve) => {
            leafletJS.onload = () => {
                const routingJS = document.createElement('script');
                routingJS.src = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js';
                routingJS.onload = resolve;
                this.shadowRoot.appendChild(routingJS);
            };
            this.shadowRoot.append(leafletCSS, routingCSS, leafletJS);
        });
    }

    initMap(mapContainer, tripData, displayErrorCallback, setupDriverControlsCallback) {
        if (!mapContainer || !tripData) return;

        const { origen_lat, origen_lng, destino_lat, destino_lng } = tripData;
        if (!origen_lat || !origen_lng || !destino_lat || !destino_lng) {
            displayErrorCallback('El viaje no tiene coordenadas válidas para mostrar la ruta.');
            return;
        }

        const startCoords = [origen_lat, origen_lng];
        this.map = L.map(mapContainer).setView(startCoords, 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        L.marker(startCoords, {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                shadowSize: [41, 41]
            })
        }).addTo(this.map).bindPopup('Origen');

        L.marker([destino_lat, destino_lng], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                shadowSize: [41, 41]
            })
        }).addTo(this.map).bindPopup('Destino');

        const waypoints = [
            L.latLng(origen_lat, origen_lng),
            L.latLng(destino_lat, destino_lng)
        ];

        const routingControl = L.Routing.control({
            waypoints,
            routeWhileDragging: false,
            show: false,
            addWaypoints: false,
            createMarker: () => null,
            lineOptions: {
                styles: [{ color: '#00796b', weight: 5 }]
            }
        }).addTo(this.map);

        routingControl.on('routesfound', (e) => {
            const route = e.routes[0];
            if (route && route.coordinates) {
                this.routeCoordinates = route.coordinates;
                this.isMapInitialized = true;
                console.log('Mapa inicializado con', route.coordinates.length, 'puntos');
                setupDriverControlsCallback();
            }
        });

        const carIconSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                <path fill="#ff7c68ff" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
        `;
        
        const carIcon = L.divIcon({
            html: carIconSvg,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            className: 'car-icon'
        });
        
        this.driverMarker = L.marker(startCoords, { icon: carIcon })
            .addTo(this.map)
            .bindPopup('Conductor');

        setTimeout(() => {
            if (this.map) {
                this.map.invalidateSize();
            }
        }, 100);
    }

    updateDriverLocation(location) {
        if (this.driverMarker) {
            const newLatLng = [location.latitude, location.longitude];
            this.driverMarker.setLatLng(newLatLng);
            if (this.map) {
                this.map.panTo(newLatLng, { animate: true });
            }
        }
    }

    getRouteCoordinates() {
        return this.routeCoordinates;
    }

    invalidateSize() {
        if (this.map) {
            this.map.invalidateSize();
        }
    }

    removeMap() {
        if (this.map) {
            this.map.remove();
            this.map = null;
            this.driverMarker = null;
            this.routeCoordinates = null;
            this.isMapInitialized = false;
        }
    }
}

class LiveTripView {
    constructor(shadowRoot) {
        this.shadowRoot = shadowRoot;
        this.elements = {};
    }

    render(tripData, isDriver) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/components/dashboard/css/live-trip.css';
        this.shadowRoot.appendChild(link);

        const container = document.createElement('div');
        container.className = 'live-trip-container';

        const title = document.createElement('h2');
        title.textContent = 'Seguimiento del Viaje en Tiempo Real';

        const mapContainer = document.createElement('div');
        mapContainer.id = 'map-container';

        const mapDiv = document.createElement('div');
        mapDiv.id = 'map';
        mapContainer.appendChild(mapDiv);

        const driverControls = document.createElement('div');
        driverControls.id = 'driver-controls';
        const startBtn = document.createElement('button');
        startBtn.id = 'start-btn';
        startBtn.classList.add('control-btn', 'start-btn');
        driverControls.appendChild(startBtn);
        mapContainer.appendChild(driverControls);

        const ratingContainer = document.createElement('div');
        ratingContainer.id = 'rating-container';

        const backBtn = document.createElement('button');
        backBtn.classList.add('back-btn');
        backBtn.textContent = '← Volver al Dashboard';

        container.appendChild(title);
        container.appendChild(mapContainer);
        container.appendChild(ratingContainer);
        container.appendChild(backBtn);

        this.elements = {
            container,
            mapContainer,
            mapDiv,
            driverControls,
            startBtn,
            ratingContainer,
            backBtn
        };
        return container;
    }

    displayError(message) {
        while (this.shadowRoot.firstChild) {
            this.shadowRoot.removeChild(this.shadowRoot.firstChild);
        }
        const errorMsg = document.createElement('p');
        errorMsg.textContent = message;
        errorMsg.style.padding = '20px';
        errorMsg.style.color = '#c62828';
        errorMsg.style.textAlign = 'center';
        this.shadowRoot.appendChild(errorMsg);
    }

    updateStartButton(status) {
        const startBtn = this.elements.startBtn;
        if (!startBtn) return;

        if (status === 'completado') {
            startBtn.textContent = 'Viaje Completado';
            startBtn.disabled = true;
        } else if (status === 'en_curso') {
            startBtn.textContent = 'Viaje en Curso';
            startBtn.disabled = true;
        } else { 
            startBtn.textContent = 'Iniciar Viaje';
            startBtn.disabled = false;
        }
    }

    setupDriverControls(isDriver, tripStatus) {
        const controlsContainer = this.elements.driverControls;
        if (!controlsContainer) return;

        if (isDriver) {
            controlsContainer.style.display = 'flex';
            this.updateStartButton(tripStatus);
        } else {
            controlsContainer.style.display = 'none';
        }
    }

    showRatingUI(tripData, user) {
        if (this.elements.mapContainer) this.elements.mapContainer.style.display = 'none';

        const ratingContainer = this.elements.ratingContainer;
        if (!ratingContainer) return;

        ratingContainer.style.display = 'block';

        const ratingComponent = document.createElement('rating-wc');
        ratingComponent.tripData = tripData;
        ratingComponent.user = user;

        while (ratingContainer.firstChild) {
            ratingContainer.removeChild(ratingContainer.firstChild);
        }
        ratingContainer.appendChild(ratingComponent);
        this.elements.ratingComponent = ratingComponent;
    }

    updateRatingComponentUser(user) {
        if (this.elements.ratingComponent) {
            this.elements.ratingComponent.user = user;
        }
    }
}

class LiveTripWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.tripId = null;
        this._user = null;
        this.tripData = null;
        this.view = new LiveTripView(this.shadowRoot);
        this.mapManager = new LiveTripMapManager(this.shadowRoot);
        this.socketManager = new LiveTripSocketManager();
    }

    set user(userData) {
        this._user = userData;
        if (this.isConnected && this.tripData && this.mapManager.isMapInitialized) {
            this.view.setupDriverControls(this.user.id === this.tripData.conductor_id, this.tripData.estado);
            this.view.updateRatingComponentUser(userData);
        }
    }

    get user() {
        return this._user;
    }

    async connectedCallback() {
        const params = new URLSearchParams(window.location.search);
        this.tripId = params.get('id');

        if (!this.tripId) {
            this.view.displayError('No se especificó un ID de viaje.');
            return;
        }

        const tripRes = await LiveTripService.getTripById(this.tripId);
        if (!tripRes.success) {
            this.view.displayError('Error al cargar los datos del viaje.');
            return;
        }
        this.tripData = tripRes.trip;

        this.render();
        await this.mapManager.loadScripts();
        this.mapManager.initMap(
            this.view.elements.mapDiv,
            this.tripData,
            (msg) => this.view.displayError(msg),
            () => this.view.setupDriverControls(this.user.id === this.tripData.conductor_id, this.tripData.estado)
        );
        this.setupSocketListeners();
        this.addEventListeners();
    }

    disconnectedCallback() {
        console.log('Componente LiveTripWC desconectándose...');
        this.socketManager.removeListeners();
        this.mapManager.removeMap();
        this.removeEventListeners();
        console.log('Componente desconectado, simulación sigue activa');
    }

    render() {
        while (this.shadowRoot.firstChild) {
            this.shadowRoot.removeChild(this.shadowRoot.firstChild);
        }
        const content = this.view.render(this.tripData, this.user && this.tripData && this.user.id === this.tripData.conductor_id);
        this.shadowRoot.appendChild(content);
    }

    addEventListeners() {
        this.view.elements.startBtn.addEventListener('click', this.handleStartTripClick.bind(this));
        this.view.elements.backBtn.addEventListener('click', this.handleBackClick.bind(this));
    }

    removeEventListeners() {
        this.view.elements.startBtn.removeEventListener('click', this.handleStartTripClick.bind(this));
        this.view.elements.backBtn.removeEventListener('click', this.handleBackClick.bind(this));
    }

    handleStartTripClick() {
        const activeSimulations = tripSimulationService.getActiveSimulations();
        if (activeSimulations.length > 0 && !activeSimulations.includes(this.tripId)) {
            Toast.show('Ya tienes un viaje en curso. Finalízalo antes de iniciar otro.', 'warning');
            return;
        }

        if (confirm('¿Estás seguro de iniciar el viaje? La simulación continuará en segundo plano.')) {
            this.socketManager.emitStartTrip(this.tripId);
            this.startSimulation();
        }
    }

    handleBackClick() {
        window.history.pushState({}, '', '/dashboard');
        window.dispatchEvent(new Event('popstate'));
    }

    setupSocketListeners() {
        this.socketManager.setupListeners(this.tripId, {
            onLocationUpdate: (location) => this.mapManager.updateDriverLocation(location),
            onTripStarted: ({ tripId }) => {
                console.log(`Viaje ${tripId} iniciado`);
                this.view.updateStartButton('en_curso');
                if (this.tripData) this.tripData.estado = 'en_curso';
            },
            onTripEnded: ({ tripId }) => {
                console.log(`Viaje ${tripId} completado`);
                tripSimulationService.stopSimulation(tripId);
                this.view.updateStartButton('completado');
                if (this.tripData) this.tripData.estado = 'completado';
                this.view.showRatingUI(this.tripData, this.user);
            }
        });

        const handleTripStartError = (data) => {
            Toast.show(data.error, 'error');
            tripSimulationService.stopSimulation(this.tripId);
            this.view.updateStartButton(this.tripData.estado);
        };

        socketService.on('tripStartError', handleTripStartError);
        
        this.socketManager.componentListeners.push(
            { event: 'tripStartError', handler: handleTripStartError }
        );
    }

    startSimulation() {
        const routeCoordinates = this.mapManager.getRouteCoordinates();
        if (!routeCoordinates || routeCoordinates.length === 0) {
            console.warn('No hay coordenadas de ruta para simular');
            Toast.show('No se pudo iniciar la simulación. No hay coordenadas disponibles.', 'error');
            return;
        }

        const success = tripSimulationService.startSimulation(
            this.tripId,
            routeCoordinates
        );

        if (success) {
            console.log('Simulación iniciada correctamente en segundo plano');
            Toast.show('Viaje iniciado. La simulación continuará en segundo plano.', 'success');
        } else {
            console.error('Error al iniciar la simulación');
            Toast.show('Error al iniciar la simulación.', 'error');
        }
    }
}

customElements.define('live-trip-wc', LiveTripWC);