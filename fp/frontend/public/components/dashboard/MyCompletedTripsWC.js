// frontend/public/components/dashboard/MyCompletedTripsWC.js
import './TripDetailsWC.js';
import { api } from '../../services/api.js';

class MyCompletedTripsWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.user = null;
        this.trips = [];
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

        styles.onload = () => { this.style.opacity = '1'; };

        const mainContainer = document.createElement('div');
        mainContainer.classList.add('my-trips-container');

        const title = document.createElement('h2');
        title.textContent = 'Mis Viajes Realizados';
        mainContainer.appendChild(title);

        const profileRes = await api.getProfile();
        if (profileRes.success) {
            this.user = profileRes.user;
        }

        const res = await api.getPassengerCompletedTrips();
        if (!res.success) {
            const err = document.createElement('p');
            err.textContent = res.error || 'Error al cargar viajes realizados';
            err.classList.add('error-message');
            mainContainer.appendChild(err);
            this.shadowRoot.append(styles, mainContainer);
            return;
        }

        this.trips = res.trips || [];

        const list = document.createElement('div');
        list.classList.add('trips-list');

        if (this.trips.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.classList.add('empty-state');
            const emptyTitle = document.createElement('h3');
            emptyTitle.textContent = 'Aún no has completado ningún viaje';
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'Los viajes que completes aparecerán aquí.';
            emptyState.append(emptyTitle, emptyMessage);
            list.appendChild(emptyState);
        } else {
            this.trips.forEach(trip => {
                const card = this.createCompletedTripCard(trip);
                list.appendChild(card);
            });
        }

        const backBtn = document.createElement('button');
        backBtn.classList.add('back-btn');
        backBtn.textContent = '← Volver al Dashboard';
        backBtn.addEventListener('click', () => {
            window.history.pushState({}, '', '/dashboard');
            window.dispatchEvent(new Event('popstate'));
        });

        mainContainer.appendChild(list);
        mainContainer.appendChild(backBtn);
        
        this.shadowRoot.append(styles, mainContainer);
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
        metaSpan.textContent = 'Realizado el: ';
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
        
        const conductorData = {
            name: trip.conductor_name,
            email: trip.conductor_email 
        };

        tripDetailsElement.trip = trip;
        tripDetailsElement.user = conductorData; 

        document.body.appendChild(tripDetailsElement);
    }

    createButton(text, className, onClick) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.classList.add(className);
        btn.addEventListener('click', onClick);
        return btn;
    }
}

customElements.define('my-completed-trips-wc', MyCompletedTripsWC);
