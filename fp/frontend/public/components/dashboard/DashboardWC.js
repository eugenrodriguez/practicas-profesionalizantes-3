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
        
        if (this.user) {
            container.append(this.createHeader(), this.createPanel(), this.createFooter());
        }
        
        this.shadowRoot.append(styles, container);
    }

    createHeader() {
        const header = document.createElement('div');
        header.classList.add('dashboard-header');
        const title = document.createElement('h1');
        title.textContent = `¡Bienvenido, ${this.user.name}!`;

        const roleInfo = document.createElement('p');
        roleInfo.classList.add('role-info');
        
        const savedRole = sessionStorage.getItem('currentRole');
        const roles = this.user.roles;
        let activeRoleText = '';

        if (roles.length === 1) {
            activeRoleText = `Rol: ${roles[0].charAt(0).toUpperCase() + roles[0].slice(1)}`;
        } 
        else if (roles.length > 1 && savedRole) {
            activeRoleText = `Actuando como: ${savedRole.charAt(0).toUpperCase() + savedRole.slice(1)}`;
        }
        
        roleInfo.textContent = activeRoleText;
        header.append(title, roleInfo);
        return header;
    }

    createPanel() {
        const panel = document.createElement('div');
        panel.classList.add('panel');

        const roles = this.user.roles;
        let savedRole = sessionStorage.getItem('currentRole');


        if (savedRole && !roles.includes(savedRole)) {
            sessionStorage.removeItem('currentRole');
            savedRole = null; 
        }

        let roleToDisplay = savedRole;
        if (!roleToDisplay && roles.length === 1) {
            roleToDisplay = roles[0];
        }

        if (roleToDisplay === 'conductor') {
            panel.appendChild(document.createElement('driver-panel-wc'));
        } else if (roleToDisplay === 'pasajero') {
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