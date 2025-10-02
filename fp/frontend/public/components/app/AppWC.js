// frontend/public/components/app/AppWC.js
import '../login/LoginFormWC.js';
import '../register/RegisterChoiceWC.js';
import '../register/DriverRegisterWC.js';
import '../register/PassengerRegisterWC.js';
import '../logout/LogoutButtonWC.js';
import { AuthService } from '../../services/AuthService.js';

class AppWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.routeChangeHandler = this.routeChangeHandler.bind(this);
    }

    connectedCallback() {
        this.routeChangeHandler();
        window.addEventListener('popstate', this.routeChangeHandler);
        window.addEventListener('navigate', this.routeChangeHandler);
    }

    disconnectedCallback() {
        window.removeEventListener('popstate', this.routeChangeHandler);
        window.removeEventListener('navigate', this.routeChangeHandler);
    }

    async routeChangeHandler() {
        const path = window.location.pathname;

        if (path === '/' || path === '/login' || path.startsWith('/register')) {
            this.renderView(path, null);
            return;
        }

        if (path === '/dashboard') {
            try {
                const authStatus = await AuthService.checkStatus();
                if (authStatus.isAuthenticated) {
                    this.renderView(path, authStatus.user);
                } else {
                    window.history.pushState({}, '', '/login');
                    window.dispatchEvent(new Event('popstate'));
                }
            } catch (error) {
                console.error(error);
                window.history.pushState({}, '', '/login');
                window.dispatchEvent(new Event('popstate'));
            }
            return;
        }

        // 404
        this.renderView(path, null);
    }

    renderView(path, user = null) {
        this.shadowRoot.innerHTML = ''; // limpiar

        const linkElem = document.createElement('link');
        linkElem.rel = 'stylesheet';
        linkElem.href = '/css/styles.css';

        const mainContainer = document.createElement('div');

        if (path === '/' || path === '/login') {
            const loginComp = document.createElement('login-form');
            mainContainer.appendChild(loginComp);
        } else if (path.startsWith('/register')) {
            if (path === '/register/driver') {
                const driverComp = document.createElement('driver-register');
                mainContainer.appendChild(driverComp);
            } else if (path === '/register/passenger') {
                const passengerComp = document.createElement('passenger-register');
                mainContainer.appendChild(passengerComp);
            } else {
                const choiceComp = document.createElement('register-choice');
                mainContainer.appendChild(choiceComp);
            }
        } else if (path === '/dashboard') {
            mainContainer.classList.add('dashboard-container');

            const title = document.createElement('h1');
            title.textContent = `¡Bienvenido al Dashboard! ${user ? user.name : ''}`;

            const logoutBtn = document.createElement('logout-button-wc');

            mainContainer.append(title, logoutBtn);
        } else {
            mainContainer.classList.add('not-found-container');
            const title = document.createElement('h1');
            title.textContent = '404 | Página no encontrada';
            mainContainer.appendChild(title);
        }

        this.shadowRoot.append(linkElem, mainContainer);
    }
}

customElements.define('app-wc', AppWC);
