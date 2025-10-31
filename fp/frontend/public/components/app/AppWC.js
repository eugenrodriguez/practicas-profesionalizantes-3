//frontend/public/components/app/AppWC.js:
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
import '../dashboard/LiveTripWC.js'; 

import { api } from '../../services/api.js';

class AppWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.routeChangeHandler = this.routeChangeHandler.bind(this);

        this.routes = {
            '/': { component: 'login-form-wc', auth: false },
            '/login': { component: 'login-form-wc', auth: false },
            '/register': { component: 'register-choice-wc', auth: false },
            '/register/driver': { component: 'driver-register-wc', auth: false },
            '/register/passenger': { component: 'passenger-register-wc', auth: false },
            
            // Rutas que requieren autenticación
            '/dashboard': { component: 'dashboard-wc', auth: true }, 
            '/dashboard/create-trip': { component: 'create-trip-wc', auth: true },
            '/dashboard/my-trips': { component: 'my-trips-wc', auth: true },
            '/dashboard/requests': { component: 'trip-requests-wc', auth: true },
            '/dashboard/profile': { component: 'driver-profile-wc', auth: true },
            '/dashboard/search-trips': { component: 'search-trips-wc', auth: true },
            '/dashboard/my-bookings': { component: 'my-bookings-wc', auth: true },
            '/dashboard/passenger-profile': { component: 'passenger-profile-wc', auth: true },
            '/dashboard/live-trip': { component: 'live-trip-wc', auth: true }, // <- AÑADE ESTA RUTA
        };
        
        this.notFoundComponent = 'not-found-view'; 
    }

    connectedCallback() {
        this.routeChangeHandler();
        window.addEventListener('popstate', this.routeChangeHandler);
    }

    disconnectedCallback() {
        window.removeEventListener('popstate', this.routeChangeHandler);
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
        this.shadowRoot.innerHTML = '';

        const linkElem = document.createElement('link');
        linkElem.rel = 'stylesheet';
        linkElem.href = '/css/styles.css';

        const mainContainer = document.createElement('div');
        mainContainer.classList.add('app-main-content');

        if (componentName !== this.notFoundComponent) {
            const view = document.createElement(componentName);
            
            if (user) {
                view.user = user;
            }
            mainContainer.appendChild(view);
        } else {
            const nf = document.createElement('div');
            nf.style.cssText = "padding: 50px; text-align: center; color: #ff6b5a;";
            const t = document.createElement('h1');
            t.textContent = '404 | Página no encontrada';
            nf.appendChild(t);
            mainContainer.appendChild(nf);
        }

        this.shadowRoot.append(linkElem, mainContainer);
    }
}

customElements.define('app-wc', AppWC);