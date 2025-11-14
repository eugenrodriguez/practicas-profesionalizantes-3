import './TripDetailsWC.js';
import { api } from '../../services/api.js';

class CompletedTripsService {
    static async getProfile() {
        return await api.getProfile();
    }

    static async getPassengerCompletedTrips() {
        return await api.getPassengerCompletedTrips();
    }
}

class CompletedTripsView {
    constructor(shadowRoot) {
        this.shadowRoot = shadowRoot;
        this.elements = {};
    }

    render(trips, user) {
        const mainContainer = document.createElement('div');
        mainContainer.classList.add('my-trips-container');

        const title = document.createElement('h2');
        title.textContent = 'Mis Viajes Realizados';
        mainContainer.appendChild(title);

        const list = document.createElement('div');
        list.classList.add('trips-list');
        this.elements.tripsList = list;

        if (trips.length === 0) {
            const emptyState = this.createEmptyState(
                'Aún no has completado ningún viaje',
                'Los viajes que completes aparecerán aquí.'
            );
            list.appendChild(emptyState);
        } else {
            trips.forEach(trip => {
                const card = this.createCompletedTripCard(trip);
                list.appendChild(card);
            });
        }

        const backBtn = document.createElement('button');
        backBtn.classList.add('back-btn');
        backBtn.textContent = '← Volver al Dashboard';
        this.elements.backBtn = backBtn;

        mainContainer.append(list, backBtn);
        this.elements.mainContainer = mainContainer;
        return mainContainer;
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

        const detailsBtn = this.createButton('Ver Detalles', 'details-btn');
        this.elements[`detailsBtn-${trip.id}`] = detailsBtn; 
        actions.appendChild(detailsBtn);

        card.append(tripTitle, meta, actions);
        return card;
    }

    createButton(text, className) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.classList.add(className);
        return btn;
    }

    showTripDetailsModal(tripDetailsElement) {
        document.body.appendChild(tripDetailsElement);
    }

    displayError(message) {
        const err = document.createElement('p');
        err.textContent = message;
        err.classList.add('error-message');
        this.elements.mainContainer.appendChild(err);
    }
}

class MyCompletedTripsWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.user = null;
        this.trips = [];
        this.view = new CompletedTripsView(this.shadowRoot);
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
        this.shadowRoot.appendChild(styles);

        const profileRes = await CompletedTripsService.getProfile();
        if (profileRes.success) {
            this.user = profileRes.user;
        }

        const res = await CompletedTripsService.getPassengerCompletedTrips();
        if (!res.success) {
            const mainContainer = document.createElement('div');
            mainContainer.classList.add('my-trips-container');
            this.view.elements.mainContainer = mainContainer; 
            this.view.displayError(res.error || 'Error al cargar viajes realizados');
            this.shadowRoot.appendChild(mainContainer);
            return;
        }

        this.trips = res.trips || [];
        const content = this.view.render(this.trips, this.user);
        this.shadowRoot.appendChild(content);
        this.addEventListeners();
    }

    addEventListeners() {
        this.view.elements.backBtn.addEventListener('click', () => this.handleBackClick());
        this.trips.forEach(trip => {
            if (this.view.elements[`detailsBtn-${trip.id}`]) {
                this.view.elements[`detailsBtn-${trip.id}`].addEventListener('click', () => this.handleShowTripDetailsClick(trip));
            }
        });
    }

    removeEventListeners() {
        this.view.elements.backBtn.removeEventListener('click', () => this.handleBackClick());
        this.trips.forEach(trip => {
            if (this.view.elements[`detailsBtn-${trip.id}`]) {
                this.view.elements[`detailsBtn-${trip.id}`].removeEventListener('click', () => this.handleShowTripDetailsClick(trip));
            }
        });
    }

    handleBackClick() {
        window.history.pushState({}, '', '/dashboard');
        window.dispatchEvent(new Event('popstate'));
    }

    handleShowTripDetailsClick(trip) {
        const tripDetailsElement = document.createElement('trip-details-wc');
        
        const conductorData = {
            name: trip.conductor_name,
            email: trip.conductor_email 
        };

        tripDetailsElement.trip = trip;
        tripDetailsElement.user = conductorData; 

        this.view.showTripDetailsModal(tripDetailsElement);
    }
}

customElements.define('my-completed-trips-wc', MyCompletedTripsWC);
