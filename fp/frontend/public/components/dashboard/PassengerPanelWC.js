// frontend/public/components/dashboard/PassengerPanelWC.js
import { api } from '../../services/api.js';

class PassengerPanelWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.userProfile = null;
        this.passengerBookings = [];
    }

    connectedCallback() {
        this.loadPanelData();
    }

    async loadPanelData() {
        try {
            const [bookingsRes, profileRes] = await Promise.all([
                api.getMyRequests(),
                api.getProfile()
            ]);

            if (bookingsRes.success) this.passengerBookings = bookingsRes.requests || [];
            if (profileRes.success) this.userProfile = profileRes.user;

        } catch (err) {
            console.error('Error cargando datos del panel de pasajero:', err);
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
        title.textContent = 'Panel de Pasajero';

        const statsContainer = document.createElement('div');
        statsContainer.classList.add('stats-container', 'passenger-stats');

        const avgRating = this.userProfile?.calificacion_promedio ? parseFloat(this.userProfile.calificacion_promedio).toFixed(2) : 'N/A';

        statsContainer.append(
            this.createStatCard('Tu Calificación', `${avgRating} `),
            this.createNextTripCard(),
            this.createHistoryCard()
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

    createNextTripCard() {
        const now = new Date();
        const nextTrip = this.passengerBookings
            .filter(b => b.estado === 'aceptada' && new Date(b.fecha_salida) > now)
            .sort((a, b) => new Date(a.fecha_salida) - new Date(b.fecha_salida))[0];

        const card = this.createStatCard('Próximo Viaje', ''); 
        card.classList.add('next-trip-card');
        
        const valueEl = card.querySelector('.stat-value');

        if (nextTrip) {
            const fecha = new Date(nextTrip.fecha_salida);
            const fechaStr = fecha.toLocaleString('es-AR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
            
            const routeSpan = document.createElement('span');
            routeSpan.className = 'route';
            routeSpan.textContent = `${nextTrip.origen} → ${nextTrip.destino}`;

            const dateSpan = document.createElement('span');
            dateSpan.className = 'date';
            dateSpan.textContent = fechaStr;
            
            const driverSpan = document.createElement('span');
            driverSpan.className = 'driver';
            driverSpan.textContent = `Conductor: ${nextTrip.conductor_name}`;

            valueEl.innerHTML = ''; 
            valueEl.append(routeSpan, dateSpan, driverSpan);

        } else {
            valueEl.textContent = 'No tienes viajes programados.';
            valueEl.style.fontSize = '1rem';
        }
        return card;
    }
    
    createHistoryCard() {
        const now = new Date();
        const completedTrips = this.passengerBookings
            .filter(b => b.estado === 'aceptada' && new Date(b.fecha_salida) < now).length;
        
        return this.createStatCard('Viajes Realizados', completedTrips);
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

customElements.define('passenger-panel-wc', PassengerPanelWC);