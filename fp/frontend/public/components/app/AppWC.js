import '../login/LoginFormWC.js';
import '../register/RegisterChoiceWC.js';
import '../register/DriverRegisterWC.js';
import '../register/PassengerRegisterWC.js';
import '../logout/LogoutButtonWC.js';
import '../dashboard/DashboardWC.js';
import '../dashboard/CreateTripWC.js';
import '../dashboard/MyTripsWC.js';
import '../dashboard/TripRequestsWC.js';
import '../dashboard/DriverProfileWC.js';
import '../dashboard/SearchTripsWC.js';
import '../dashboard/MyBookingsWC.js';
import '../dashboard/PassengerProfileWC.js';
import '../dashboard/RoleChoiceWC.js'; 
import '../dashboard/PassengerTripDetailsWC.js';
import '../dashboard/LiveTripWC.js'; 
import { api } from '../../services/api.js';
import { socketService } from '../../services/socketService.js'; 
import { Toast } from '../../utils/Toast.js';

class AppWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.routeChangeHandler = this.routeChangeHandler.bind(this);
        this.mainContainer = null;
    
        this.routes = {
            '/': { component: 'login-form-wc', auth: false },
            '/login': { component: 'login-form-wc', auth: false },
            '/register': { component: 'register-choice-wc', auth: false },
            '/register/driver': { component: 'driver-register-wc', auth: false },
            '/register/passenger': { component: 'passenger-register-wc', auth: false },
            
            '/dashboard': { component: 'dashboard-wc', auth: true }, 
            '/dashboard/create-trip': { component: 'create-trip-wc', auth: true },
            '/dashboard/my-trips': { component: 'my-trips-wc', auth: true },
            '/dashboard/requests': { component: 'trip-requests-wc', auth: true },
            '/dashboard/profile': { component: 'driver-profile-wc', auth: true },
            '/dashboard/search-trips': { component: 'search-trips-wc', auth: true },
            '/dashboard/my-bookings': { component: 'my-bookings-wc', auth: true },
            '/dashboard/passenger-profile': { component: 'passenger-profile-wc', auth: true },
            '/dashboard/live-trip': { component: 'live-trip-wc', auth: true },
        };
        
        this.notFoundComponent = 'not-found-view'; 
    }

    connectedCallback() {
        console.log('Inicializando aplicación...');
        socketService.connect();
        console.log('Socket global inicializado');

        this.renderLayout();
        this.routeChangeHandler();
        this.setupGlobalSocketListeners();
        window.addEventListener('popstate', this.routeChangeHandler);

        window.addEventListener('online', () => {
            console.log('Conexión a internet restaurada, reconectando socket...');
            socketService.connect();
        });
    }

    disconnectedCallback() {
        window.removeEventListener('popstate', this.routeChangeHandler);
        socketService.removeComponentListeners([
            { event: 'bookingAccepted' },
            { event: 'tripHasStarted' },
            { event: 'tripCancelled' },
            { event: 'newBookingRequest' },
            { event: 'bookingRejected' }
        ]);
    }

    setupGlobalSocketListeners() {
        socketService.on('bookingAccepted', (data) => {
            Toast.show(`¡Tu reserva para el viaje a ${data.tripDestination} fue aceptada!`, 'success');
        });

        socketService.on('tripHasStarted', (data) => {
            Toast.show(`¡El viaje hacia ${data.tripDestination} ha comenzado!`, 'info');
        });

        socketService.on('tripCancelled', (data) => {
            Toast.show(`El viaje de ${data.tripOrigin} a ${data.tripDestination} fue cancelado por el conductor.`, 'warning');
        });

        socketService.on('newBookingRequest', (data) => {
            Toast.show(`¡Tienes una nueva solicitud de viaje de ${data.passengerName}!`, 'info');
        });

        socketService.on('bookingRejected', (data) => {
            Toast.show(`Tu solicitud para el viaje a ${data.tripDestination} fue rechazada.`, 'warning');
        });
    }

    renderLayout() {
        const styles = document.createElement('style');
        styles.textContent = `
            .logo {
                display: block;
                margin-top: 20px;
                margin-bottom: 20px;
                margin-left: auto;
                margin-right: auto;
                width: 300px;
                max-width: 80%;
            }
        `;

        const logo = document.createElement('img');
        logo.src = '/img/logo.png';
        logo.alt = 'CaminoComun Logo';
        logo.classList.add('logo');

        this.mainContainer = document.createElement('div');
        this.mainContainer.classList.add('app-main-content');

        const linkElem = document.createElement('link');
        linkElem.rel = 'stylesheet';
        linkElem.href = '/css/styles.css';

        this.shadowRoot.append(styles, linkElem, logo, this.mainContainer);
    }

    navigateTo(path) {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new Event('popstate'));
    }

    getRouteInfo(path) {
        const basePath = path.split('?')[0];        
        return this.routes[basePath] || { component: this.notFoundComponent, auth: false };
    }

    async routeChangeHandler() {
        const path = window.location.pathname;
        const routeInfo = this.getRouteInfo(path);

        if (routeInfo.auth) {
            try {
                const authStatus = await api.checkStatus();
                if (authStatus.isAuthenticated && authStatus.user) {
                    const user = authStatus.user;
                    
                    if (path === '/dashboard') {
                        const roles = user.roles;
                        const savedRole = sessionStorage.getItem('currentRole');

                        if (roles.includes('conductor') && roles.includes('pasajero')) {
                            if (savedRole) {
                                this.renderView('dashboard-wc', user);
                            } else {
                                this.renderView('role-choice-wc', user);
                            }
                        } 
                        else {
                            this.renderView('dashboard-wc', user);
                        }
                    } else {
                        this.renderView(routeInfo.component, user);
                    }
                } else {
                    this.navigateTo('/login');
                }
            } catch (error) {
                console.error("Error de autenticación:", error);
                this.navigateTo('/login');
            }
        } else {
            this.renderView(routeInfo.component);
        }
    }

    renderView(componentName, user = null) {
        if (!this.mainContainer) this.renderLayout();
        this.mainContainer.innerHTML = '';

        if (componentName !== this.notFoundComponent) {
            const view = document.createElement(componentName);
            
            if (user) {
                view.user = user;
            }
            this.mainContainer.appendChild(view);
        } else {
            const nf = document.createElement('div');
            nf.style.cssText = "padding: 50px; text-align: center; color: #ff6b5a;";
            const t = document.createElement('h1');
            t.textContent = '404 | Página no encontrada';
            nf.appendChild(t);
            this.mainContainer.appendChild(nf);
        }
    }
}

customElements.define('app-wc', AppWC);