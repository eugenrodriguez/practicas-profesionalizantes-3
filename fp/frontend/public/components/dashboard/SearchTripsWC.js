import { api } from '../../services/api.js';

class SearchTripsService {
    getAvailableTrips() {
        return api.getAvailableTrips();
    }

    searchTrips(filters) {
        return api.searchTrips(filters);
    }

    requestSeat(tripId, seatsToBook) {
        return api.requestSeat(tripId, seatsToBook);
    }
}

class SearchTripsView {
    constructor(host) {
        this.host = host;
        this.shadowRoot = host.shadowRoot;
        this.tripsListContainer = null;
        this.searchForm = null;
        this.origenInput = null;
        this.destinoInput = null;
        this.fechaInput = null;
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

    render(trips) {
        this.clearContainer(this.shadowRoot);

        this.host.style.transition = 'opacity 0.3s ease-in-out';
        this.host.style.opacity = '0';

        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '/components/dashboard/css/search-trips.css';
        styles.onload = () => { this.host.style.opacity = '1'; };
        this.shadowRoot.appendChild(styles);

        const container = document.createElement('div');
        container.classList.add('search-trips-container');

        const title = document.createElement('h2');
        title.textContent = 'Buscar Viajes';

        this.searchForm = this.createSearchForm();
        container.appendChild(title);
        container.appendChild(this.searchForm);

        this.tripsListContainer = document.createElement('div');
        this.tripsListContainer.classList.add('trips-list');
        this.tripsListContainer.id = 'trips-list';
        container.appendChild(this.tripsListContainer);

        this.renderTrips(trips);

        const backBtn = document.createElement('button');
        backBtn.classList.add('back-btn');
        backBtn.textContent = '← Volver al Dashboard';
        backBtn.addEventListener('click', () => this.dispatchEvent('back-to-dashboard'));
        container.appendChild(backBtn);

        this.shadowRoot.appendChild(container);
    }

    createSearchForm() {
        const form = document.createElement('form');
        form.id = 'search-form';
        form.classList.add('search-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const filters = {
                origen: this.origenInput.value.trim(),
                destino: this.destinoInput.value.trim(),
                fecha: this.fechaInput.value
            };
            this.dispatchEvent('search-submit', { filters });
        });

        this.origenInput = document.createElement('input');
        this.origenInput.type = 'text';
        this.origenInput.name = 'origen';
        this.origenInput.placeholder = 'Origen (ej: Mar del Plata)';
        
        this.destinoInput = document.createElement('input');
        this.destinoInput.type = 'text';
        this.destinoInput.name = 'destino';
        this.destinoInput.placeholder = 'Destino (ej: Buenos Aires)';
        
        this.fechaInput = document.createElement('input');
        this.fechaInput.type = 'date';
        this.fechaInput.name = 'fecha';
        this.fechaInput.placeholder = 'Fecha';
        
        const searchBtn = document.createElement('button');
        searchBtn.type = 'submit';
        searchBtn.textContent = 'Buscar';
        
        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.textContent = 'Ver Todos';
        clearBtn.classList.add('clear-btn');
        clearBtn.addEventListener('click', () => {
            form.reset();
            this.dispatchEvent('clear-search');
        });
        
