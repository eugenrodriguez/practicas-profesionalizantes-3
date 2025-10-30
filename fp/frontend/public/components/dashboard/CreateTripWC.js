// frontend/public/components/dashboard/CreateTripWC.js
import { api } from '../../services/api.js';

class CreateTripWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.handleSubmit = this.handleSubmit.bind(this);
        this.map = null;
        this.originMarker = null;
        this.destinationMarker = null;
        this.routeControl = null;
        this.waypoints = [];
    }

    connectedCallback() {
        this.render();
        this.loadLeaflet();
    }

    disconnectedCallback() {
        this.removeEvents();
        if (this.map) {
            this.map.remove();
        }
    }

    loadLeaflet() {
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        this.shadowRoot.appendChild(leafletCSS);

        const routingCSS = document.createElement('link');
        routingCSS.rel = 'stylesheet';
        routingCSS.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css';
        this.shadowRoot.appendChild(routingCSS);

        const leafletJS = document.createElement('script');
        leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        leafletJS.onload = () => {
            const routingJS = document.createElement('script');
            routingJS.src = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js';
            routingJS.onload = () => {
                this.initMap();

                setTimeout(() => {
                if (this.map) {
                        this.map.invalidateSize(); 
                        console.log('Leaflet size invalidated.');
                    }
                }, 100);
            };
            this.shadowRoot.appendChild(routingJS);
        };
        this.shadowRoot.appendChild(leafletJS);
    }

    initMap() {
        const mapContainer = this.shadowRoot.getElementById('map');
        if (!mapContainer) return;

        this.map = L.map(mapContainer).setView([-38.0055, -57.5426], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        this.addSearchControl();
    }

    addSearchControl() {
        const searchContainer = this.shadowRoot.getElementById('search-container');

        while (searchContainer.firstChild) {
            searchContainer.removeChild(searchContainer.firstChild);
        }

        const originSearchBox = document.createElement('div');
        originSearchBox.classList.add('search-box');

        const originInput = document.createElement('input');
        originInput.type = 'text';
        originInput.id = 'origin-search';
        originInput.placeholder = 'Buscar origen...';

        const originBtn = document.createElement('button');
        originBtn.id = 'search-origin-btn';
        originBtn.textContent = 'Buscar Origen';

        originSearchBox.appendChild(originInput);
        originSearchBox.appendChild(originBtn);

        const destinationSearchBox = document.createElement('div');
        destinationSearchBox.classList.add('search-box');

        const destinationInput = document.createElement('input');
        destinationInput.type = 'text';
        destinationInput.id = 'destination-search';
        destinationInput.placeholder = 'Buscar destino...';

        const destinationBtn = document.createElement('button');
        destinationBtn.id = 'search-destination-btn';
        destinationBtn.textContent = 'Buscar Destino';

        destinationSearchBox.appendChild(destinationInput);
        destinationSearchBox.appendChild(destinationBtn);

        const addWaypointBtn = document.createElement('button');
        addWaypointBtn.id = 'add-waypoint-btn';
        addWaypointBtn.textContent = 'Agregar Parada';

        const waypointsList = document.createElement('div');
        waypointsList.id = 'waypoints-list';

        const calculateRouteBtn = document.createElement('button');
        calculateRouteBtn.id = 'calculate-route-btn';
        calculateRouteBtn.textContent = 'Calcular Ruta';

        searchContainer.appendChild(originSearchBox);
        searchContainer.appendChild(destinationSearchBox);
        searchContainer.appendChild(addWaypointBtn);
        searchContainer.appendChild(waypointsList);
        searchContainer.appendChild(calculateRouteBtn);

        originBtn.addEventListener('click', () => {
            this.searchLocation('origin');
        });

        destinationBtn.addEventListener('click', () => {
            this.searchLocation('destination');
        });

        addWaypointBtn.addEventListener('click', () => {
            this.addWaypoint();
        });

        calculateRouteBtn.addEventListener('click', () => {
            this.calculateRoute();
        });
    }

    async searchLocation(type) {
        const inputId = type === 'origin' ? 'origin-search' : 'destination-search';
        const query = this.shadowRoot.getElementById(inputId).value;

        if (!query) {
            alert('Ingrese una ubicación');
            return;
        }

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const results = await response.json();

            if (results.length === 0) {
                alert('No se encontró la ubicación');
                return;
            }

            const location = results[0];
            const lat = parseFloat(location.lat);
            const lng = parseFloat(location.lon);

            if (type === 'origin') {
                if (this.originMarker) {
                    this.map.removeLayer(this.originMarker);
                }
                this.originMarker = L.marker([lat, lng], {
                    draggable: true,
                    icon: L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41]
                    })
                }).addTo(this.map).bindPopup('Origen').openPopup();

                this.map.setView([lat, lng], 13);
            } else {
                if (this.destinationMarker) {
                    this.map.removeLayer(this.destinationMarker);
                }
                this.destinationMarker = L.marker([lat, lng], {
                    draggable: true,
                    icon: L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41]
                    })
                }).addTo(this.map).bindPopup('Destino').openPopup();
            }
        } catch (error) {
            console.error('Error buscando ubicación:', error);
            alert('Error al buscar ubicación');
        }
    }

    addWaypoint() {
        const waypointContainer = this.shadowRoot.getElementById('waypoints-list');
        const waypointId = `waypoint-${this.waypoints.length}`;

        const waypointDiv = document.createElement('div');
        waypointDiv.classList.add('waypoint-item');

        const waypointInput = document.createElement('input');
        waypointInput.type = 'text';
        waypointInput.id = waypointId;
        waypointInput.placeholder = `Parada intermedia ${this.waypoints.length + 1}`;

        const searchBtn = document.createElement('button');
        searchBtn.setAttribute('data-waypoint', waypointId);
        searchBtn.textContent = 'Buscar';

        const removeBtn = document.createElement('button');
        removeBtn.setAttribute('data-remove', waypointId);
        removeBtn.textContent = 'Eliminar';

        waypointDiv.appendChild(waypointInput);
        waypointDiv.appendChild(searchBtn);
        waypointDiv.appendChild(removeBtn);

        waypointContainer.appendChild(waypointDiv);

        searchBtn.addEventListener('click', () => {
            this.searchWaypoint(waypointId);
        });

        removeBtn.addEventListener('click', () => {
            waypointDiv.remove();
            this.waypoints = this.waypoints.filter(w => w.id !== waypointId);
        });
    }

    async searchWaypoint(waypointId) {
        const query = this.shadowRoot.getElementById(waypointId).value;

        if (!query) {
            alert('Ingrese una parada');
            return;
        }

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const results = await response.json();

            if (results.length === 0) {
                alert('No se encontró la ubicación');
                return;
            }

            const location = results[0];
            const lat = parseFloat(location.lat);
            const lng = parseFloat(location.lon);

            const marker = L.marker([lat, lng], {
                draggable: true,
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41]
                })
            }).addTo(this.map).bindPopup(`Parada ${this.waypoints.length + 1}`);

            this.waypoints.push({
                id: waypointId,
                lat,
                lng,
                marker,
                address: query
            });
        } catch (error) {
            console.error('Error buscando parada:', error);
            alert('Error al buscar parada');
        }
    }

    calculateRoute() {
        if (!this.originMarker || !this.destinationMarker) {
            alert('Debe seleccionar origen y destino');
            return;
        }

        if (this.routeControl) {
            this.map.removeControl(this.routeControl);
        }

        const originLatLng = this.originMarker.getLatLng();
        const destinationLatLng = this.destinationMarker.getLatLng();

        const waypointsLatLng = [
            L.latLng(originLatLng.lat, originLatLng.lng),
            ...this.waypoints.map(w => L.latLng(w.lat, w.lng)),
            L.latLng(destinationLatLng.lat, destinationLatLng.lng)
        ];

        this.routeControl = L.Routing.control({
            waypoints: waypointsLatLng,
            routeWhileDragging: true,
            showAlternatives: true,
            lineOptions: {
                styles: [{ color: '#4db6ac', weight: 5 }]
            }
        }).addTo(this.map);

        alert('Ruta calculada. Puede ajustarla arrastrando los marcadores.');
    }

    render() {
        while (this.shadowRoot.firstChild) {
            this.shadowRoot.removeChild(this.shadowRoot.firstChild);
        }

        this.style.transition = 'opacity 0.3s ease-in-out';
        this.style.opacity = '0';

        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '/components/dashboard/css/create-trip.css';
        
        styles.onload = () => {
            this.style.opacity = '1'; 

            if (this.map) {
                this.map.invalidateSize();
            }
        };

        const container = document.createElement('div');
        container.classList.add('create-trip-container');

        const title = document.createElement('h2');
        title.textContent = 'Crear Viaje';

        const mapDiv = document.createElement('div');
        mapDiv.id = 'map';

        const searchContainer = document.createElement('div');
        searchContainer.id = 'search-container';

        const form = document.createElement('form');
        form.id = 'create-trip-form';

        const fields = [
            { placeholder: 'Fecha y hora de salida', name: 'fecha_salida', type: 'datetime-local' },
            { placeholder: 'Asientos disponibles', name: 'asientos_disponibles', type: 'number', min: '1' },
            { placeholder: 'Precio sugerido', name: 'precio', type: 'number', step: '0.01', min: '0' }
        ];

        fields.forEach(f => {
            const input = document.createElement('input');
            input.name = f.name;
            input.placeholder = f.placeholder;
            input.type = f.type;
            if (f.step) input.step = f.step;
            if (f.min) input.min = f.min;
            input.required = true;
            form.appendChild(input);
        });

        const submit = document.createElement('button');
        submit.type = 'submit';
        submit.textContent = 'Crear Viaje';

        const backBtn = document.createElement('button');
        backBtn.classList.add('back-btn');
        backBtn.textContent = '← Volver al Dashboard';
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.history.pushState({}, '', '/dashboard');
            window.dispatchEvent(new Event('popstate'));
        });

        form.appendChild(submit);

        container.append(title, mapDiv, searchContainer, form, backBtn);
        this.shadowRoot.append(styles, container);

        this.addEvents();
    }

    addEvents() {
        const form = this.shadowRoot.getElementById('create-trip-form');
        if (form) form.addEventListener('submit', this.handleSubmit);
    }

    removeEvents() {
        const form = this.shadowRoot.getElementById('create-trip-form');
        if (form) form.removeEventListener('submit', this.handleSubmit);
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.originMarker || !this.destinationMarker) {
            alert('Debe seleccionar origen y destino en el mapa');
            return;
        }

        const form = e.currentTarget;
        const originLatLng = this.originMarker.getLatLng();
        const destinationLatLng = this.destinationMarker.getLatLng();

        const data = {
            origen: this.shadowRoot.getElementById('origin-search').value,
            destino: this.shadowRoot.getElementById('destination-search').value,
            origen_lat: originLatLng.lat,
            origen_lng: originLatLng.lng,
            destino_lat: destinationLatLng.lat,
            destino_lng: destinationLatLng.lng,
            waypoints: this.waypoints.map(w => ({ lat: w.lat, lng: w.lng, address: w.address })),
            fecha_salida: form.fecha_salida.value.replace('T', ' '),
            asientos_disponibles: form.asientos_disponibles.value,
            precio: form.precio.value
        };

        const res = await api.createTrip(data);
        if (res.success) {
            alert('Viaje creado correctamente');
            window.history.pushState({}, '', '/dashboard/my-trips');
            window.dispatchEvent(new Event('popstate'));
        } else {
            alert(res.error || 'Error creando viaje');
        }
    }
}

customElements.define('create-trip-wc', CreateTripWC);