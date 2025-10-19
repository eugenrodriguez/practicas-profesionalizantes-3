import { api } from '../../services/api.js';

class TripRequestsWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.tripId = null;
        this.requests = [];
    }

    connectedCallback() {
        // obtener tripId de query param
        const params = new URLSearchParams(window.location.search);
        this.tripId = params.get('trip');
        this.load();
    }

    async load() {
        this.shadowRoot.innerHTML = '';
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/components/dashboard/dashboard.css';
        this.shadowRoot.appendChild(link);

        const title = document.createElement('h2');
        title.textContent = 'Solicitudes';
        this.shadowRoot.appendChild(title);

        if (!this.tripId) {
            const p = document.createElement('p');
            p.textContent = 'ID de viaje no especificado.';
            this.shadowRoot.appendChild(p);
            return;
        }

        const res = await api.getTripRequests(this.tripId);
        if (!res.success) {
            const p = document.createElement('p');
            p.textContent = res.error || 'Error al cargar solicitudes';
            this.shadowRoot.appendChild(p);
            return;
        }

        this.requests = res.requests || [];

        if (this.requests.length === 0) {
            const p = document.createElement('p');
            p.textContent = 'No hay solicitudes aún.';
            this.shadowRoot.appendChild(p);
            return;
        }

        const list = document.createElement('div');
        list.classList.add('requests-list');

        this.requests.forEach(r => {
            const card = document.createElement('div');
            card.classList.add('request-card');

            const name = document.createElement('div');
            name.textContent = r.pasajero_name;

            const meta = document.createElement('div');
            meta.textContent = `${r.telefono || ''} • solicitado: ${new Date(r.requested_at).toLocaleString()}`;

            const actions = document.createElement('div');
            actions.classList.add('request-actions');

            const accept = document.createElement('button');
            accept.textContent = 'Aceptar';
            accept.addEventListener('click', async () => {
                const res = await api.respondRequest(r.id, 'aceptar');
                if (res.success) {
                    alert('Solicitud aceptada');
                    this.load();
                } else alert(res.error || 'Error');
            });

            const reject = document.createElement('button');
            reject.textContent = 'Rechazar';
            reject.addEventListener('click', async () => {
                const res = await api.respondRequest(r.id, 'rechazar');
                if (res.success) {
                    alert('Solicitud rechazada');
                    this.load();
                } else alert(res.error || 'Error');
            });

            actions.append(accept, reject);
            card.append(name, meta, actions);
            list.appendChild(card);
        });

        this.shadowRoot.appendChild(list);
    }
}

customElements.define('trip-requests', TripRequestsWC);
