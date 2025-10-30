// frontend/public/components/dashboard/TripRequestsWC.js
import { api } from '../../services/api.js';

class TripRequestsWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.tripId = null; 
        this.requests = [];
        this.mode = 'single'; 
    }

    connectedCallback() {
        const params = new URLSearchParams(window.location.search);
        this.tripId = params.get('trip');
        this.mode = this.tripId ? 'single' : 'all'; 
        this.load();
    }

    async load() {
        this.shadowRoot.innerHTML = '';

        this.style.transition = 'opacity 0.3s ease-in-out';
        this.style.opacity = '0';

        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '/components/dashboard/css/trip-requests.css';

        styles.onload = () => { this.style.opacity = '1'; };

        const container = document.createElement('div');
        container.classList.add('requests-container'); 

        const title = document.createElement('h2');
        title.textContent = this.mode === 'single' ? 'Solicitudes del Viaje' : 'Todas mis Solicitudes';

        const apiCall = this.mode === 'single' 
            ? api.getTripRequests(this.tripId) 
            : api.getAllDriverRequests();

        const res = await apiCall;

        if (!res.success) {
            const error = document.createElement('p');
            error.textContent = res.error || 'Error al cargar solicitudes';
            container.append(title, error);
            this.shadowRoot.append(styles, container);
            return;
        }

        this.requests = res.requests || [];

        const list = document.createElement('div');
        list.classList.add('requests-list');

        if (this.requests.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.classList.add('empty-state');
            emptyState.textContent = 'No hay solicitudes para mostrar.';
            list.appendChild(emptyState);
        } else {
            this.renderRequests(this.requests, list);
        }

        const backBtn = document.createElement('button');
        backBtn.classList.add('back-btn');
        backBtn.textContent = this.mode === 'single' ? '← Volver a Mis Viajes' : '← Volver al Dashboard';
        backBtn.addEventListener('click', () => {
            const path = this.mode === 'single' ? '/dashboard/my-trips' : '/dashboard';
            window.history.pushState({}, '', path);
            window.dispatchEvent(new Event('popstate'));
        });

        container.append(title, list, backBtn);
        this.shadowRoot.append(styles, container);
    }

    renderRequests(requests, container) {
        requests.forEach(r => {
            const card = document.createElement('div');
            card.classList.add('request-card');

            if (this.mode === 'all') {
                const tripTitle = document.createElement('h4');
                tripTitle.textContent = `Viaje: ${r.origen} → ${r.destino}`;
                tripTitle.style.borderBottom = '1px solid #eee';
                tripTitle.style.paddingBottom = '8px';
                tripTitle.style.marginBottom = '10px';
                card.appendChild(tripTitle);
            }

            const name = document.createElement('h3');
            name.textContent = r.pasajero_name;

            const createDetailLine = (label, value) => {
                const p = document.createElement('p');
                const strong = document.createElement('strong');
                strong.textContent = `${label}: `;
                p.append(strong, value);
                return p;
            };

            const details = document.createElement('div');
            details.append(
                createDetailLine('👥 Asientos solicitados', r.asientos_solicitados),
                createDetailLine('📝 Solicitado', new Date(r.requested_at).toLocaleString('es-AR')),
                createDetailLine('🚦 Estado', r.estado)
            );

            const actions = document.createElement('div');
            actions.classList.add('request-actions');

            if (r.estado === 'pendiente') {
                const accept = document.createElement('button');
                accept.textContent = 'Aceptar';
                accept.addEventListener('click', () => this.handleResponse(r.id, 'aceptar'));

                const reject = document.createElement('button');
                reject.textContent = 'Rechazar';
                reject.addEventListener('click', () => this.handleResponse(r.id, 'rechazar'));
                
                actions.append(accept, reject);
            }

            card.append(name, details, actions);
            container.appendChild(card);
        });
    }

    async handleResponse(requestId, action) {
        const res = await api.respondRequest(requestId, action);
        if (res.success) {
            alert(`Solicitud ${action === 'aceptar' ? 'aceptada' : 'rechazada'}.`);
            this.load();
        } else {
            alert(res.error || 'Error al procesar la solicitud.');
        }
    }
}

customElements.define('trip-requests-wc', TripRequestsWC);