        form.append(this.origenInput, this.destinoInput, this.fechaInput, searchBtn, clearBtn);
        return form;
    }

    renderTrips(trips) {
        this.clearContainer(this.tripsListContainer);

        if (trips.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.classList.add('empty-state');
            const emptyTitle = document.createElement('h3');
            emptyTitle.textContent = 'No hay viajes disponibles';
            const emptyText = document.createElement('p');
            emptyText.textContent = 'Intenta buscar con otros filtros o vuelve más tarde';
            emptyState.append(emptyTitle, emptyText);
            this.tripsListContainer.appendChild(emptyState);
        } else {
            trips.forEach(trip => {
                const card = this.createTripCard(trip);
                this.tripsListContainer.appendChild(card);
            });
        }
    }

    createTripCard(trip) {
        const card = document.createElement('div');
        card.classList.add('trip-card');

        const header = document.createElement('div');
        header.classList.add('trip-header');

        const route = document.createElement('h3');
        route.classList.add('trip-route');
        route.textContent = `${trip.origen} → ${trip.destino}`;

        const price = document.createElement('div');
        price.classList.add('trip-price');
        price.textContent = `${parseFloat(trip.precio).toFixed(2)}`;

        header.append(route, price);

        const details = document.createElement('div');
        details.classList.add('trip-details');

        const fecha = new Date(trip.fecha_salida);
        const fechaStr = fecha.toLocaleString('es-AR', {
            weekday: 'short', day: '2-digit', month: 'short',
            hour: '2-digit', minute: '2-digit'
        });

        const createDetailLine = (label, value) => {
            const p = document.createElement('p');
            const strong = document.createElement('strong');
            strong.textContent = `${label}: `;
            p.append(strong, value);
            return p;
        };
        
        details.append(
            createDetailLine('Salida', fechaStr),
            createDetailLine('Conductor', trip.conductor_name),
            createDetailLine('Vehículo', trip.vehiculo || 'No especificado'),
            createDetailLine('Patente', trip.patente || 'No especificado'),
            createDetailLine('Asientos disponibles', trip.asientos_disponibles)
        );

        const actions = document.createElement('div');
        actions.classList.add('trip-actions');

        const requestBtn = document.createElement('button');
        requestBtn.textContent = 'Solicitar Asiento';
        requestBtn.classList.add('request-btn');
        requestBtn.dataset.tripId = trip.id;
        requestBtn.addEventListener('click', () => {
            this.dispatchEvent('request-seat-prompt', { trip });
        });

        actions.appendChild(requestBtn);

        card.append(header, details, actions);
        return card;
    }

    showRequestSeatPrompt(trip) {
        const seatsInput = prompt(`¿Cuántos asientos deseas solicitar para este viaje? (Máximo disponible: ${trip.asientos_disponibles})`, "1");
        if (seatsInput !== null) {
            const seatsToBook = Number(seatsInput);
            this.dispatchEvent('request-seat', { tripId: trip.id, seatsToBook, trip });
        }
    }

    showAlert(message) {
        alert(message); 
    }
}

class SearchTripsWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.service = new SearchTripsService();
        this.view = new SearchTripsView(this);
        this.trips = [];
    }

    connectedCallback() {
        this.loadAvailableTrips();
        this.addEventListeners();
    }

    disconnectedCallback() {
        this.removeEventListeners();
    }

    addEventListeners() {
        this.addEventListener('search-submit', this.handleSearchSubmit);
        this.addEventListener('clear-search', this.handleClearSearch);
        this.addEventListener('request-seat-prompt', this.handleRequestSeatPrompt);
        this.addEventListener('request-seat', this.handleRequestSeat);
        this.addEventListener('back-to-dashboard', this.handleBackToDashboard);
    }

    removeEventListeners() {
        this.removeEventListener('search-submit', this.handleSearchSubmit);
        this.removeEventListener('clear-search', this.handleClearSearch);
        this.removeEventListener('request-seat-prompt', this.handleRequestSeatPrompt);
        this.removeEventListener('request-seat', this.handleRequestSeat);
        this.removeEventListener('back-to-dashboard', this.handleBackToDashboard);
    }

    async loadAvailableTrips() {
        const res = await this.service.getAvailableTrips();
        if (res.success) {
            this.trips = res.trips || [];
        } else {
            this.view.showAlert(res.error || 'Error al cargar viajes disponibles.');
        }
        this.view.render(this.trips);
    }

    handleSearchSubmit = async (e) => {
        const { filters } = e.detail;
        const res = await this.service.searchTrips(filters);
        if (res.success) {
            this.trips = res.trips || [];
        } else {
            this.view.showAlert(res.error || 'Error al buscar viajes.');
        }
        this.view.render(this.trips);
    }

    handleClearSearch = () => {
        this.loadAvailableTrips();
    }

    handleRequestSeatPrompt = (e) => {
        const { trip } = e.detail;
        this.view.showRequestSeatPrompt(trip);
    }

    handleRequestSeat = async (e) => {
        const { tripId, seatsToBook, trip } = e.detail;

        if (isNaN(seatsToBook) || seatsToBook <= 0) {
            this.view.showAlert('Por favor, ingresa un número válido de asientos.');
            return;
        }
        if (seatsToBook > trip.asientos_disponibles) {
            this.view.showAlert(`No puedes solicitar más de ${trip.asientos_disponibles} asientos disponibles.`);
            return;
        }

        const res = await this.service.requestSeat(tripId, seatsToBook);

        if (res.success) {
            this.view.showAlert('Solicitud enviada correctamente. El conductor la revisará pronto.');
            this.loadAvailableTrips(); 
        } else {
            this.view.showAlert(res.error || 'Error al solicitar asiento');
        }
    }

    handleBackToDashboard = () => {
        window.history.pushState({}, '', '/dashboard');
        window.dispatchEvent(new Event('popstate'));
    }
}

customElements.define('search-trips-wc', SearchTripsWC);