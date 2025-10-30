// frontend/public/components/dashboard/MyTripsWC.js
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
        this.shadowRoot.innerHTML = '';

        this.style.transition = 'opacity 0.3s ease-in-out';
        this.style.opacity = '0';

        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '/components/dashboard/css/my-trips.css';

        styles.onload = () => {
            this.style.opacity = '1';
        };

        const mainContainer = document.createElement('div');
        mainContainer.classList.add('my-trips-container');

        const title = document.createElement('h2');
        title.textContent = 'Mis Viajes';

        mainContainer.appendChild(title);

        const res = await api.getMyTrips();
        if (!res.success) {
            const err = document.createElement('p');
            err.textContent = res.error || 'Error al cargar viajes';
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
            emptyTitle.textContent = 'No tienes viajes creados';
            const emptyText = document.createElement('p');
            emptyText.textContent = 'Comienza creando tu primer viaje solidario';
            emptyState.append(emptyTitle, emptyText);
            list.appendChild(emptyState);
        } else {
            this.trips.forEach(trip => {
                const card = document.createElement('div');
                card.classList.add('trip-card', `status-${trip.estado || 'pendiente'}`);

                const tripTitle = document.createElement('div');
                tripTitle.classList.add('trip-title');
                tripTitle.textContent = `${trip.origen} → ${trip.destino}`;
                
                const estadoActual = trip.estado || 'pendiente';
                const estadoCapitalized = estadoActual.charAt(0).toUpperCase() + estadoActual.slice(1);

                const meta = document.createElement('div');
                meta.classList.add('trip-meta');
                const fecha = new Date(trip.fecha_salida);
                
                const strongFecha = document.createElement('strong');
                strongFecha.textContent = fecha.toLocaleString('es-AR');
                const strongAsientos = document.createElement('strong');
                strongAsientos.textContent = trip.asientos_disponibles;
                const strongEstado = document.createElement('strong');
                strongEstado.classList.add('status-text');
                strongEstado.textContent = estadoCapitalized;

                meta.append('Salida: ', strongFecha, ' • Asientos: ', strongAsientos, ` • $${trip.precio}`, ' • Estado: ', strongEstado);

                const btns = document.createElement('div');
                btns.classList.add('trip-actions');

                if (estadoActual === 'pendiente') {
                    const publishBtn = document.createElement('button');
                    publishBtn.textContent = '📢 Publicar Viaje';
                    publishBtn.classList.add('publish-btn');
                    publishBtn.addEventListener('click', async () => {
                        if (!confirm('¿Seguro que quieres publicar este viaje?')) return;
                        publishBtn.disabled = true;
                        publishBtn.textContent = 'Publicando...';
                        const res = await api.updateTripStatus(trip.id, 'activo');
                        if (res.success) {
                            alert('¡Viaje publicado!');
                            this.load();
                        } else {
                            alert(res.error || 'No se pudo publicar el viaje');
                            publishBtn.disabled = false;
                            publishBtn.textContent = '📢 Publicar Viaje';
                        }
                    });
                    btns.appendChild(publishBtn);
                }

                // --- INICIO DE LA MODIFICACIÓN ---
                if (estadoActual === 'activo' || estadoActual === 'en_curso') {
                    const liveBtn = document.createElement('button');
                    liveBtn.textContent = 'Ver en Vivo 📍';
                    liveBtn.classList.add('live-btn');
                    liveBtn.addEventListener('click', () => {
                        const path = `/dashboard/live-trip?id=${trip.id}`;
                        window.history.pushState({}, '', path);
                        window.dispatchEvent(new Event('popstate'));
                    });
                    btns.appendChild(liveBtn);
                }
                // --- FIN DE LA MODIFICACIÓN ---

                const requestsBtn = document.createElement('button');
                requestsBtn.textContent = 'Ver Solicitudes';
                requestsBtn.addEventListener('click', () => {
                    window.history.pushState({}, '', `/dashboard/requests?trip=${trip.id}`);
                    window.dispatchEvent(new Event('popstate'));
                });

                btns.appendChild(requestsBtn);
                card.append(tripTitle, meta, btns);
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

        mainContainer.append(list, backBtn);
        this.shadowRoot.append(styles, mainContainer);
    }
}

customElements.define('my-trips-wc', MyTripsWC);