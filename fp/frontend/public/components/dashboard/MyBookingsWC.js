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
        this.shadowRoot.innerHTML = '';

        this.style.transition = 'opacity 0.3s ease-in-out';
        this.style.opacity = '0';

        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '/components/dashboard/css/my-bookings.css';

        styles.onload = () => { this.style.opacity = '1'; };

        const container = document.createElement('div');
        container.classList.add('bookings-container');

        const title = document.createElement('h2');
        title.textContent = 'Mis Reservas';

        const res = await api.getMyRequests();
        if (!res.success) {
            const error = document.createElement('p');
            error.textContent = res.error || 'Error al cargar reservas';
            container.append(title, error);
            this.shadowRoot.append(styles, container);
            return;
        }

        this.requests = res.requests || [];

        const filterContainer = document.createElement('div');
        filterContainer.classList.add('filter-container');

        const filters = ['Todas', 'Pendientes', 'Aceptadas', 'Rechazadas'];
        filters.forEach(filter => {
            const btn = document.createElement('button');
            btn.textContent = filter;
            btn.classList.add('filter-btn');
            if (filter === 'Todas') btn.classList.add('active');
            
            btn.addEventListener('click', () => {
                this.shadowRoot.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterRequests(filter.toLowerCase());
            });
            
            filterContainer.appendChild(btn);
        });

        const list = document.createElement('div');
        list.classList.add('bookings-list');
        list.id = 'bookings-list';

        if (this.requests.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.classList.add('empty-state');
            const emptyTitle = document.createElement('h3');
            emptyTitle.textContent = '📭 No tienes reservas';
            const emptyText = document.createElement('p');
            emptyText.textContent = 'Busca viajes disponibles y solicita asientos';
            emptyState.append(emptyTitle, emptyText);
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

        container.append(title, filterContainer, list, backBtn);
        this.shadowRoot.append(styles, container);
    }

    renderRequests(requests, container) {
        container.innerHTML = '';

        if (requests.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.classList.add('empty-state');
            const emptyText = document.createElement('p');
            emptyText.textContent = 'No hay reservas con este filtro';
            emptyState.appendChild(emptyText);
            container.appendChild(emptyState);
            return;
        }

        requests.forEach(req => {
            const card = document.createElement('div');
            card.classList.add('booking-card', `status-${req.estado}`);

            const header = document.createElement('div');
            header.classList.add('booking-header');
            const route = document.createElement('h3');
            route.textContent = `${req.origen} → ${req.destino}`;
            const status = document.createElement('span');
            status.classList.add('status-badge', `status-${req.estado}`);
            status.textContent = this.getStatusText(req.estado);
            header.append(route, status);

            const details = document.createElement('div');
            details.classList.add('booking-details');
            const fecha = new Date(req.fecha_salida);
            const fechaStr = fecha.toLocaleString('es-AR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            const requestDate = new Date(req.requested_at);
            const requestStr = requestDate.toLocaleString('es-AR');

            const createDetailLine = (label, value) => {
                const p = document.createElement('p');
                const strong = document.createElement('strong');
                strong.textContent = `${label}: `;
                p.append(strong, value);
                return p;
            };

            details.append(
                createDetailLine('👤 Conductor', req.conductor_name),
                createDetailLine('📅 Fecha del viaje', fechaStr),
                createDetailLine('💰 Precio', `$${parseFloat(req.precio).toFixed(2)}`),
                createDetailLine('📝 Solicitado', requestStr)
            );
            
            card.append(header, details);
            
            if (req.estado === 'aceptada') {
                const actions = document.createElement('div');
                actions.classList.add('booking-actions');

                const liveBtn = document.createElement('button');
                liveBtn.textContent = 'Ver en Vivo 📍';
                liveBtn.classList.add('live-btn');
                liveBtn.addEventListener('click', () => {
                    const path = `/dashboard/live-trip?id=${req.viaje_id}`;
                    window.history.pushState({}, '', path);
                    window.dispatchEvent(new Event('popstate'));
                });

                actions.appendChild(liveBtn);
                card.appendChild(actions);
            }

            container.appendChild(card);
        });
    }

    getStatusText(status) {
        const statusMap = { 'pendiente': '⏳ Pendiente', 'aceptada': '✅ Aceptada', 'rechazada': '❌ Rechazada' };
        return statusMap[status] || status;
    }

    filterRequests(filter) {
        const list = this.shadowRoot.getElementById('bookings-list');
        if (filter === 'todas') {
            this.renderRequests(this.requests, list);
        } else {
            const filtered = this.requests.filter(r => r.estado === filter.slice(0, -1)); 
            this.renderRequests(filtered, list);
        }
    }
}

customElements.define('my-bookings-wc', MyBookingsWC);