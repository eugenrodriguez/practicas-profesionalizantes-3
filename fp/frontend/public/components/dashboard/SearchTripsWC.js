// frontend/public/components/dashboard/SearchTripsWC.js
import { api } from '../../services/api.js';

class SearchTripsWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.trips = [];
        this.handleSearch = this.handleSearch.bind(this);
        this.handleRequestSeat = this.handleRequestSeat.bind(this);
    }

    connectedCallback() {
        this.loadAvailableTrips();
    }

    async loadAvailableTrips() {
        const res = await api.getAvailableTrips();
        if (res.success) {
            this.trips = res.trips || [];
        }
        this.render();
        this.addEvents();
    }

    render() {
        this.shadowRoot.innerHTML = '';

        this.style.transition = 'opacity 0.3s ease-in-out';
        this.style.opacity = '0';

        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '/components/dashboard/css/search-trips.css';

        styles.onload = () => {
            this.style.opacity = '1';
        };

        const container = document.createElement('div');
        container.classList.add('search-trips-container');

        const title = document.createElement('h2');
        title.textContent = 'Buscar Viajes';

        const searchForm = document.createElement('form');
        searchForm.id = 'search-form';
        searchForm.classList.add('search-form');
        // ... (código del formulario se mantiene igual) ...
        const origenInput = document.createElement('input');
        origenInput.type = 'text';
        origenInput.name = 'origen';
        origenInput.placeholder = 'Origen (ej: Mar del Plata)';
        const destinoInput = document.createElement('input');
        destinoInput.type = 'text';
        destinoInput.name = 'destino';
        destinoInput.placeholder = 'Destino (ej: Buenos Aires)';
        const fechaInput = document.createElement('input');
        fechaInput.type = 'date';
        fechaInput.name = 'fecha';
        fechaInput.placeholder = 'Fecha';
        const searchBtn = document.createElement('button');
        searchBtn.type = 'submit';
        searchBtn.textContent = 'Buscar';
        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.textContent = 'Ver Todos';
        clearBtn.classList.add('clear-btn');
        clearBtn.addEventListener('click', () => {
            searchForm.reset();
            this.loadAvailableTrips();
        });
        searchForm.append(origenInput, destinoInput, fechaInput, searchBtn, clearBtn);


        const tripsList = document.createElement('div');
        tripsList.classList.add('trips-list');
        tripsList.id = 'trips-list';

        if (this.trips.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.classList.add('empty-state');
            
            // --- CAMBIO: Se usan createElement en lugar de innerHTML ---
            const emptyTitle = document.createElement('h3');
            emptyTitle.textContent = 'No hay viajes disponibles';
            const emptyText = document.createElement('p');
            emptyText.textContent = 'Intenta buscar con otros filtros o vuelve más tarde';
            emptyState.append(emptyTitle, emptyText);

            tripsList.appendChild(emptyState);
        } else {
            this.trips.forEach(trip => {
                const card = this.createTripCard(trip);
                tripsList.appendChild(card);
            });
        }

        const backBtn = document.createElement('button');
        backBtn.classList.add('back-btn');
        backBtn.textContent = '← Volver al Dashboard';
        backBtn.addEventListener('click', () => {
            window.history.pushState({}, '', '/dashboard');
            window.dispatchEvent(new Event('popstate'));
        });

        container.append(title, searchForm, tripsList, backBtn);
        this.shadowRoot.append(styles, container);
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
        price.textContent = `$${parseFloat(trip.precio).toFixed(2)}`;

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

        actions.appendChild(requestBtn);

        card.append(header, details, actions);
        return card;
    }

    addEvents() {
        const form = this.shadowRoot.getElementById('search-form');
        if (form) {
            form.addEventListener('submit', this.handleSearch);
        }

        const requestBtns = this.shadowRoot.querySelectorAll('.request-btn');
        requestBtns.forEach(btn => {
            btn.addEventListener('click', this.handleRequestSeat);
        });
    }

    async handleSearch(e) {
        e.preventDefault();

        const form = e.currentTarget;
        const filters = {
            origen: form.origen.value.trim(),
            destino: form.destino.value.trim(),
            fecha: form.fecha.value
        };

        const res = await api.searchTrips(filters);
        if (res.success) {
            this.trips = res.trips || [];
            this.render();
            this.addEvents();
        } else {
            alert(res.error || 'Error al buscar viajes');
        }
    }

    async handleRequestSeat(e) {
        const tripId = e.target.dataset.tripId;
        const trip = this.trips.find(t => t.id == tripId);
        
        const seatsInput = prompt(`¿Cuántos asientos deseas solicitar para este viaje? (Máximo disponible: ${trip.asientos_disponibles})`, "1");

        if (seatsInput === null) { 
            return;
        }

        const seatsToBook = Number(seatsInput);

        if (isNaN(seatsToBook) || seatsToBook <= 0) {
            alert('Por favor, ingresa un número válido de asientos.');
            return;
        }
        if (seatsToBook > trip.asientos_disponibles) {
            alert(`No puedes solicitar más de ${trip.asientos_disponibles} asientos disponibles.`);
            return;
        }

        e.target.disabled = true;
        e.target.textContent = 'Solicitando...';

        const res = await api.requestSeat(tripId, seatsToBook);

        if (res.success) {
            alert('Solicitud enviada correctamente. El conductor la revisará pronto.');
            this.loadAvailableTrips();
        } else {
            alert(res.error || 'Error al solicitar asiento');
            e.target.disabled = false;
            e.target.textContent = 'Solicitar Asiento';
        }
    }
}

customElements.define('search-trips-wc', SearchTripsWC);