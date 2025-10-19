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
import { api } from '../../services/api.js';

class AppWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.routeChangeHandler = this.routeChangeHandler.bind(this);
        this.routes = {
            '/': 'login-form',
            '/login': 'login-form',
            '/register': 'register-choice',
            '/register/driver': 'driver-register',
            '/register/passenger': 'passenger-register',
            '/dashboard': 'dashboard-view',
            '/dashboard/create-trip': 'create-trip',
            '/dashboard/my-trips': 'my-trips',
            '/dashboard/requests': 'trip-requests',
            '/dashboard/profile': 'conductor-profile'
        };
    }

    connectedCallback() {
        this.routeChangeHandler();
        window.addEventListener('popstate', this.routeChangeHandler);
    }

    disconnectedCallback() {
        window.removeEventListener('popstate', this.routeChangeHandler);
    }

    async routeChangeHandler() {
        const path = window.location.pathname;
        // si la URL es /dashboard/requests?trip=ID -> usamos path '/dashboard/requests'
        const basePath = path.startsWith('/dashboard/requests') ? '/dashboard/requests' : path;
        const componentName = this.routes[basePath] || 'not-found-view';

        if (componentName === 'dashboard-view' || componentName.startsWith('my-') || componentName === 'create-trip' || componentName === 'trip-requests' || componentName === 'conductor-profile') {
            // autenticación requerida
            try {
                const authStatus = await api.checkStatus();
                if (authStatus.success || authStatus.isAuthenticated || authStatus.user) {
                    // normalizo user en authStatus.user
                    const user = authStatus.user || authStatus;
                    this.renderView(componentName, user);
                } else {
                    window.history.pushState({}, '', '/login');
                    window.dispatchEvent(new Event('popstate'));
                }
            } catch (error) {
                console.error(error);
                window.history.pushState({}, '', '/login');
                window.dispatchEvent(new Event('popstate'));
            }
        } else {
            this.renderView(componentName);
        }
    }

    renderView(componentName, user = null) {
        this.shadowRoot.innerHTML = '';

        const linkElem = document.createElement('link');
        linkElem.rel = 'stylesheet';
        linkElem.href = '/css/styles.css';

        const mainContainer = document.createElement('div');

        switch (componentName) {
            case 'login-form':
            case 'register-choice':
            case 'driver-register':
            case 'passenger-register':
                mainContainer.appendChild(document.createElement(componentName));
                break;

            case 'dashboard-view': {
                const dashboard = document.createElement('dashboard-view');
                dashboard.data = user;
                mainContainer.appendChild(dashboard);
                break;
            }

            case 'create-trip': {
                const create = document.createElement('create-trip');
                mainContainer.appendChild(create);
                break;
            }

            case 'my-trips': {
                const my = document.createElement('my-trips');
                mainContainer.appendChild(my);
                break;
            }

            case 'trip-requests': {
                const reqs = document.createElement('trip-requests');
                mainContainer.appendChild(reqs);
                break;
            }

            case 'conductor-profile': {
                const prof = document.createElement('conductor-profile');
                // si quieres pasar user al profile:
                if (user) prof.data = user;
                mainContainer.appendChild(prof);
                break;
            }

            default: {
                const nf = document.createElement('div');
                const t = document.createElement('h1');
                t.textContent = '404 | Página no encontrada';
                nf.appendChild(t);
                mainContainer.appendChild(nf);
            }
        }

        this.shadowRoot.append(linkElem, mainContainer);
    }
}

customElements.define('app-wc', AppWC);
