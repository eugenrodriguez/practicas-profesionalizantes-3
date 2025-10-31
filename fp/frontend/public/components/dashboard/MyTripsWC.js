// frontend/public/components/dashboard/MyTripsWC.js
import './TripDetailsWC.js';
import { api } from '../../services/api.js';

class MyTripsWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.user = null; 
        this.trips = [];
        this.allTrips = [];
    }

    connectedCallback() {
        this.load();
    }

    async load() {
        while (this.shadowRoot.firstChild) {
            this.shadowRoot.removeChild(this.shadowRoot.firstChild);
        }

        this.style.transition = 'opacity 0.3s ease-in-out';
        this.style.opacity = '0';

        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '/components/dashboard/css/my-trips.css';

        const styles2 = document.createElement('link');
        styles2.rel = 'stylesheet';
        styles2.href = '/components/dashboard/css/trip-details.css';

        styles.onload = () => { this.style.opacity = '1'; };

        const mainContainer = document.createElement('div');
        mainContainer.classList.add('my-trips-container');

        const title = document.createElement('h2');
        title.textContent = 'Mis Viajes';
        mainContainer.appendChild(title);

        const profileRes = await api.getProfile();
        if (profileRes.success) {
            this.user = profileRes.user;
        }

        const res = await api.getMyTrips();
        if (!res.success) {
            const err = document.createElement('p');
            err.textContent = res.error || 'Error al cargar viajes';
            err.classList.add('error-message');
            mainContainer.appendChild(err);
            this.shadowRoot.appendChild(styles);
            this.shadowRoot.appendChild(mainContainer);
            return;
        }

        this.allTrips = res.trips || [];
        this.trips = this.allTrips;

        const filterContainer = document.createElement('div');
        filterContainer.classList.add('filter-container');

        const filters = [
            { label: 'Todos', value: 'todos' },
            { label: 'Pendientes', value: 'pendiente' },
            { label: 'Activos', value: 'activo' },
            { label: 'Completados', value: 'completado' },
            { label: 'Cancelados', value: 'cancelado' }
        ];

        filters.forEach(filter => {
            const btn = document.createElement('button');
            btn.textContent = filter.label;
            btn.classList.add('filter-btn');
            if (filter.value === 'todos') btn.classList.add('active');
            
            btn.addEventListener('click', () => {
                const allFilterBtns = this.shadowRoot.querySelectorAll('.filter-btn');
                allFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterTrips(filter.value);
            });
            
            filterContainer.appendChild(btn);
        });

        const list = document.createElement('div');
        list.classList.add('trips-list');
        list.id = 'trips-list';

        if (this.trips.length === 0) {
            const emptyState = this.createEmptyState(
                'No tienes viajes creados',
                'Comienza creando tu primer viaje solidario'
            );
            list.appendChild(emptyState);
        } else {
            this.renderTrips(this.trips, list);
        }

        const backBtn = document.createElement('button');
        backBtn.classList.add('back-btn');
        backBtn.textContent = '← Volver al Dashboard';
        backBtn.addEventListener('click', () => {
            window.history.pushState({}, '', '/dashboard');
            window.dispatchEvent(new Event('popstate'));
        });

        mainContainer.appendChild(filterContainer);
        mainContainer.appendChild(list);
        mainContainer.appendChild(backBtn);
        
        this.shadowRoot.appendChild(styles); 
        this.shadowRoot.appendChild(mainContainer);
    }

    createEmptyState(titleText, messageText) {
        const emptyState = document.createElement('div');
        emptyState.classList.add('empty-state');

        const emptyTitle = document.createElement('h3');
        emptyTitle.textContent = titleText;

        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = messageText;

        emptyState.appendChild(emptyTitle);
        emptyState.appendChild(emptyMessage);

        return emptyState;
    }

    renderTrips(trips, container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        if (trips.length === 0) {
            const emptyState = this.createEmptyState(
                'No hay viajes',
                'No hay viajes con este filtro'
            );
            container.appendChild(emptyState);
            return;
        }

        trips.forEach(trip => {
            const card = this.createTripCard(trip);
            container.appendChild(card);
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

        const meta = document.createElement('div');
        meta.classList.add('trip-meta');

        let fechaStr = 'Sin programar';
        if (trip.fecha_salida) {
            const fecha = new Date(trip.fecha_salida);
            fechaStr = fecha.toLocaleString('es-AR');
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
        precioPart.textContent = ` • $${trip.precio}`;

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

        const btns = document.createElement('div');
        btns.classList.add('trip-actions');

        switch (estadoActual) {
            case 'pendiente':
                const publishBtn = this.createButton('Publicar Viaje', 'publish-btn', async () => {
                    if (!confirm('¿Seguro que quieres publicar este viaje?')) return;
                    const res = await api.updateTripStatus(trip.id, 'activo');
                    if (res.success) {
                        alert('¡Viaje publicado! Ahora los pasajeros pueden solicitar asientos.');
                        this.load();
                    } else {
                        alert(res.error || 'No se pudo publicar el viaje');
                    }
                });
                btns.appendChild(publishBtn);

                const deleteBtn = this.createButton('Eliminar', 'delete-btn', async () => {
                    if (!confirm('¿Seguro que quieres eliminar este viaje? Esta acción no se puede deshacer.')) return;
                    const res = await api.deleteTrip(trip.id);
                    if (res.success) {
                        alert('Viaje eliminado.');
                        this.load();
                    } else {
                        alert(res.error || 'No se pudo eliminar el viaje.');
                    }
                });
                btns.appendChild(deleteBtn);
                break;

            case 'activo':
            case 'en_curso':
                const liveBtn = this.createButton('Ver', 'live-btn', () => {
                    window.history.pushState({}, '', `/dashboard/live-trip?id=${trip.id}`);
                    window.dispatchEvent(new Event('popstate'));
                });
                btns.appendChild(liveBtn);

                const cancelBtn = this.createButton('Cancelar Viaje', 'cancel-btn', async () => {
                    if (!confirm('¿Seguro que quieres cancelar este viaje? Se notificará a los pasajeros.')) return;
                    const res = await api.cancelTrip(trip.id);
                    if (res.success) {
                        alert('Viaje cancelado.');
                        this.load();
                    } else {
                        alert(res.error || 'No se pudo cancelar el viaje.');
                    }
                });
                btns.appendChild(cancelBtn);
                break;

        }

        if (estadoActual !== 'completado') {
            const requestsBtn = this.createButton('Ver Solicitudes', 'requests-btn', () => {
                window.history.pushState({}, '', `/dashboard/requests?trip=${trip.id}`);
                window.dispatchEvent(new Event('popstate'));
            });
            btns.appendChild(requestsBtn);
        }

        card.appendChild(tripTitle);
        card.appendChild(meta);
        card.appendChild(btns);

        return card;
    }

    createCompletedTripCard(trip) {
        const card = document.createElement('div');
        card.classList.add('trip-card', 'status-completado');

        const tripTitle = document.createElement('div');
        tripTitle.classList.add('trip-title');
        tripTitle.textContent = `${trip.origen} → ${trip.destino}`;

        const meta = document.createElement('div');
        meta.classList.add('trip-meta');
        const fecha = new Date(trip.fecha_salida);
        const metaSpan = document.createElement('span');
        metaSpan.textContent = 'Completado el: ';
        const metaStrong = document.createElement('strong');
        metaStrong.textContent = fecha.toLocaleDateString('es-AR');
        metaSpan.appendChild(metaStrong);
        meta.appendChild(metaSpan);

        const actions = document.createElement('div');
        actions.classList.add('trip-actions');

        const detailsBtn = this.createButton('Ver Detalles', 'details-btn', () => {
            this.showTripDetailsModal(trip);
        });
        actions.appendChild(detailsBtn);

        card.append(tripTitle, meta, actions);
        return card;
    }

    showTripDetailsModal(trip) {
        const tripDetailsElement = document.createElement('trip-details-wc');
        
        tripDetailsElement.trip = trip;
        tripDetailsElement.user = this.user;

        document.body.appendChild(tripDetailsElement);
    }

    createButton(text, className, onClick) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.classList.add(className);
        btn.addEventListener('click', onClick);
        return btn;
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

    filterTrips(filterValue) {
        const list = this.shadowRoot.getElementById('trips-list');
        
        if (filterValue === 'todos') {
            this.renderTrips(this.allTrips, list);
        } else {
            const filtered = this.allTrips.filter(t => (t.estado || 'pendiente') === filterValue);
            this.renderTrips(filtered, list);
        }
    }
}

customElements.define('my-trips-wc', MyTripsWC);