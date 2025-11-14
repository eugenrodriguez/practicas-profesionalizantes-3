import { api } from '../../services/api.js';
import { Toast } from '../../utils/Toast.js';

const MAX_SOLIDARIO_PRICE = 2000; 

class TripService {
    static async createTrip(data) {
        return await api.createTrip(data);
    }
}

class CreateTripView {
    constructor() {
        this.elements = {};
    }

    render() {
        const container = document.createElement('div');
        container.classList.add('create-trip-container');

        const title = document.createElement('h2');
        title.textContent = 'Crear Viaje';

        const mapDiv = document.createElement('div');
        mapDiv.id = 'map';

        const searchContainer = document.createElement('div');
        searchContainer.id = 'search-container';

        const form = this._createForm();
        
        const backBtn = document.createElement('button');
        backBtn.classList.add('back-btn');
        backBtn.textContent = '← Volver al Dashboard';

        container.append(title, mapDiv, searchContainer, form, backBtn);
        
        this.elements.form = form;
        this.elements.backBtn = backBtn;
        this.elements.mapContainer = mapDiv;
        this.elements.searchContainer = searchContainer;

        return container;
    }

    _createForm() {
        const form = document.createElement('form');
        form.id = 'create-trip-form';

        const fechaInput = document.createElement('input');
        fechaInput.name = 'fecha_salida';
        fechaInput.placeholder = 'Fecha y hora de salida';
        fechaInput.type = 'datetime-local';
        fechaInput.required = true;

        const asientosInput = document.createElement('input');
        asientosInput.name = 'asientos_disponibles';
        asientosInput.placeholder = 'Asientos disponibles';
        asientosInput.type = 'number';
        asientosInput.min = '1';
        asientosInput.required = true;

        const priceGroup = this._createPriceGroup();

        const submit = document.createElement('button');
        submit.type = 'submit';
        submit.textContent = 'Crear Viaje';

        form.append(fechaInput, asientosInput, priceGroup, submit);

        this.elements.fechaInput = fechaInput;
        this.elements.asientosInput = asientosInput;
        this.elements.submitBtn = submit;

        return form;
    }

    _createPriceGroup() {
        const priceGroup = document.createElement('div');
        priceGroup.classList.add('form-group', 'price-group');

        const priceLabel = document.createElement('label');
        priceLabel.setAttribute('for', 'precio');
        priceLabel.textContent = 'Precio por pasajero';

        const priceHelp = document.createElement('small');
        priceHelp.classList.add('price-help');
        priceHelp.textContent = `Sugerencia: Establece un precio menor al boleto del colectivo local (max. $${MAX_SOLIDARIO_PRICE}) para mantener el espíritu colaborativo.`;

        const priceInput = document.createElement('input');
        priceInput.name = 'precio';
        priceInput.id = 'precio';
        priceInput.placeholder = 'Ejemplo: 1500';
        priceInput.type = 'number';
        priceInput.step = '0.01';
        priceInput.min = '0';
        priceInput.required = true;

        const priceAlertContainer = document.createElement('div');
        priceAlertContainer.id = 'price-alert';

        priceGroup.append(priceLabel, priceHelp, priceInput, priceAlertContainer);

        this.elements.priceInput = priceInput;
        this.elements.priceAlertContainer = priceAlertContainer;

        return priceGroup;
    }

    updatePriceAlert(priceValue) {
        while (this.elements.priceAlertContainer.firstChild) {
            this.elements.priceAlertContainer.removeChild(this.elements.priceAlertContainer.firstChild);
        }

        if (priceValue >= MAX_SOLIDARIO_PRICE) {
            const alert = document.createElement('div');
            alert.classList.add('price-alert', 'price-alert-danger');
            const text = document.createElement('span');
            text.textContent = 'El precio podría superar el valor del boleto del colectivo local';
            alert.appendChild(text);
            this.elements.priceAlertContainer.appendChild(alert);
        } else if (priceValue > 0) {
            const alert = document.createElement('div');
            alert.classList.add('price-alert', 'price-alert-success');
            const text = document.createElement('span');
            text.textContent = 'Precio colaborativo - ¡Gracias por compartir!';
            alert.appendChild(text);
            this.elements.priceAlertContainer.appendChild(alert);
        }
    }
}

