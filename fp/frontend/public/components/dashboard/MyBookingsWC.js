import { api } from '../../services/api.js';

class BookingService {
    static async getProfile() {
        return await api.getProfile();
    }

    static async getMyRequests() {
        return await api.getMyRequests();
    }

    static async cancelBooking(requestId) {
        return await api.cancelBooking(requestId);
    }

    static async getTripById(tripId) {
        return await api.getTripById(tripId);
    }
}

class BookingFilter {
    static getStatusText(status) {
        const statusMap = {
            'pendiente': 'Pendiente',
            'aceptada': 'Aceptada',
            'rechazada': 'Rechazada'
        };
        return statusMap[status] || status;
    }

    static applyFilter(requests, filter) {
        if (filter === 'todas') {
            return requests;
        } else if (filter === 'completados') {
            return requests.filter(r => r.estado === 'aceptada' && r.estado_viaje === 'completado');
        } else {
            const estadoMap = {
                'pendientes': 'pendiente',
                'aceptadas': 'aceptada',
                'rechazadas': 'rechazada'
            };
            const estadoReal = estadoMap[filter];
            return requests.filter(r => r.estado === estadoReal);
        }
    }
}

class MyBookingsView {
    constructor(shadowRoot) {
        this.shadowRoot = shadowRoot;
        this.elements = {};
    }

    render(requests, user, filterButtonsData) {
        const container = document.createElement('div');
        container.classList.add('bookings-container');

        const title = document.createElement('h2');
        title.textContent = 'Mis Reservas';

        const filterContainer = document.createElement('div');
        filterContainer.classList.add('filter-container');
        this.elements.filterButtons = [];
        filterButtonsData.forEach(filter => {
            const btn = this.createFilterButton(filter.text);
            if (filter.isActive) btn.classList.add('active');
            filterContainer.appendChild(btn);
            this.elements.filterButtons.push(btn);
        });

        const list = document.createElement('div');
        list.classList.add('bookings-list');
        list.id = 'bookings-list';
        this.elements.bookingsList = list;

        const backBtn = document.createElement('button');
        backBtn.classList.add('back-btn');
        backBtn.textContent = '← Volver al Dashboard';
        this.elements.backBtn = backBtn;

        container.append(title, filterContainer, list, backBtn);
        this.updateBookingsList(requests, user);
        return container;
    }

