import { api } from '../../services/api.js';

class MyTripsWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.trips = [];
    }

    connectedCallback() {
        this.load();
    }

    async load() {
        const container = this.shadowRoot;
        container.innerHTML = '';
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/components/dashboard/dashboard.css';
        container.appendChild(link);

        const title = document.createElement('h2');
        title.textContent = 'Mis Viajes';
        container.appendChild(title);

        const res = await api.getMyTrips();
        if (!res.success) {
            const err = document.createElement('p');
            err.textContent = res.error || 'Error al cargar viajes';
            container.appendChild(err);
            return;
        }
        this.trips = res.trips || [];

        const list = document.createElement('div');
        list.classList.add('trips-list');

        if (this.trips.length === 0) {
            const p = document.createElement('p');
            p.textContent = 'No tienes viajes creados.';
            list.appendChild(p);
        } else {
            this.trips.forEach(trip => {
                const card = document.createElement('div');
                card.classList.add('trip-card');

                const title = document.createElement('div');
                title.classList.add('trip-title');
                title.textContent = `${trip.origen} → ${trip.destino}`;

                const meta = document.createElement('div');
                meta.classList.add('trip-meta');
                meta.textContent = `Salida: ${new Date(trip.fecha_salida).toLocaleString()} — Asientos: ${trip.asientos_disponibles} — $${trip.precio}`;

                const btns = document.createElement('div');
                btns.classList.add('trip-actions');

                const requestsBtn = document.createElement('button');
                requestsBtn.textContent = 'Ver solicitudes';
                requestsBtn.addEventListener('click', () => {
                    window.history.pushState({}, '', `/dashboard/requests?trip=${trip.id}`);
                    window.dispatchEvent(new Event('popstate'));
                });

                btns.appendChild(requestsBtn);
                card.append(title, meta, btns);
                list.appendChild(card);
            });
        }

        container.appendChild(list);
    }
}

customElements.define('my-trips', MyTripsWC);
