class RoleChoiceWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.roleButtons = [];
    }

    connectedCallback() {
        this.render();
        this.addEvents();
    }

    render() {
        this.shadowRoot.innerHTML = '';
        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '/components/dashboard/css/dashboard.css'; 

        const container = document.createElement('div');
        container.classList.add('role-choice-container'); 
        container.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh;';

        const logo = document.createElement('img');
        logo.src = '/img/logo.png';
        logo.alt = 'CaminoComun Logo';
        logo.style.cssText = 'width: 300px; margin-bottom: 20px;';

        const title = document.createElement('h1');
        title.textContent = 'Selecciona tu rol';
        title.style.marginBottom = '30px';

        const driverBtn = this.createRoleButton('Ingresar como Conductor', 'conductor');
        const passengerBtn = this.createRoleButton('Ingresar como Pasajero', 'pasajero');

        this.roleButtons = [driverBtn, passengerBtn];

        container.append(logo, title, driverBtn, passengerBtn);
        this.shadowRoot.append(styles, container);
    }

    createRoleButton(text, role) {
        const button = document.createElement('button');
        button.textContent = text;
        button.dataset.role = role;
        button.classList.add('action-button'); 
        button.style.width = '300px';
        button.style.marginBottom = '15px';
        return button;
    }

    addEvents() {
        this.roleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const role = e.target.dataset.role;
                sessionStorage.setItem('currentRole', role);
                window.history.pushState({}, '', '/dashboard');
                window.dispatchEvent(new Event('popstate'));
            });
        });
    }
}

customElements.define('role-choice-wc', RoleChoiceWC);