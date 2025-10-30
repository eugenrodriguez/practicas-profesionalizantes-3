//frontend/public/components/register/PassengerRegisterWC.js:
import { api } from '../../services/api.js';

class PassengerRegisterWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.handleSubmit = this.handleSubmit.bind(this);
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

        this.style.transition = 'opacity 0.3s ease-in-out';
        this.style.opacity = '0';

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/components/register/register.css';

        link.onload = () => {
        // Cuando el CSS esta cargado completamente, mostramos el componente.
            this.style.opacity = '1'; 
        };

        const container = document.createElement('div');
        container.classList.add('form-container');

        const title = document.createElement('h1');
        title.textContent = 'Registro Pasajero';

        const form = document.createElement('form');
        form.id = 'passenger-register-form';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.name = 'name';
        nameInput.placeholder = 'Nombre completo';
        nameInput.required = true;

        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.name = 'email';
        emailInput.placeholder = 'Correo electrónico';
        emailInput.required = true;

        const telefonoInput = document.createElement('input');
        telefonoInput.type = 'text';
        telefonoInput.name = 'telefono';
        telefonoInput.placeholder = 'Teléfono';
        telefonoInput.required = true;

        const direccionInput = document.createElement('input');
        direccionInput.type = 'text';
        direccionInput.name = 'direccion';
        direccionInput.placeholder = 'Dirección';
        direccionInput.required = true;

        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.name = 'password';
        passwordInput.placeholder = 'Contraseña';
        passwordInput.required = true;

        const submit = document.createElement('button');
        submit.type = 'submit';
        submit.textContent = 'Registrarse';
        submit.id = 'submit-btn';

        form.append(
            nameInput,
            emailInput,
            telefonoInput,
            direccionInput,
            passwordInput,
            submit
        );

        const alt = document.createElement('p');
        alt.classList.add('alternativa');
        const altLink = document.createElement('a');
        altLink.href = '/login';
        altLink.textContent = 'Iniciar sesión';
        alt.textContent = 'Si ya tienes una cuenta ingresa a: ';
        alt.appendChild(altLink);

        container.append(title, form, alt);
        this.shadowRoot.append(link, container);
    }

    addEvents() {
        const form = this.shadowRoot.getElementById('passenger-register-form');
        if (form) form.addEventListener('submit', this.handleSubmit);
    }

    removeEvents() {
        const form = this.shadowRoot.getElementById('passenger-register-form');
        if (form) form.removeEventListener('submit', this.handleSubmit);
    }

    async handleSubmit(e) {
        e.preventDefault();

        const form = e.currentTarget;
        const name = form.name.value;
        const email = form.email.value;
        const telefono = form.telefono.value;
        const direccion = form.direccion.value;
        const password = form.password.value;

        const submitBtn = this.shadowRoot.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registrando...';

        const result = await api.registerPassenger(
            name,
            email,
            password,
            telefono,
            direccion
        );

        submitBtn.disabled = false;
        submitBtn.textContent = 'Registrarse';

        if (result.success) {
            alert(`${result.message}. Usuario: ${result.user.name}`);
            window.history.pushState({}, '', '/login');
            window.dispatchEvent(new Event('popstate'));
        } else {
            alert(result.error);
        }
    }
}

customElements.define('passenger-register-wc', PassengerRegisterWC);