    createFilterButton(text) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.classList.add('filter-btn');
        return btn;
    }

    updateBookingsList(requests, user) {
        const container = this.elements.bookingsList;
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
            const card = this.createBookingCard(req, user);
            container.appendChild(card);
        });
    }

    createEmptyState(titleText, messageText) {
        const emptyState = document.createElement('div');
        emptyState.classList.add('empty-state');

        const emptyTitle = document.createElement('h3');
        emptyTitle.textContent = titleText;

        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = messageText;

        emptyState.append(emptyTitle, emptyMessage);
        return emptyState;
    }

    createBookingCard(req, user) {
        const card = document.createElement('div');
        card.classList.add('booking-card');
        card.classList.add(`status-${req.estado}`);

        const header = document.createElement('div');
        header.classList.add('booking-header');

        const route = document.createElement('h3');
        route.textContent = `${req.origen} → ${req.destino}`;

        const status = document.createElement('span');
        status.classList.add('status-badge', `status-${req.estado}`);
        status.textContent = BookingFilter.getStatusText(req.estado);

        header.append(route, status);

        const details = document.createElement('div');
        details.classList.add('booking-details');

        const conductorP = document.createElement('p');
        const conductorStrong = document.createElement('strong');
        conductorStrong.textContent = 'Conductor: ';
        conductorP.append(conductorStrong, document.createTextNode(req.conductor_name));

        const fechaP = document.createElement('p');
        const fechaStrong = document.createElement('strong');
        fechaStrong.textContent = 'Fecha del viaje: ';
        const fecha = new Date(req.fecha_salida);
        const fechaStr = fecha.toLocaleString('es-AR', {
            weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        fechaP.append(fechaStrong, document.createTextNode(fechaStr));

        const precioP = document.createElement('p');
        const precioStrong = document.createElement('strong');
        precioStrong.textContent = 'Precio: ';
        precioP.append(precioStrong, document.createTextNode(`$${parseFloat(req.precio).toFixed(2)}`));

        const requestDateP = document.createElement('p');
        const requestDateStrong = document.createElement('strong');
        requestDateStrong.textContent = 'Solicitado: ';
        const requestDate = new Date(req.requested_at);
        const requestStr = requestDate.toLocaleString('es-AR');
        requestDateP.append(requestDateStrong, document.createTextNode(requestStr));

        details.append(conductorP, fechaP, precioP, requestDateP);

        const actions = document.createElement('div');
        actions.classList.add('booking-actions');

        const isLive = req.estado_viaje === 'activo' || req.estado_viaje === 'en_curso';
        if (req.estado === 'aceptada' && isLive) {
            const viewTripBtn = document.createElement('button');
            viewTripBtn.textContent = 'Ver Viaje en Vivo';
            viewTripBtn.classList.add('view-trip-btn');
            this.elements[`viewTripBtn-${req.id}`] = viewTripBtn; 
            actions.appendChild(viewTripBtn);
        }

        const canCancel = (req.estado === 'pendiente' || req.estado === 'aceptada') && 
                          (req.estado_viaje !== 'completado' && req.estado_viaje !== 'cancelado');

        if (canCancel) {
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancelar Reserva';
            cancelBtn.classList.add('cancel-btn');
            this.elements[`cancelBtn-${req.id}`] = cancelBtn; 
            actions.appendChild(cancelBtn);
        }

        if (req.estado === 'aceptada' && req.estado_viaje === 'completado') {
            const detailsBtn = document.createElement('button');
            detailsBtn.textContent = 'Ver Detalles';
            detailsBtn.classList.add('details-btn'); 
            this.elements[`detailsBtn-${req.id}`] = detailsBtn; 
            actions.appendChild(detailsBtn);
        }

        card.append(header, details);
        if (actions.childNodes.length > 0) {
            card.appendChild(actions);
        }

        return card;
    }

    displayError(message) {
        const error = document.createElement('p');
        error.textContent = message;
        error.classList.add('error-message');
        this.shadowRoot.appendChild(error);
    }

    showTripDetailsModal(tripDetailsElement) {
        document.body.appendChild(tripDetailsElement);
    }
}

class MyBookingsWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.requests = [];
        this.user = null; 
        this.view = new MyBookingsView(this.shadowRoot);
        this.currentFilter = 'todas';
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
        this.shadowRoot.appendChild(styles);

        const profileRes = await BookingService.getProfile();
        if (profileRes.success) {
            this.user = profileRes.user;
        }

        const res = await BookingService.getMyRequests();
        if (!res.success) {
            this.view.displayError(res.error || 'Error al cargar reservas');
            return;
        }

        this.requests = res.requests || [];

        const filters = ['Todas', 'Pendientes', 'Aceptadas', 'Rechazadas', 'Completados'];
        const filterButtonsData = filters.map(filter => ({
            text: filter,
            isActive: filter.toLowerCase() === this.currentFilter
        }));

        const container = this.view.render(
            BookingFilter.applyFilter(this.requests, this.currentFilter),
            this.user,
            filterButtonsData
        );
        this.shadowRoot.appendChild(container);
        this.addEventListeners();
    }

    addEventListeners() {
        this.view.elements.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterClick(e));
        });
        this.view.elements.backBtn.addEventListener('click', () => this.handleBackClick());

        this.requests.forEach(req => {
            if (this.view.elements[`viewTripBtn-${req.id}`]) {
                this.view.elements[`viewTripBtn-${req.id}`].addEventListener('click', () => this.handleViewTripClick(req.viaje_id));
            }
            if (this.view.elements[`cancelBtn-${req.id}`]) {
                this.view.elements[`cancelBtn-${req.id}`].addEventListener('click', () => this.handleCancelBookingClick(req.id));
            }
            if (this.view.elements[`detailsBtn-${req.id}`]) {
                this.view.elements[`detailsBtn-${req.id}`].addEventListener('click', () => this.handleShowTripDetailsClick(req));
            }
        });
    }

    removeEventListeners() {
        this.view.elements.filterButtons.forEach(btn => {
            btn.removeEventListener('click', (e) => this.handleFilterClick(e));
        });
        this.view.elements.backBtn.removeEventListener('click', () => this.handleBackClick());

        this.requests.forEach(req => {
            if (this.view.elements[`viewTripBtn-${req.id}`]) {
                this.view.elements[`viewTripBtn-${req.id}`].removeEventListener('click', () => this.handleViewTripClick(req.viaje_id));
            }
            if (this.view.elements[`cancelBtn-${req.id}`]) {
                this.view.elements[`cancelBtn-${req.id}`].removeEventListener('click', () => this.handleCancelBookingClick(req.id));
            }
            if (this.view.elements[`detailsBtn-${req.id}`]) {
                this.view.elements[`detailsBtn-${req.id}`].removeEventListener('click', () => this.handleShowTripDetailsClick(req));
            }
        });
    }

    handleFilterClick(e) {
        const filterText = e.target.textContent.toLowerCase();
        this.currentFilter = filterText;
        this.view.elements.filterButtons.forEach(btn => {
            if (btn === e.target) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        this.view.updateBookingsList(BookingFilter.applyFilter(this.requests, this.currentFilter), this.user);
    }

    handleBackClick() {
        window.history.pushState({}, '', '/dashboard');
        window.dispatchEvent(new Event('popstate'));
    }

    handleViewTripClick(tripId) {
        window.history.pushState({}, '', `/dashboard/live-trip?id=${tripId}`);
        window.dispatchEvent(new Event('popstate'));
    }

    async handleCancelBookingClick(requestId) {
        if (!confirm('¿Estás seguro de que quieres cancelar tu reserva?')) return;
        const res = await BookingService.cancelBooking(requestId);
        if (res.success) {
            alert('Reserva cancelada.');
            this.load(); 
        } else {
            alert(res.error || 'No se pudo cancelar la reserva.');
        }
    }

    async handleShowTripDetailsClick(request) {
        const res = await BookingService.getTripById(request.viaje_id);
        if (!res.success) {
            alert('No se pudieron cargar los detalles completos del viaje.');
            return;
        }
        const fullTripDetails = res.trip;

        const tripDetailsElement = document.createElement('passenger-trip-details-wc');
        tripDetailsElement.trip = fullTripDetails;
        tripDetailsElement.user = this.user; 
        this.view.showTripDetailsModal(tripDetailsElement);
    }
}

customElements.define('my-bookings-wc', MyBookingsWC);