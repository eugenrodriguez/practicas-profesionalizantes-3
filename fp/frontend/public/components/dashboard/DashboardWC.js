import './DriverPanelWC.js'; 
import './PassengerPanelWC.js'; 
import '../logout/LogoutButtonWC.js';

class RoleManager {
    static getDisplayRole(userRoles) {
        let savedRole = sessionStorage.getItem('currentRole');

        if (savedRole && !userRoles.includes(savedRole)) {
            sessionStorage.removeItem('currentRole');
            savedRole = null;
        }

        if (!savedRole && userRoles.length === 1) {
            return userRoles[0];
        }
        return savedRole;
    }

    static getRoleInfoText(userRoles, currentRole) {
        if (userRoles.length === 1) {
            return `Rol: ${userRoles[0].charAt(0).toUpperCase() + userRoles[0].slice(1)}`;
        } else if (userRoles.length > 1 && currentRole) {
            return `Actuando como: ${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}`;
        }
        return '';
    }

    static canSwitchRole(userRoles) {
        return userRoles.includes('conductor') && userRoles.includes('pasajero');
    }

    static clearCurrentRole() {
        sessionStorage.removeItem('currentRole');
    }
}

class DashboardView {
    constructor() {
        this.elements = {};
    }

    createDashboardContainer() {
        const container = document.createElement('div');
        container.classList.add('dashboard-container');
        this.elements.container = container;
        return container;
    }

    createHeader(userName, roleInfoText) {
        const header = document.createElement('div');
        header.classList.add('dashboard-header');
        
        const title = document.createElement('h1');
        title.textContent = `¡Bienvenido, ${userName}!`;

        const roleInfo = document.createElement('p');
        roleInfo.classList.add('role-info');
        roleInfo.textContent = roleInfoText;
        
        header.append(title, roleInfo);
        this.elements.header = header;
        return header;
    }

    createPanelContainer(roleToDisplay) {
        const panel = document.createElement('div');
        panel.classList.add('panel');

        if (roleToDisplay === 'conductor') {
            panel.appendChild(document.createElement('driver-panel-wc'));
        } else if (roleToDisplay === 'pasajero') {
            panel.appendChild(document.createElement('passenger-panel-wc'));
        }
        this.elements.panel = panel;
        return panel;
    }

    createFooter(canSwitchRole) {
        const footer = document.createElement('div');
        footer.classList.add('dashboard-footer');
        
        if (canSwitchRole) {
            const switchBtn = document.createElement('button');
            switchBtn.textContent = 'Cambiar de Rol';
            switchBtn.classList.add('action-button');
            switchBtn.style.marginRight = '20px';
            this.elements.switchRoleButton = switchBtn;
            footer.appendChild(switchBtn);
        }

        const logoutBtn = document.createElement('logout-button-wc');
        footer.appendChild(logoutBtn);
        this.elements.footer = footer;
        return footer;
    }
}

class DashboardWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._user = null;
        this.view = new DashboardView();
        this.handleSwitchRole = this.handleSwitchRole.bind(this);
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

    disconnectedCallback() {
        this.removeEvents();
    }

    render() {
        while (this.shadowRoot.firstChild) {
            this.shadowRoot.removeChild(this.shadowRoot.firstChild);
        }

        this.style.transition = 'opacity 0.3s ease-in-out';
        this.style.opacity = '0';

        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '/components/dashboard/css/dashboard.css';
        styles.onload = () => { this.style.opacity = '1'; };
        
        const dashboardContainer = this.view.createDashboardContainer();
        
        if (this.user) {
            const currentRole = RoleManager.getDisplayRole(this.user.roles);
            const roleInfoText = RoleManager.getRoleInfoText(this.user.roles, currentRole);
            const canSwitch = RoleManager.canSwitchRole(this.user.roles);

            dashboardContainer.append(
                this.view.createHeader(this.user.name, roleInfoText),
                this.view.createPanelContainer(currentRole),
                this.view.createFooter(canSwitch)
            );

            this.addEvents();
        }
        
        this.shadowRoot.append(styles, dashboardContainer);
    }

    addEvents() {
        if (this.view.elements.switchRoleButton) {
            this.view.elements.switchRoleButton.addEventListener('click', this.handleSwitchRole);
        }
    }

    removeEvents() {
        if (this.view.elements.switchRoleButton) {
            this.view.elements.switchRoleButton.removeEventListener('click', this.handleSwitchRole);
        }
    }

    handleSwitchRole() {
        RoleManager.clearCurrentRole();
        window.location.href = '/dashboard';
    }
}

customElements.define('dashboard-wc', DashboardWC);