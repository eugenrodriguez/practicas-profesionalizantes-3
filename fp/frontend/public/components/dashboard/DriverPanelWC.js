// frontend/public/components/dashboard/DriverPanelWC.js
import { api } from '../../services/api.js';

class DriverPanelWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.driverTrips = [];
    }

    connectedCallback() {
        this.loadPanelData();
    }

    async loadPanelData() {
        try {
            const tripsRes = await api.getUserTrips();
            if (tripsRes.success) {
                this.driverTrips = tripsRes.trips || [];
            }
        } catch (err) {
            console.error('Error cargando datos del panel de conductor:', err);
        }
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = ''; 
        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '/components/dashboard/css/dashboard.css';

        const section = document.createElement('div');
        section.classList.add('role-section');

        const title = document.createElement('h2');
        title.textContent = 'Panel de Conductor';
        
        const statsContainer = document.createElement('div');
        statsContainer.classList.add('stats-container');
        
        const pendingRequests = this.driverTrips.reduce((acc, trip) => acc + (trip.solicitudes_pendientes || 0), 0);
        statsContainer.append(
            this.createStatCard('Viajes Creados', this.driverTrips.length),
            this.createStatCard('Calificación', '4.9 ⭐'), 
            this.createStatCard('Solicitudes Pendientes', pendingRequests) 
        );
        
        const actions = document.createElement('div');
        actions.classList.add('actions-grid');
        actions.append(
            this.createActionButton('Crear Viaje', '/dashboard/create-trip'),
            this.createActionButton('Mis Viajes', '/dashboard/my-trips'),
            this.createActionButton('Solicitudes', '/dashboard/requests'),
            this.createActionButton('Mi Perfil', '/dashboard/profile')
        );
        
        section.append(title, statsContainer, actions);
        this.shadowRoot.append(styles, section);
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
        button.addEventListener('click', () => {
            window.history.pushState({}, '', path);
            window.dispatchEvent(new Event('popstate'));
        });
        return button;
    }
}

customElements.define('driver-panel-wc', DriverPanelWC);