// frontend/public/components/logout/LogoutButtonWC.js
import { api } from '../../services/api.js';

class LogoutButtonWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.handleLogout = this.handleLogout.bind(this);
    }

    connectedCallback() {
        this.render();
        this.addEvents();
    }

    disconnectedCallback() {
        this.removeEvents();
    }

    render() {
        this.shadowRoot.innerHTML = '';

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/components/logout/logout.css';

        const button = document.createElement('button');
        button.textContent = 'Cerrar Sesión';
        button.id = 'logout-btn';

        this.shadowRoot.append(link, button);
    }

    addEvents() {
        const button = this.shadowRoot.getElementById('logout-btn');
        if (button) button.addEventListener('click', this.handleLogout);
    }

    removeEvents() {
        const button = this.shadowRoot.getElementById('logout-btn');
        if (button) button.removeEventListener('click', this.handleLogout);
    }

    async handleLogout() {
        const result = await api.logout();

        if (result.success) {
            alert('Sesión cerrada correctamente.');
            
            window.history.pushState(null, '', '/login');
            
            window.addEventListener('popstate', function preventBack(e) {
                window.history.pushState(null, '', '/login');
            });
            
            window.location.replace('/login');
        } else {
            alert(result.error);
        }
    }
}

customElements.define('logout-button-wc', LogoutButtonWC);