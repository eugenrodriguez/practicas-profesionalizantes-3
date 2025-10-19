import './TripRequestsWC.js';
import './CreateTripWC.js';
import './DriverProfileWC.js';
import { api } from '../../services/api.js';
import '../logout/LogoutButtonWC.js';

class DashboardWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.user = null;
        this.trips = [];
    }

    connectedCallback() {
        if (this.user) {
            this.loadDashboardData();
        }
    }

    set data(user) {
        this.user = user;
        if (this.isConnected) {
            this.loadDashboardData();
        }
    }

    async loadDashboardData() {
        try {
            const tripsRes = await api.getUserTrips();
            if (tripsRes.success) {
                this.trips = tripsRes.trips || [];
            }
        } catch (err) {
            console.error('Error cargando datos del dashboard:', err);
        }

        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = '';

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/components/dashboard/dashboard.css';

        const container = document.createElement('div');
        container.classList.add('dashboard-container');

        const header = this.createHeader();
        const panel = this.createPanel();
        const footer = this.createFooter();

        container.append(header, panel, footer);
        this.shadowRoot.append(link, container);
    }

    createHeader() {
        const header = document.createElement('div');
        header.classList.add('dashboard-header');

        const title = document.createElement('h1');
        title.textContent = `¡Bienvenido, ${this.user.name}!`;

        const roleInfo = document.createElement('p');
        roleInfo.classList.add('role-info');

        const rolesText = this.user.roles.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(' y ');
        roleInfo.textContent = `Roles: ${rolesText}`;

        header.append(title, roleInfo);
        return header;
    }

    createPanel() {
        const panel = document.createElement('div');
        panel.classList.add('panel');

        if (this.user.roles.includes('conductor')) {
            const conductorSection = this.createConductorSection();
            panel.appendChild(conductorSection);
        }

        if (this.user.roles.includes('pasajero')) {
            const passengerSection = this.createPassengerSection();
            panel.appendChild(passengerSection);
        }

        return panel;
    }

    createConductorSection() {
        const section = document.createElement('div');
        section.classList.add('role-section');

        const title = document.createElement('h2');
        title.textContent = 'Panel de Conductor';

        const stats = this.createStats();

        // Mostrar viajes si existen
        if (this.trips.length > 0) {
            const tripsList = document.createElement('ul');
            tripsList.classList.add('trip-list');
            this.trips.forEach(t => {
                const li = document.createElement('li');
                li.textContent = `Destino: ${t.destino || 'Sin destino'} (${t.pasajeros || 0} pasajeros)`;
                tripsList.appendChild(li);
            });
            section.appendChild(tripsList);
        }

        const actions = document.createElement('div');
        actions.classList.add('actions-grid');

        const createTripBtn = this.createActionButton('Crear Viaje', 'create-trip');
        const myTripsBtn = this.createActionButton('Mis Viajes', 'my-trips');
        const requestsBtn = this.createActionButton('Solicitudes', 'passenger-requests');
        const profileBtn = this.createActionButton('Mi Perfil', 'conductor-profile');

        actions.append(createTripBtn, myTripsBtn, requestsBtn, profileBtn);

        section.append(title, stats, actions);
        return section;
    }

    createPassengerSection() {
        const section = document.createElement('div');
        section.classList.add('role-section');

        const title = document.createElement('h2');
        title.textContent = 'Panel de Pasajero';

        const stats = this.createStats();

        const actions = document.createElement('div');
        actions.classList.add('actions-grid');

        const searchTripBtn = this.createActionButton('Buscar Viaje', 'search-trip');
        const bookingsBtn = this.createActionButton('Mis Reservas', 'my-bookings');
        const favoritesBtn = this.createActionButton('Favoritos', 'favorite-drivers');
        const profileBtn = this.createActionButton('Mi Perfil', 'passenger-profile');

        actions.append(searchTripBtn, bookingsBtn, favoritesBtn, profileBtn);

        section.append(title, stats, actions);
        return section;
    }

    createStats() {
        const statsContainer = document.createElement('div');
        statsContainer.classList.add('stats-container');

        const stat1 = this.createStatCard('Viajes', this.trips.length.toString());
        const stat2 = this.createStatCard('Calificación', '5.0');
        const stat3 = this.createStatCard('Activos', this.trips.length > 0 ? 'Sí' : 'No');

        statsContainer.append(stat1, stat2, stat3);
        return statsContainer;
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

    createActionButton(text, id) {
        const button = document.createElement('button');
        button.classList.add('action-button');
        button.id = id;
        button.textContent = text;

        button.addEventListener('click', () => this.handleAction(id));
        return button;
    }

    createActionButton(text, id) {
        const button = document.createElement('button');
        button.classList.add('action-button');
        button.id = id;
        button.textContent = text;

        button.addEventListener('click', () => {
            switch (id) {
                case 'create-trip':
                    window.history.pushState({}, '', '/dashboard/create-trip');
                    break;
                case 'my-trips':
                    window.history.pushState({}, '', '/dashboard/my-trips');
                    break;
                case 'passenger-requests':
                    // para conductor: abrir vista general de viajes o elegir viaje -> aquí redirjo a mis viajes
                    window.history.pushState({}, '', '/dashboard/my-trips');
                    break;
                case 'conductor-profile':
                    window.history.pushState({}, '', '/dashboard/profile');
                    break;
                case 'search-trip':
                    // pasajero -> aún no implementado; podrías crear ruta similar
                    window.history.pushState({}, '', '/dashboard/my-trips');
                    break;
                case 'my-bookings':
                    window.history.pushState({}, '', '/dashboard/my-trips');
                    break;
                case 'favorite-drivers':
                    window.history.pushState({}, '', '/dashboard/my-trips');
                    break;
                case 'passenger-profile':
                    window.history.pushState({}, '', '/dashboard/profile');
                    break;
            }
            window.dispatchEvent(new Event('popstate'));
        });

        return button;
    }

    createFooter() {
        const footer = document.createElement('div');
        footer.classList.add('dashboard-footer');

        const logoutBtn = document.createElement('logout-button-wc');
        footer.appendChild(logoutBtn);
        return footer;
    }
}

customElements.define('dashboard-view', DashboardWC);
