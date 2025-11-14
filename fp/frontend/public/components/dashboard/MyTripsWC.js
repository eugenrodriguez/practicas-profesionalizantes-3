import './TripDetailsWC.js';
import { api } from '../../services/api.js';
import { Toast } from '../../utils/Toast.js';

class TripService {
    getProfile() {
        return api.getProfile();
    }

    getMyTrips() {
        return api.getMyTrips();
    }

    updateTripStatus(tripId, status) {
        return api.updateTripStatus(tripId, status);
    }

    deleteTrip(tripId) {
        return api.deleteTrip(tripId);
    }

    cancelTrip(tripId) {
        return api.cancelTrip(tripId);
    }

    getTripById(tripId) {
        return api.getTripById(tripId);
    }
}

class MyTripsView {
    constructor(host) {
        this.host = host; 
        this.shadowRoot = host.shadowRoot;
        this.listContainer = null;
        this.filterButtons = [];
    }

    dispatchEvent(eventName, detail) {
        this.host.dispatchEvent(new CustomEvent(eventName, {
            bubbles: true,
            composed: true,
            detail
        }));
    }

    clearContainer(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    capitalizeEstado(estado) {
        const estadosMap = {
            'pendiente': 'Pendiente',
            'activo': 'Activo',
            'completado': 'Completado',
            'cancelado': 'Cancelado'
        };
        return estadosMap[estado] || estado.charAt(0).toUpperCase() + estado.slice(1);
    }

    createButton(text, className, onClick) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.classList.add(className);
        btn.addEventListener('click', onClick);
        return btn;
    }

    createInitialLayout() {
        this.clearContainer(this.shadowRoot);

        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '/components/dashboard/css/my-trips.css';

        const mainContainer = document.createElement('div');
        mainContainer.classList.add('my-trips-container');

        const title = document.createElement('h2');
        title.textContent = 'Mis Viajes';
        mainContainer.appendChild(title);

        const filterContainer = this.createFilterButtons();
        mainContainer.appendChild(filterContainer);

        this.listContainer = document.createElement('div');
        this.listContainer.classList.add('trips-list');
        this.listContainer.id = 'trips-list';
        mainContainer.appendChild(this.listContainer);

        const backBtn = this.createButton('← Volver al Dashboard', 'back-btn', () => this.dispatchEvent('back-to-dashboard'));
        mainContainer.appendChild(backBtn);

        this.shadowRoot.appendChild(styles);
        this.shadowRoot.appendChild(mainContainer);
    }

