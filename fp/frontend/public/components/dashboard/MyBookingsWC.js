// frontend/public/components/dashboard/MyBookingsWC.js
import { api } from '../../services/api.js';

class MyBookingsWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.requests = [];
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
        styles.href = '/components/dashboard/css/my-bookings.css';

        styles.onload = () => {
            this.style.opacity = '1';
        };

        const container = document.createElement('div');
        container.classList.add('bookings-container');

        const title = document.createElement('h2');
        title.textContent = 'Mis Reservas';

        const res = await api.getMyRequests();
        if (!res.success) {
            const error = document.createElement('p');
            error.textContent = res.error || 'Error al cargar reservas';
            error.classList.add('error-message');
            container.appendChild(title);
            container.appendChild(error);
            this.shadowRoot.appendChild(styles);
            this.shadowRoot.appendChild(container);
            return;
        }

        this.requests = res.requests || [];

        const filterContainer = document.createElement('div');
        filterContainer.classList.add('filter-container');

        const filters = ['Todas', 'Pendientes', 'Aceptadas', 'Rechazadas', 'Completados'];
        filters.forEach(filter => {
            const btn = document.createElement('button');
            btn.textContent = filter;
            btn.classList.add('filter-btn');
            if (filter === 'Todas') btn.classList.add('active');
            
            btn.addEventListener('click', () => {
                const allFilterBtns = this.shadowRoot.querySelectorAll('.filter-btn');
                allFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterRequests(filter.toLowerCase());
            });
            
            filterContainer.appendChild(btn);
        });

        const list = document.createElement('div');
        list.classList.add('bookings-list');
        list.id = 'bookings-list';

        if (this.requests.length === 0) {
            const emptyState = this.createEmptyState(
                '📭 No tienes reservas',
                'Busca viajes disponibles y solicita asientos'
            );
            list.appendChild(emptyState);
        } else {
            this.renderRequests(this.requests, list);
        }

        const backBtn = document.createElement('button');
        backBtn.classList.add('back-btn');
        backBtn.textContent = '← Volver al Dashboard';
        backBtn.addEventListener('click', () => {
            window.history.pushState({}, '', '/dashboard');
            window.dispatchEvent(new Event('popstate'));
        });

        container.appendChild(title);
        container.appendChild(filterContainer);
        container.appendChild(list);
        container.appendChild(backBtn);
        
        this.shadowRoot.appendChild(styles);
        this.shadowRoot.appendChild(container);
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

    renderRequests(requests, container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        if (requests.length === 0) {
            const emptyState = this.createEmptyState(
                'No hay reservas',
                'No hay reservas con este filtro'
            );
            container.appendChild(emptyState);
            return;
        }

        requests.forEach(req => {
            const card = this.createBookingCard(req);
            container.appendChild(card);
        });
    }

    createBookingCard(req) {
        const card = document.createElement('div');
        card.classList.add('booking-card');
        card.classList.add(`status-${req.estado}`);

        const header = document.createElement('div');
        header.classList.add('booking-header');

        const route = document.createElement('h3');
        route.textContent = `${req.origen} → ${req.destino}`;

        const status = document.createElement('span');
        status.classList.add('status-badge', `status-${req.estado}`);
        status.textContent = this.getStatusText(req.estado);

        header.appendChild(route);
        header.appendChild(status);

        const details = document.createElement('div');
        details.classList.add('booking-details');

        const conductorP = document.createElement('p');
        const conductorStrong = document.createElement('strong');
        conductorStrong.textContent = 'Conductor: ';
        conductorP.appendChild(conductorStrong);
        conductorP.appendChild(document.createTextNode(req.conductor_name));

        const fechaP = document.createElement('p');
        const fechaStrong = document.createElement('strong');
        fechaStrong.textContent = 'Fecha del viaje: ';
        const fecha = new Date(req.fecha_salida);
        const fechaStr = fecha.toLocaleString('es-AR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        fechaP.appendChild(fechaStrong);
        fechaP.appendChild(document.createTextNode(fechaStr));

        const precioP = document.createElement('p');
        const precioStrong = document.createElement('strong');
        precioStrong.textContent = 'Precio: ';
        precioP.appendChild(precioStrong);
        precioP.appendChild(document.createTextNode(`$${parseFloat(req.precio).toFixed(2)}`));

        const requestDateP = document.createElement('p');
        const requestDateStrong = document.createElement('strong');
        requestDateStrong.textContent = 'Solicitado: ';
        const requestDate = new Date(req.requested_at);
        const requestStr = requestDate.toLocaleString('es-AR');
        requestDateP.appendChild(requestDateStrong);
        requestDateP.appendChild(document.createTextNode(requestStr));

        details.appendChild(conductorP);
        details.appendChild(fechaP);
        details.appendChild(precioP);
        details.appendChild(requestDateP);

        const actions = document.createElement('div');
        actions.classList.add('booking-actions');

        const isLive = req.estado_viaje === 'activo' || req.estado_viaje === 'en_curso';
        if (req.estado === 'aceptada' && isLive) {
            const viewTripBtn = document.createElement('button');
            viewTripBtn.textContent = 'Ver Viaje en Vivo';
            viewTripBtn.classList.add('view-trip-btn');
            viewTripBtn.addEventListener('click', () => {
                window.history.pushState({}, '', `/dashboard/live-trip?id=${req.viaje_id}`);
                window.dispatchEvent(new Event('popstate'));
            });
            actions.appendChild(viewTripBtn);
        }

        const canCancel = (req.estado === 'pendiente' || req.estado === 'aceptada') && 
                          (req.estado_viaje !== 'completado' && req.estado_viaje !== 'cancelado');

        if (canCancel) {
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancelar Reserva';
            cancelBtn.classList.add('cancel-btn');
            cancelBtn.addEventListener('click', async () => {
                if (!confirm('¿Estás seguro de que quieres cancelar tu reserva?')) return;
                const res = await api.cancelBooking(req.id);
                if (res.success) {
                    alert('Reserva cancelada.');
                    this.load();
                } else {
                    alert(res.error || 'No se pudo cancelar la reserva.');
                }
            });
            actions.appendChild(cancelBtn);
        }

        if (req.estado === 'aceptada' && req.estado_viaje === 'completado') {
            const detailsBtn = document.createElement('button');
            detailsBtn.textContent = 'Ver Detalles';
            detailsBtn.classList.add('details-btn'); 
            detailsBtn.addEventListener('click', () => {
                this.showTripDetailsModal(req);
            });
            actions.appendChild(detailsBtn);
        }

        card.appendChild(header);
        card.appendChild(details);
        if (actions.childNodes.length > 0) {
            card.appendChild(actions);
        }

        return card;
    }

    showTripDetailsModal(trip) {
        const tripDetailsElement = document.createElement('trip-details-wc');
        
     
        const conductorData = {
            name: trip.conductor_name,
            email: trip.conductor_email
        };

        tripDetailsElement.trip = trip;
        tripDetailsElement.user = conductorData;

        document.body.appendChild(tripDetailsElement);
    }

    getStatusText(status) {
        const statusMap = {
            'pendiente': 'Pendiente',
            'aceptada': 'Aceptada',
            'rechazada': 'Rechazada'
        };
        return statusMap[status] || status;
    }

    filterRequests(filter) {
        const list = this.shadowRoot.getElementById('bookings-list');
        
        if (filter === 'todas') {
            this.renderRequests(this.requests, list);
        } else if (filter === 'completados') {
            const filtered = this.requests.filter(r => r.estado === 'aceptada' && r.estado_viaje === 'completado');
            this.renderRequests(filtered, list);
        } else {
            const estadoMap = {
                'pendientes': 'pendiente',
                'aceptadas': 'aceptada',
                'rechazadas': 'rechazada'
            };
            const estadoReal = estadoMap[filter];
            const filtered = this.requests.filter(r => r.estado === estadoReal);
            this.renderRequests(filtered, list);
        }
    }
}

customElements.define('my-bookings-wc', MyBookingsWC);