class LeafletMapManager {
    constructor(shadowRoot) {
        this.shadowRoot = shadowRoot;
        this.map = null;
        this.originMarker = null;
        this.destinationMarker = null;
        this.routeControl = null;
        this.waypoints = [];
        this.elements = {};
    }

    loadScripts() {
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        this.shadowRoot.appendChild(leafletCSS);

        const routingCSS = document.createElement('link');
        routingCSS.rel = 'stylesheet';
        routingCSS.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css';
        this.shadowRoot.appendChild(routingCSS);

        return new Promise((resolve) => {
            const leafletJS = document.createElement('script');
            leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            leafletJS.onload = () => {
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                });

                const routingJS = document.createElement('script');
                routingJS.src = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js';
                routingJS.onload = resolve;
                this.shadowRoot.appendChild(routingJS);
            };
            this.shadowRoot.appendChild(leafletJS);
        });
    }

    initMap(mapContainer) {
        if (!mapContainer) return;
        this.map = L.map(mapContainer).setView([-38.0055, -57.5426], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);
    }

    invalidateSize() {
        if (this.map) {
            this.map.invalidateSize();
        }
    }

    addSearchControl(searchContainer) {
        while (searchContainer.firstChild) {
            searchContainer.removeChild(searchContainer.firstChild);
        }

        const { searchBox: originSearchBox, input: originInput } = this._createSearchBox('origin', 'Buscar origen...');
        const { searchBox: destinationSearchBox, input: destinationInput } = this._createSearchBox('destination', 'Buscar destino...');

        const addWaypointBtn = document.createElement('button');
        addWaypointBtn.id = 'add-waypoint-btn';
        addWaypointBtn.textContent = 'Agregar Parada';

        const waypointsList = document.createElement('div');
        waypointsList.id = 'waypoints-list';

        const calculateRouteBtn = document.createElement('button');
        calculateRouteBtn.id = 'calculate-route-btn';
        calculateRouteBtn.textContent = 'Calcular Ruta';

        searchContainer.append(originSearchBox, destinationSearchBox, addWaypointBtn, waypointsList, calculateRouteBtn);

        this.elements.originInput = originInput;
        this.elements.destinationInput = destinationInput;
        this.elements.waypointsList = waypointsList;
        
        return { addWaypointBtn, calculateRouteBtn };
    }

    _createSearchBox(type, placeholder) {
        const searchBox = document.createElement('div');
        searchBox.classList.add('search-box');

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = placeholder;

        const btn = document.createElement('button');
        btn.id = `search-${type}-btn`;
        btn.textContent = `Buscar ${type === 'origin' ? 'Origen' : 'Destino'}`;
        btn.type = 'button'; 

        btn.addEventListener('click', () => this.searchLocation(type, input.value));

        searchBox.append(input, btn);
        return { searchBox, input };
    }

    async searchLocation(type, query) {
        if (!query) {
            Toast.show('Por favor, ingrese una ubicación para buscar.', 'warning');
            return;
        }

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const results = await response.json();

            if (results.length === 0) {
                Toast.show('No se encontró la ubicación. Intenta con otro término.', 'error');
                return;
            }

            const location = results[0];
            const lat = parseFloat(location.lat);
            const lng = parseFloat(location.lon);
            const iconUrl = type === 'origin' 
                ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
                : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
            
            const marker = L.marker([lat, lng], {
                draggable: true,
                icon: L.icon({
                    iconUrl,
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41]
                })
            }).addTo(this.map).bindPopup(type === 'origin' ? 'Origen' : 'Destino').openPopup();

            marker.on('dragend', () => this.updateRouteFromMarkers());

            if (type === 'origin') {
                if (this.originMarker) this.map.removeLayer(this.originMarker);
                this.originMarker = marker;
                this.map.setView([lat, lng], 13);
            } else {
                if (this.destinationMarker) this.map.removeLayer(this.destinationMarker);
                this.destinationMarker = marker;
            }
        } catch (error) {
            console.error('Error buscando ubicación:', error);
            Toast.show('Error al buscar la ubicación.', 'error');
        }
    }

    addWaypoint() {
       
        this.waypoints = this.waypoints.filter(w => w.marker);
        this.elements.waypointsList.querySelectorAll('.waypoint-item').forEach(item => {
            if (!item.dataset.hasMarker) item.remove();
        });

        const waypointId = `waypoint-${this.waypoints.length}`;
        const waypointDiv = document.createElement('div');
        waypointDiv.classList.add('waypoint-item');

        const input = document.createElement('input');
        input.type = 'text';
        input.id = waypointId;
        input.placeholder = `Parada intermedia ${this.waypoints.length + 1}`;

        const searchBtn = document.createElement('button');
        searchBtn.textContent = 'Buscar';
        searchBtn.type = 'button';

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Eliminar';
        removeBtn.type = 'button';

        waypointDiv.append(input, searchBtn, removeBtn);
        this.elements.waypointsList.appendChild(waypointDiv);

        searchBtn.addEventListener('click', () => this.searchWaypoint(waypointId, input.value));

        removeBtn.addEventListener('click', () => {
    
            waypointDiv.remove();
            const waypointToRemove = this.waypoints.find(w => w.id === waypointId);
            if (waypointToRemove && waypointToRemove.marker) {
                this.map.removeLayer(waypointToRemove.marker);
            }
            this.waypoints = this.waypoints.filter(w => w.id !== waypointId);
        });

        this.waypoints.push({ id: waypointId, lat: null, lng: null, marker: null, address: '' });
    }

    async searchWaypoint(waypointId, query) {
        if (!query) {
            Toast.show('Por favor, ingrese una parada para buscar.', 'warning');
            return;
        }
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const results = await response.json();
            if (results.length === 0) {
                Toast.show('No se encontró la ubicación de la parada.', 'error');
                return;
            }
            const location = results[0];

            const existingWaypointIndex = this.waypoints.findIndex(w => w.id === waypointId);
            if (existingWaypointIndex !== -1 && this.waypoints[existingWaypointIndex].marker) {
                this.map.removeLayer(this.waypoints[existingWaypointIndex].marker);
            }

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

            marker.on('dragend', () => this.updateRouteFromMarkers());

            if (existingWaypointIndex !== -1) {
                this.waypoints[existingWaypointIndex] = { id: waypointId, lat, lng, marker, address: query };
            } else {
                this.waypoints.push({ id: waypointId, lat, lng, marker, address: query });
            }

            const waypointDiv = this.shadowRoot.getElementById(waypointId)?.parentNode;
            if (waypointDiv) waypointDiv.dataset.hasMarker = 'true';
        } catch (error) {
            console.error('Error buscando parada:', error);
            Toast.show('Error al buscar la parada.', 'error');
        }
    }

    calculateRoute() {
        if (!this.originMarker || !this.destinationMarker) {
            Toast.show('Debe seleccionar un origen y un destino para calcular la ruta.', 'warning');
            return;
        }
        if (this.routeControl) {
            this.map.removeControl(this.routeControl);
        }
        const waypointsLatLng = [
            this.originMarker.getLatLng(),
            ...this.waypoints.map(w => L.latLng(w.lat, w.lng)),
            this.destinationMarker.getLatLng()
        ];
        this.routeControl = L.Routing.control({
            waypoints: waypointsLatLng,
            routeWhileDragging: true,
            showAlternatives: true,
            lineOptions: { styles: [{ color: '#4db6ac', weight: 5 }] },
            createMarker: () => null 
        }).addTo(this.map);
        Toast.show('Ruta calculada. Puedes ajustarla arrastrando los marcadores.', 'info');
    }

    updateRouteFromMarkers() {
        if (!this.routeControl || !this.originMarker || !this.destinationMarker) {
            return;
        }

        const waypointsLatLng = [
            this.originMarker.getLatLng(),
            ...this.waypoints
                .filter(w => w.marker) 
                .map(w => w.marker.getLatLng()),
            this.destinationMarker.getLatLng()
        ];
        this.routeControl.setWaypoints(waypointsLatLng);
    }
}

class CreateTripWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.view = new CreateTripView();
        this.mapManager = new LeafletMapManager(this.shadowRoot);
        
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePriceInput = this.handlePriceInput.bind(this);
        this.handleBack = this.handleBack.bind(this);
    }

    async connectedCallback() {
        this.render();
        await this.mapManager.loadScripts();
        this.mapManager.initMap(this.view.elements.mapContainer);
        const { addWaypointBtn, calculateRouteBtn } = this.mapManager.addSearchControl(this.view.elements.searchContainer);
        
        this.addEvents(addWaypointBtn, calculateRouteBtn);

        setTimeout(() => this.mapManager.invalidateSize(), 100);
    }

    disconnectedCallback() {
        this.removeEvents();
        if (this.mapManager.map) {
            this.mapManager.map.remove();
        }
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
            this.mapManager.invalidateSize();
        };

        const componentContent = this.view.render();
        this.shadowRoot.append(styles, componentContent);
    }

    addEvents(addWaypointBtn, calculateRouteBtn) {
        this.view.elements.form.addEventListener('submit', this.handleSubmit);
        this.view.elements.priceInput.addEventListener('input', this.handlePriceInput);
        this.view.elements.backBtn.addEventListener('click', this.handleBack);
        addWaypointBtn.addEventListener('click', () => this.mapManager.addWaypoint());
        calculateRouteBtn.addEventListener('click', () => this.mapManager.calculateRoute());
    }

    removeEvents() {
        this.view.elements.form.removeEventListener('submit', this.handleSubmit);
        this.view.elements.priceInput.removeEventListener('input', this.handlePriceInput);
        this.view.elements.backBtn.removeEventListener('click', this.handleBack);
    }

    handlePriceInput(e) {
        const priceValue = parseFloat(e.target.value) || 0;
        this.view.updatePriceAlert(priceValue);
    }

    handleBack(e) {
        e.preventDefault();
        window.history.pushState({}, '', '/dashboard');
        window.dispatchEvent(new Event('popstate'));
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.mapManager.originMarker || !this.mapManager.destinationMarker) {
            Toast.show('Debes seleccionar un origen y un destino en el mapa.', 'error');
            return;
        }

        const formElements = this.view.elements;
        const precioValue = parseFloat(formElements.priceInput.value);

        if (precioValue >= MAX_SOLIDARIO_PRICE) {
            const confirmacion = confirm(
                `El precio ingresado ($${precioValue}) podría superar el valor del boleto del colectivo local.\n\n` +
                `Recordá que CaminoComún promueve precios colaborativos para el beneficio de todas las partes.\n\n` +
                `¿Deseas continuar con este precio?`
            );
            if (!confirmacion) return;
        }

        const originLatLng = this.mapManager.originMarker.getLatLng();
        const destinationLatLng = this.mapManager.destinationMarker.getLatLng();

        const data = {
            origen: this.mapManager.elements.originInput.value,
            destino: this.mapManager.elements.destinationInput.value,
            origen_lat: originLatLng.lat,
            origen_lng: originLatLng.lng,
            destino_lat: destinationLatLng.lat,
            destino_lng: destinationLatLng.lng,
            waypoints: this.mapManager.waypoints.map(w => ({ lat: w.lat, lng: w.lng, address: w.address })),
            fecha_salida: formElements.fechaInput.value.replace('T', ' '),
            asientos_disponibles: formElements.asientosInput.value,
            precio: precioValue
        };

        const res = await TripService.createTrip(data);
        if (res.success) {
            Toast.show('Viaje creado correctamente.', 'success');
            window.history.pushState({}, '', '/dashboard/my-trips');
            window.dispatchEvent(new Event('popstate'));
        } else {
            Toast.show(res.error || 'Error creando el viaje.', 'error');
        }
    }
}

customElements.define('create-trip-wc', CreateTripWC);
