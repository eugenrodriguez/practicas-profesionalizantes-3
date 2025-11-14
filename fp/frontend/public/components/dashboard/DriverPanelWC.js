import { api } from '../../services/api.js';

class DriverPanelService {
    static async getDriverData() {
        const [tripsRes, profileRes] = await Promise.all([
            api.getMyTrips(),
            api.getProfile()
        ]);
        return { tripsRes, profileRes };
    }
}

class DriverPanelPresenter {
    static getStats(driverTrips, userProfile) {
        const pendingRequests = driverTrips.reduce((acc, trip) => acc + (trip.solicitudes_pendientes || 0), 0);
        const avgRating = userProfile?.calificacion_promedio ? parseFloat(userProfile.calificacion_promedio).toFixed(2) : 'S/C';
        return {
            tripsCreated: driverTrips.length,
            avgRating: avgRating,
            pendingRequests: pendingRequests
        };
    }
}

class DriverPanelView {
    constructor() {
        this.elements = {};
    }

    createPanel(stats, actionButtons) {
        const section = document.createElement('div');
        section.classList.add('role-section');

        const title = document.createElement('h2');
        title.textContent = 'Panel de Conductor';
        
        const statsContainer = document.createElement('div');
        statsContainer.classList.add('stats-container');
        statsContainer.append(
            this.createStatCard('Viajes Creados', stats.tripsCreated),
            this.createStatCard('Calificación', `${stats.avgRating} `), 
            this.createStatCard('Solicitudes Pendientes', stats.pendingRequests) 
        );
        
        const actions = document.createElement('div');
        actions.classList.add('actions-grid');
        actions.append(...actionButtons);
        
        section.append(title, statsContainer, actions);
        this.elements.section = section;
        return section;
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

    createActionButton(text) {
        const button = document.createElement('button');
        button.classList.add('action-button');
        button.textContent = text;
        return button;
    }
}

class DriverPanelWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.userProfile = null;
        this.driverTrips = [];
        this.view = new DriverPanelView();
    }

    connectedCallback() {
        this.loadPanelData();
    }

    async loadPanelData() {
        try {
            const { tripsRes, profileRes } = await DriverPanelService.getDriverData();

            if (tripsRes.success) this.driverTrips = tripsRes.trips || [];
            if (profileRes.success) this.userProfile = profileRes.user;

        } catch (err) {
            console.error('Error cargando datos del panel de conductor:', err);
        }
        this.render();
    }

    render() {
        while (this.shadowRoot.firstChild) {
            this.shadowRoot.removeChild(this.shadowRoot.firstChild);
        }
        
        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '/components/dashboard/css/dashboard.css';

        const stats = DriverPanelPresenter.getStats(this.driverTrips, this.userProfile);

        const createTripBtn = this.view.createActionButton('Crear Viaje');
        const myTripsBtn = this.view.createActionButton('Mis Viajes');
        const requestsBtn = this.view.createActionButton('Solicitudes');
        const profileBtn = this.view.createActionButton('Mi Perfil');

        createTripBtn.addEventListener('click', () => this.navigate('/dashboard/create-trip'));
        myTripsBtn.addEventListener('click', () => this.navigate('/dashboard/my-trips'));
        requestsBtn.addEventListener('click', () => this.navigate('/dashboard/requests'));
        profileBtn.addEventListener('click', () => this.navigate('/dashboard/profile'));

        const panelContent = this.view.createPanel(stats, [createTripBtn, myTripsBtn, requestsBtn, profileBtn]);
        
        this.shadowRoot.append(styles, panelContent);
    }

    navigate(path) {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new Event('popstate'));
    }
}

customElements.define('driver-panel-wc', DriverPanelWC);