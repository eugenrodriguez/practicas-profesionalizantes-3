// frontend/public/components/dashboard/DashboardWC.js
import './DriverPanelWC.js'; 
import './PassengerPanelWC.js'; 
import '../logout/LogoutButtonWC.js';

class DashboardWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._user = null;
    }
    
    set user(userData) {
        this._user = userData;
        if (this.isConnected) {
            this.render();
        }
    }

    get user() {
        return this._user;
    }

    connectedCallback() {
        if (this.user) {
            this.render();
        }
    }

    render() {
        this.shadowRoot.innerHTML = '';

        this.style.transition = 'opacity 0.3s ease-in-out';
        this.style.opacity = '0';

        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '/components/dashboard/css/dashboard.css';
        styles.onload = () => { this.style.opacity = '1'; };
        
        const container = document.createElement('div');
        container.classList.add('dashboard-container');
        
        container.append(this.createHeader(), this.createPanel(), this.createFooter());
        this.shadowRoot.append(styles, container);
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

        const roles = this.user.roles;
        const currentRole = sessionStorage.getItem('currentRole');

        if (roles.includes('conductor') && roles.includes('pasajero')) {
            if (currentRole === 'conductor') {
                panel.appendChild(document.createElement('driver-panel-wc'));
            } else {
                panel.appendChild(document.createElement('passenger-panel-wc'));
            }
        } 
        else if (roles.includes('conductor')) {
            panel.appendChild(document.createElement('driver-panel-wc'));
        } else if (roles.includes('pasajero')) {
            panel.appendChild(document.createElement('passenger-panel-wc'));
        }

        return panel;
    }

    createFooter() {
        const footer = document.createElement('div');
        footer.classList.add('dashboard-footer');
        
        if (this.user.roles.includes('conductor') && this.user.roles.includes('pasajero')) {
            const switchBtn = document.createElement('button');
            switchBtn.textContent = 'Cambiar de Rol';
            switchBtn.classList.add('action-button');
            switchBtn.style.marginRight = '20px';
            switchBtn.addEventListener('click', () => {
                sessionStorage.removeItem('currentRole'); 
                window.location.href = '/dashboard'; 
            });
            footer.appendChild(switchBtn);
        }

        const logoutBtn = document.createElement('logout-button-wc');
        footer.appendChild(logoutBtn);
        return footer;
    }
}

customElements.define('dashboard-wc', DashboardWC);