    createFilterButtons() {
        const filterContainer = document.createElement('div');
        filterContainer.classList.add('filter-container');
        this.filterButtons = []; 

        const filters = [
            { label: 'Todos', value: 'todos' },
            { label: 'Pendientes', value: 'pendiente' },
            { label: 'Activos', value: 'activo' },
            { label: 'Completados', value: 'completado' },
            { label: 'Cancelados', value: 'cancelado' }
        ];

        filters.forEach(filter => {
            const btn = this.createButton(filter.label, 'filter-btn', (e) => {
                this.dispatchEvent('filter-trips', { filterValue: filter.value });
                this.filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
            if (filter.value === 'todos') btn.classList.add('active');
            
            this.filterButtons.push(btn);
            filterContainer.appendChild(btn);
        });

        return filterContainer;
    }

    renderTrips(trips) {
        this.clearContainer(this.listContainer);

        if (trips.length === 0) {
            this.listContainer.appendChild(this.createEmptyState('No hay viajes', 'No hay viajes con este filtro'));
            return;
        }

        trips.forEach(trip => {
            const card = this.createTripCard(trip);
            this.listContainer.appendChild(card);
        });
    }

    createTripCard(trip) {
        const estadoActual = trip.estado || 'pendiente';
        if (estadoActual === 'completado') {
            return this.createCompletedTripCard(trip);
        }

        const card = document.createElement('div');
        card.classList.add('trip-card', `status-${estadoActual}`);

        const tripTitle = document.createElement('div');
        tripTitle.classList.add('trip-title');
        tripTitle.textContent = `${trip.origen} → ${trip.destino}`;

        const meta = this.createTripMeta(trip, estadoActual);
        const btns = this.createTripActions(trip, estadoActual);

        card.appendChild(tripTitle);
        card.appendChild(meta);
        card.appendChild(btns);

        return card;
    }

    createTripMeta(trip, estadoActual) {
        const meta = document.createElement('div');
        meta.classList.add('trip-meta');

        let fechaStr = 'Sin programar';
        if (trip.fecha_salida) {
            fechaStr = new Date(trip.fecha_salida).toLocaleString('es-AR');
        }

        const fechaPart = document.createElement('span');
        const fechaLabel = document.createElement('strong');
        fechaLabel.textContent = 'Salida: ';
        fechaPart.appendChild(fechaLabel);
        fechaPart.appendChild(document.createTextNode(fechaStr));

        const asientosPart = document.createElement('span');
        const asientosLabel = document.createElement('strong');
        asientosLabel.textContent = ' • Asientos: ';
        asientosPart.appendChild(asientosLabel);
        asientosPart.appendChild(document.createTextNode(trip.asientos_disponibles.toString()));

        const precioPart = document.createElement('span');
        precioPart.textContent = ` • ${trip.precio}`;

        const estadoPart = document.createElement('span');
        const estadoLabel = document.createElement('strong');
        estadoLabel.textContent = ' • Estado: ';
        const estadoText = document.createElement('strong');
        estadoText.classList.add('status-text');
        estadoText.textContent = this.capitalizeEstado(estadoActual);
        estadoPart.appendChild(estadoLabel);
        estadoPart.appendChild(estadoText);

        meta.appendChild(fechaPart);
        meta.appendChild(asientosPart);
        meta.appendChild(precioPart);
        meta.appendChild(estadoPart);

        if (trip.solicitudes_pendientes && trip.solicitudes_pendientes > 0) {
            const pendingBadge = document.createElement('span');
            pendingBadge.classList.add('pending-badge');
            pendingBadge.textContent = `${trip.solicitudes_pendientes} solicitud(es) pendiente(s)`;
            meta.appendChild(document.createElement('br'));
            meta.appendChild(pendingBadge);
        }
        return meta;
    }

    createTripActions(trip, estadoActual) {
        const btns = document.createElement('div');
        btns.classList.add('trip-actions');

        switch (estadoActual) {
            case 'pendiente':
                btns.appendChild(this.createButton('Publicar Viaje', 'publish-btn', () => this.dispatchEvent('publish-trip', { tripId: trip.id })));
                btns.appendChild(this.createButton('Eliminar', 'delete-btn', () => this.dispatchEvent('delete-trip', { tripId: trip.id })));
                break;
            case 'activo':
            case 'en_curso':
                btns.appendChild(this.createButton('Ver', 'live-btn', () => this.dispatchEvent('go-to-live', { tripId: trip.id })));
                btns.appendChild(this.createButton('Cancelar Viaje', 'cancel-btn', () => this.dispatchEvent('cancel-trip', { tripId: trip.id })));
                break;
        }

        if (estadoActual !== 'completado') {
            btns.appendChild(this.createButton('Ver Solicitudes', 'requests-btn', () => this.dispatchEvent('go-to-requests', { tripId: trip.id })));
        }
        return btns;
    }

    createCompletedTripCard(trip) {
        const card = document.createElement('div');
        card.classList.add('trip-card', 'status-completado');

        const tripTitle = document.createElement('div');
        tripTitle.classList.add('trip-title');
        tripTitle.textContent = `${trip.origen} → ${trip.destino}`;

        const meta = document.createElement('div');
        meta.classList.add('trip-meta');
        const metaSpan = document.createElement('span');
        metaSpan.textContent = 'Completado el: ';
        const metaStrong = document.createElement('strong');
        metaStrong.textContent = new Date(trip.fecha_salida).toLocaleDateString('es-AR');
        metaSpan.appendChild(metaStrong);
        meta.appendChild(metaSpan);

        const actions = document.createElement('div');
        actions.classList.add('trip-actions');
        actions.appendChild(this.createButton('Ver Detalles', 'details-btn', () => this.dispatchEvent('show-details', { trip })));
        
        card.append(tripTitle, meta, actions);
        return card;
    }

    createEmptyState(titleText, messageText) {
        const emptyState = document.createElement('div');
        emptyState.classList.add('empty-state');

        const title = document.createElement('h3');
        title.textContent = titleText;

        const message = document.createElement('p');
        message.textContent = messageText;

        emptyState.appendChild(title);
        emptyState.appendChild(message);
        return emptyState;
    }

    displayError(message) {
        this.clearContainer(this.listContainer);
        const err = document.createElement('p');
        err.textContent = message;
        err.classList.add('error-message');
        this.listContainer.appendChild(err);
    }

    showTripDetailsModal(trip, user) {
        const tripDetailsElement = document.createElement('trip-details-wc');
        tripDetailsElement.trip = trip;
        tripDetailsElement.user = user;
        document.body.appendChild(tripDetailsElement);
    }
}


class MyTripsWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.tripService = new TripService();
        this.view = new MyTripsView(this); 

        this.state = {
            user: null,
            allTrips: [],
            filteredTrips: []
        };
    }

    connectedCallback() {
        this.load();
        this.addEventListeners();
    }

