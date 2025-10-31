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
        this.routeCoordinates = null;
        this.isMapInitialized = false;
    }

    set user(userData) {
        this._user = userData;
        
        if (this.isConnected && this.tripData && this.isMapInitialized) {
            this.setupDriverControls();
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

        // Cargar datos del viaje
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
        if (this.map) this.map.remove();
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

    connectSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Socket conectado');
            this.socket.emit('joinTripRoom', { tripId: this.tripId });
        });

        this.socket.on('driverLocationUpdate', (location) => {
            if (this.driverMarker) {
                const newLatLng = [location.latitude, location.longitude];
                this.driverMarker.setLatLng(newLatLng);
                if (this.map) {
                    this.map.panTo(newLatLng, { animate: true });
                }
            }
        });

        this.socket.on('tripStarted', ({ tripId }) => {
            console.log(`Viaje ${tripId} iniciado`);
            this.updateStartButton('en_curso');
        });

        this.socket.on('tripEnded', ({ tripId }) => {
            console.log(`Viaje ${tripId} completado`);
            if (this.simulationInterval) {
                clearInterval(this.simulationInterval);
            }
            this.updateStartButton('completado');
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
                console.log('🔵 Map initialized, calling setupDriverControls');
                this.setupDriverControls();
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
            .bindPopup('🚗 Conductor');

        setTimeout(() => {
            if (this.map) {
                this.map.invalidateSize();
            }
        }, 100);
    }

    setupDriverControls() {
        if (!this.user || !this.tripData || this.user.id !== this.tripData.conductor_id) {
            const controlsContainer = this.shadowRoot.getElementById('driver-controls');
            if (controlsContainer) {
                controlsContainer.style.display = 'none';
            }
            return;
        }

        const controlsContainer = this.shadowRoot.getElementById('driver-controls');
        if (!controlsContainer) return;

        controlsContainer.style.display = 'flex';
        this.updateStartButton(this.tripData.estado || 'activo');
    }

    startSimulation() {
        if (!this.routeCoordinates || this.routeCoordinates.length === 0) {
            console.warn('No hay coordenadas de ruta para simular');
            return;
        }

        let currentIndex = 0;
        this.simulationInterval = setInterval(() => {
            if (currentIndex >= this.routeCoordinates.length) {
                clearInterval(this.simulationInterval);
                this.socket.emit('endTrip', { tripId: this.tripId });
                return;
            }

            const currentCoord = this.routeCoordinates[currentIndex];
            const location = {
                latitude: currentCoord.lat,
                longitude: currentCoord.lng
            };

            this.socket.emit('driverLocationUpdate', { tripId: this.tripId, location });
            currentIndex += 5; // Saltar 5 puntos para simular más rápido
        }, 1000);
    }

    showRatingUI() {
        const mapContainer = this.shadowRoot.getElementById('map-container');
        if (mapContainer) mapContainer.style.display = 'none';

        const ratingContainer = this.shadowRoot.getElementById('rating-container');
        if (!ratingContainer) return;

        ratingContainer.style.display = 'block';

        const isDriver = this.user && this.tripData && this.user.id === this.tripData.conductor_id;

        const ratingTitle = ratingContainer.querySelector('h2');
        if (ratingTitle) {
            ratingTitle.textContent = isDriver
                ? 'Viaje finalizado' 
                : `Califica tu viaje con ${this.tripData.conductor_name}`;
        }

        
    }

    updateStartButton(status) {
        const startBtn = this.shadowRoot.getElementById('start-btn');
        if (!startBtn) return;

        if (status === 'completado') {
            startBtn.textContent = 'Viaje Completado';
            startBtn.disabled = true;
        } else if (status === 'en_curso') {
            startBtn.textContent = 'Viaje en Curso';
            startBtn.disabled = true;
        } else { // 'activo' o 'pendiente'
            startBtn.textContent = 'Iniciar Viaje';
            startBtn.disabled = false;
        }

        if (this.tripData) {
            this.tripData.estado = status;
        }
    }

    render() {
        while (this.shadowRoot.firstChild) {
            this.shadowRoot.removeChild(this.shadowRoot.firstChild);
        }

        const style = document.createElement('style');
        style.textContent = `
            /* Estilos de live-trip.css combinados aquí */
            * { box-sizing: border-box; margin: 0; padding: 0; }
            .live-trip-container { padding: 20px; max-width: 1000px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            h2 { font-size: 1.75rem; color: #2c3e50; margin-bottom: 1.5rem; text-align: center; }
            #map-container { background: white; border-radius: 12px; padding: 1rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
            #map { height: 500px; width: 100%; background-color: #eee; border-radius: 8px; }
            .car-icon { background: transparent !important; border: none !important; }
            #driver-controls { display: none; gap: 10px; margin-top: 15px; justify-content: center; flex-wrap: wrap; }
            .control-btn { padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; font-size: 1rem; transition: all 0.3s; }
            .start-btn { background-color: #4CAF50; color: white; }
            .start-btn:hover:not(:disabled) { background-color: #45a049; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3); }
            .control-btn:disabled { background-color: #ccc; cursor: not-allowed; opacity: 0.6; }
            #rating-container { display: none; text-align: center; padding: 50px 20px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); margin-top: 20px; }
            .stars { display: flex; justify-content: center; gap: 10px; margin: 20px 0; }
            .stars span { font-size: 2.5rem; cursor: pointer; color: #ffc107; transition: transform 0.2s; }
            .stars span:hover { transform: scale(1.2); }
            #rating-container p { color: #546e7a; margin: 15px 0; }
            #rating-container button { margin-top: 20px; padding: 12px 30px; background-color: #00796b; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
            #rating-container button:hover:not(:disabled) { background-color: #00695c; transform: translateY(-2px); }
            #rating-container button:disabled { background-color: #b0bec5; cursor: not-allowed; }
            .back-btn { display: block; width: 100%; max-width: 300px; margin: 20px auto 0; padding: 12px; background-color: #6c757d; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
            .back-btn:hover { background-color: #5a6268; transform: translateY(-2px); }
            .passenger-rating-list { list-style: none; padding: 0; margin-top: 20px; }
            .passenger-rating-item { background: #f9f9f9; border-radius: 8px; padding: 15px; margin-bottom: 15px; display: flex; flex-direction: column; align-items: center; }
        `;

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
        startBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de iniciar el viaje?')) {
                this.socket.emit('startTrip', { tripId: this.tripId });
                this.startSimulation();
            }
        });
        driverControls.appendChild(startBtn);
        mapContainer.appendChild(driverControls);

        const ratingContainer = document.createElement('div');
        ratingContainer.id = 'rating-container';

        const ratingTitle = document.createElement('h2');

        const isDriver = this.user && this.tripData && this.user.id === this.tripData.conductor_id;

        if (isDriver) {
            ratingTitle.textContent = 'Califica a tus Pasajeros';
            ratingContainer.appendChild(ratingTitle);

            const passengerList = document.createElement('ul');
            passengerList.className = 'passenger-rating-list';

            if (this.tripData.pasajeros && this.tripData.pasajeros.length > 0) {
                this.tripData.pasajeros.forEach(pasajero => {
                    const item = document.createElement('li');
                    item.className = 'passenger-rating-item';

                    const passengerName = document.createElement('h3');
                    passengerName.textContent = pasajero.name;

                    const starsDiv = this.createStarsElement(pasajero.id);
                    const submitBtn = document.createElement('button');
                    submitBtn.textContent = `Calificar a ${pasajero.name}`;
                    submitBtn.disabled = true;

                    starsDiv.addEventListener('rating-selected', () => {
                        submitBtn.disabled = false;
                    });

                    submitBtn.addEventListener('click', async () => {
                        const rating = parseInt(starsDiv.dataset.rating || '0');
                        if (rating === 0) return;
                        
                        submitBtn.disabled = true;
                        submitBtn.textContent = 'Enviando...';

                        const res = await api.submitRating(this.tripId, pasajero.id, rating, '');
                        if (res.success) {
                            const thanksMsg = document.createElement('h4');
                            thanksMsg.textContent = `¡Gracias por calificar a ${pasajero.name}!`;
                            item.innerHTML = ''; 
                            item.appendChild(thanksMsg);
                        } else {
                            alert(`Error al calificar: ${res.error}`);
                            submitBtn.disabled = false;
                            submitBtn.textContent = `Calificar a ${pasajero.name}`;
                        }
                    });

                    item.append(passengerName, starsDiv, submitBtn);
                    passengerList.appendChild(item);
                });
            } else {
                const noPassengers = document.createElement('p');
                noPassengers.textContent = 'No hubo pasajeros en este viaje.';
                passengerList.appendChild(noPassengers);
            }
            ratingContainer.appendChild(passengerList);
        } else {
            ratingTitle.textContent = `Califica tu viaje con ${this.tripData.conductor_name}`;
            const starsDiv = this.createStarsElement(this.tripData.conductor_id);
            const submitRatingBtn = document.createElement('button');
            submitRatingBtn.textContent = 'Enviar Calificación';
            submitRatingBtn.disabled = true;

            starsDiv.addEventListener('rating-selected', () => {
                submitRatingBtn.disabled = false;
            });

            submitRatingBtn.addEventListener('click', async () => {
                const selectedRating = parseInt(starsDiv.dataset.rating || '0');
                if (selectedRating === 0) return alert('Por favor, selecciona una calificación.');

                const res = await api.submitRating(this.tripId, this.tripData.conductor_id, selectedRating, '');
                alert(res.success ? '¡Gracias por tu calificación!' : `Error: ${res.error}`);
                
                window.history.pushState({}, '', '/dashboard');
                window.dispatchEvent(new Event('popstate'));
            });

            ratingContainer.append(ratingTitle, starsDiv, submitRatingBtn);
        }

        const backBtn = document.createElement('button');
        backBtn.classList.add('back-btn');
        backBtn.textContent = '← Volver al Dashboard';
        backBtn.addEventListener('click', () => {
            window.history.pushState({}, '', '/dashboard');
            window.dispatchEvent(new Event('popstate'));
        });

        container.appendChild(title);
        container.appendChild(mapContainer);
        container.appendChild(ratingContainer);
        container.appendChild(backBtn);

        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(container);
    }

    createStarsElement(targetId) {
        const starsDiv = document.createElement('div');
        starsDiv.className = 'stars';
        starsDiv.dataset.targetId = targetId;

        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.textContent = '☆';
            star.dataset.value = i;
            star.addEventListener('click', () => {
                const rating = star.dataset.value;
                starsDiv.dataset.rating = rating;
                starsDiv.querySelectorAll('span').forEach(s => {
                    s.textContent = parseInt(s.dataset.value) <= rating ? '★' : '☆';
                });
                starsDiv.dispatchEvent(new CustomEvent('rating-selected'));
            });
            starsDiv.appendChild(star);
        }
        return starsDiv;
    }
}

customElements.define('live-trip-wc', LiveTripWC);