import { api } from '../../services/api.js';

class PassengerPanelService {
    loadPanelData() {
        return Promise.all([
            api.getMyRequests(),
            api.getProfile()
        ]);
    }
}

class PassengerPanelView {
    constructor(host) {
        this.host = host;
        this.shadowRoot = host.shadowRoot;
    }

    dispatchEvent(eventName, detail) {
        this.host.dispatchEvent(new CustomEvent(eventName, {
            bubbles: true,
            composed: true,
            detail
        }));
    }

    clearContainer(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    render(userProfile, passengerBookings) {
        this.clearContainer(this.shadowRoot);

        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '/components/dashboard/css/dashboard.css';

        const section = document.createElement('div');
        section.classList.add('role-section');

        const title = document.createElement('h2');
        title.textContent = 'Panel de Pasajero';

        const statsContainer = document.createElement('div');
        statsContainer.classList.add('stats-container', 'passenger-stats');

        const avgRating = userProfile?.calificacion_promedio ? parseFloat(userProfile.calificacion_promedio).toFixed(2) : 'S/C';

        statsContainer.append(
            this.createStatCard('Tu Calificación', `${avgRating} `),
            this.createNextTripCard(passengerBookings),
            this.createHistoryCard(passengerBookings)
        );

        const actions = document.createElement('div');
        actions.classList.add('actions-grid');
        actions.append(
            this.createActionButton('Buscar Viaje', '/dashboard/search-trips'),
            this.createActionButton('Mis Reservas', '/dashboard/my-bookings'),
            this.createActionButton('Mi Perfil', '/dashboard/passenger-profile')
        );

        section.append(title, statsContainer, actions);
        this.shadowRoot.append(styles, section);
    }

    createNextTripCard(passengerBookings) {
        const nextTrip = (passengerBookings || [])
            .filter(b => b.estado === 'aceptada' && b.estado_viaje !== 'completado' && b.estado_viaje !== 'cancelado')
            .sort((a, b) => new Date(a.fecha_salida) - new Date(b.fecha_salida))[0];

        const card = document.createElement('div');
        card.classList.add('stat-card', 'next-trip-card');
        
        const valueEl = document.createElement('div');
        valueEl.classList.add('stat-value');

        const labelEl = document.createElement('div');
        labelEl.classList.add('stat-label');
        labelEl.textContent = 'Próximo Viaje';

        if (nextTrip) {
            const routeSpan = document.createElement('span');
            routeSpan.className = 'route';
            routeSpan.textContent = `${nextTrip.origen} → ${nextTrip.destino}`;

            const dateSpan = document.createElement('span');
            dateSpan.className = 'date';
            const fecha = new Date(nextTrip.fecha_salida);
            dateSpan.textContent = fecha.toLocaleString('es-AR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
            
            const driverSpan = document.createElement('span');
            driverSpan.className = 'driver';
            driverSpan.textContent = `Conductor: ${nextTrip.conductor_name}`;

            valueEl.append(routeSpan, dateSpan, driverSpan);
        } else {
            valueEl.textContent = 'No tienes viajes programados.';
            valueEl.style.fontSize = '1rem';
        }
        
        card.append(valueEl, labelEl);
        return card;
    }
    
    createHistoryCard(passengerBookings) {
        const completedTripsCount = (passengerBookings || []).filter(b => b.estado === 'aceptada' && b.estado_viaje === 'completado').length;
        return this.createStatCard('Viajes Realizados', completedTripsCount);
    }
    
    createStatCard(label, value) {
        const card = document.createElement('div');
        card.classList.add('stat-card');
        
        const valueEl = document.createElement('div');
        valueEl.classList.add('stat-value');
        valueEl.textContent = value;
        
        const labelEl = document.createElement('div');
        labelEl.classList.add('stat-label');
        labelEl.textContent = label;
        
        card.append(valueEl, labelEl);
        return card;
    }

    createActionButton(text, path) {
        const button = document.createElement('button');
        button.classList.add('action-button');
        button.textContent = text;
        button.addEventListener('click', () => this.dispatchEvent('navigate', { path }));
        return button;
    }
}

class PassengerPanelWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.service = new PassengerPanelService();
        this.view = new PassengerPanelView(this);

        this.state = {
            userProfile: null,
            passengerBookings: []
        };
    }

    connectedCallback() {
        this.loadPanelData();
        this.addEventListeners();
    }

    disconnectedCallback() {
        this.removeEventListeners();
    }

    addEventListeners() {
        this.addEventListener('navigate', this.handleNavigation);
    }

    removeEventListeners() {
        this.removeEventListener('navigate', this.handleNavigation);
    }

    handleNavigation = (e) => {
        const path = e.detail.path;
        window.history.pushState({}, '', path);
        window.dispatchEvent(new Event('popstate'));
    }

    async loadPanelData() {
        try {
            const [bookingsRes, profileRes] = await this.service.loadPanelData();

            if (bookingsRes.success) this.state.passengerBookings = bookingsRes.requests || [];
            if (profileRes.success) this.state.userProfile = profileRes.user;

        } catch (err) {
            console.error('Error cargando datos del panel de pasajero:', err);
        }
        this.view.render(this.state.userProfile, this.state.passengerBookings);
    }
}

customElements.define('passenger-panel-wc', PassengerPanelWC);