    disconnectedCallback() {
        this.removeEventListeners();
    }

    addEventListeners() {
        this.addEventListener('filter-trips', this.handleFilterTrips);
        this.addEventListener('back-to-dashboard', this.handleBackToDashboard);
        this.addEventListener('publish-trip', this.handlePublishTrip);
        this.addEventListener('delete-trip', this.handleDeleteTrip);
        this.addEventListener('cancel-trip', this.handleCancelTrip);
        this.addEventListener('go-to-live', this.handleGoToLive);
        this.addEventListener('go-to-requests', this.handleGoToRequests);
        this.addEventListener('show-details', this.handleShowDetails);
    }

    removeEventListeners() {
        this.removeEventListener('filter-trips', this.handleFilterTrips);
        this.removeEventListener('back-to-dashboard', this.handleBackToDashboard);
        this.removeEventListener('publish-trip', this.handlePublishTrip);
        this.removeEventListener('delete-trip', this.handleDeleteTrip);
        this.removeEventListener('cancel-trip', this.handleCancelTrip);
        this.removeEventListener('go-to-live', this.handleGoToLive);
        this.removeEventListener('go-to-requests', this.handleGoToRequests);
        this.removeEventListener('show-details', this.handleShowDetails);
    }
    
    handleFilterTrips = (e) => this.filterTrips(e.detail.filterValue);
    handleBackToDashboard = () => this.navigateTo('/dashboard');
    handlePublishTrip = (e) => this.publishTrip(e.detail.tripId);
    handleDeleteTrip = (e) => this.deleteTrip(e.detail.tripId);
    handleCancelTrip = (e) => this.cancelTrip(e.detail.tripId);
    handleGoToLive = (e) => this.navigateTo(`/dashboard/live-trip?id=${e.detail.tripId}`);
    handleGoToRequests = (e) => this.navigateTo(`/dashboard/requests?trip=${e.detail.tripId}`);
    handleShowDetails = (e) => this.showTripDetails(e.detail.trip);


    async load() {
        this.style.transition = 'opacity 0.3s ease-in-out';
        this.style.opacity = '0';

        this.view.createInitialLayout();

        try {
            const profileRes = await this.tripService.getProfile();
            if (profileRes.success) {
                this.state.user = profileRes.user;
            }

            const tripsRes = await this.tripService.getMyTrips();
            if (tripsRes.success) {
                this.state.allTrips = tripsRes.trips || [];
                this.filterTrips('todos');
            } else {
                this.view.displayError(tripsRes.error || 'Error al cargar viajes');
            }
        } catch (error) {
            this.view.displayError('Ocurrió un error inesperado.');
        } finally {
            this.style.opacity = '1';
        }
    }

    filterTrips(filterValue) {
        if (filterValue === 'todos') {
            this.state.filteredTrips = this.state.allTrips;
        } else {
            this.state.filteredTrips = this.state.allTrips.filter(t => (t.estado || 'pendiente') === filterValue);
        }
        this.view.renderTrips(this.state.filteredTrips);
    }

    async publishTrip(tripId) {
        if (!confirm('¿Seguro que quieres publicar este viaje?')) return;
        const res = await this.tripService.updateTripStatus(tripId, 'activo');
        if (res.success) {
            Toast.show('¡Viaje publicado! Ahora los pasajeros pueden solicitar asientos.', 'success');
            this.load();
        } else {
            Toast.show(res.error || 'No se pudo publicar el viaje', 'error');
        }
    }

    async deleteTrip(tripId) {
        if (!confirm('¿Seguro que quieres eliminar este viaje? Esta acción no se puede deshacer.')) return;
        const res = await this.tripService.deleteTrip(tripId);
        if (res.success) {
            Toast.show('Viaje eliminado correctamente.', 'success');
            this.load();
        } else {
            Toast.show(res.error || 'No se pudo eliminar el viaje.', 'error');
        }
    }

    async cancelTrip(tripId) {
        if (!confirm('¿Seguro que quieres cancelar este viaje? Se notificará a los pasajeros.')) return;
        const res = await this.tripService.cancelTrip(tripId);
        if (res.success) {
            Toast.show('Viaje cancelado. Se ha notificado a los pasajeros.', 'info');
            this.load();
        } else {
            Toast.show(res.error || 'No se pudo cancelar el viaje.', 'error');
        }
    }

    async showTripDetails(trip) {
        const res = await this.tripService.getTripById(trip.id);
        if (!res.success) {
            Toast.show('No se pudieron cargar los detalles completos del viaje.', 'error');
            return;
        }
        this.view.showTripDetailsModal(res.trip, this.state.user);
    }

    navigateTo(path) {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new Event('popstate'));
    }
}

customElements.define('my-trips-wc', MyTripsWC);