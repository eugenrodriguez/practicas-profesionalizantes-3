class DriverProfileWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.user = null;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = '';
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/components/dashboard/dashboard.css';
        this.shadowRoot.appendChild(link);

        const title = document.createElement('h2');
        title.textContent = 'Mi Perfil';

        const container = document.createElement('div');
        container.classList.add('profile-container');

        const name = document.createElement('div');
        name.textContent = `Nombre: ${this.user ? this.user.name : ''}`;

        const roles = document.createElement('div');
        roles.textContent = `Roles: ${this.user ? (this.user.roles || []).join(', ') : ''}`;

        container.append(name, roles);
        this.shadowRoot.append(title, container);
    }

    set data(user) {
        this.user = user;
        if (this.isConnected) this.render();
    }
}

customElements.define('conductor-profile', DriverProfileWC);
