// frontend/public/components/dashboard/PassengerProfileWC.js
import { api } from '../../services/api.js';

class PassengerProfileWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.user = null;
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    connectedCallback() {
        this.loadProfile();
    }

    disconnectedCallback() {
        this.removeEvents();
    }

    async loadProfile() {
        const res = await api.getProfile();
        if (res.success) {
            this.user = res.user;
            this.render();
            this.addEvents();
        } else {
            alert('Error al cargar perfil');
        }
    }

    render() {
        this.shadowRoot.innerHTML = '';

        this.style.transition = 'opacity 0.3s ease-in-out';
        this.style.opacity = '0';

        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '/components/dashboard/css/passenger-profile.css';

        styles.onload = () => {
            this.style.opacity = '1';
        };

        const container = document.createElement('div');
        container.classList.add('profile-container');

        const title = document.createElement('h2');
        title.textContent = 'Mi Perfil';

        const form = document.createElement('form');
        form.id = 'profile-form';

        // Información básica
        const basicSection = document.createElement('div');
        basicSection.classList.add('profile-section');

        const basicTitle = document.createElement('h3');
        basicTitle.textContent = 'Información Personal';

        const nameGroup = this.createFormGroup('Nombre', 'name', 'text', this.user.name);
        const emailGroup = this.createFormGroup('Email', 'email', 'email', this.user.email, true);
        emailGroup.querySelector('.info-text').textContent = 'El email no se puede modificar';

        basicSection.append(basicTitle, nameGroup, emailGroup);

        const passengerSection = document.createElement('div');
        passengerSection.classList.add('profile-section');

        const passengerTitle = document.createElement('h3');
        passengerTitle.textContent = 'Datos de Contacto';

        const telefonoGroup = this.createFormGroup('Teléfono', 'telefono', 'tel', this.user.telefono || '');
        const direccionGroup = this.createFormGroup('Dirección', 'direccion', 'text', this.user.direccion || '');

        passengerSection.append(passengerTitle, telefonoGroup, direccionGroup);

        const passwordSection = document.createElement('div');
        passwordSection.classList.add('profile-section', 'password-section');

        const passwordTitle = document.createElement('h3');
        passwordTitle.textContent = 'Cambiar Contraseña';

        const currentPasswordGroup = this.createFormGroup('Contraseña Actual', 'currentPassword', 'password', '');
        const newPasswordGroup = this.createFormGroup('Nueva Contraseña', 'newPassword', 'password', '');
        const confirmPasswordGroup = this.createFormGroup('Confirmar Nueva Contraseña', 'confirmPassword', 'password', '');

        const passwordInfo = document.createElement('p');
        passwordInfo.classList.add('info-text');
        passwordInfo.textContent = 'Deja estos campos vacíos si no deseas cambiar tu contraseña';

        passwordSection.append(passwordTitle, currentPasswordGroup, newPasswordGroup, confirmPasswordGroup, passwordInfo);

        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('button-group');

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.textContent = 'Guardar Cambios';
        submitBtn.id = 'submit-btn';

        const backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.classList.add('back-btn');
        backBtn.textContent = '← Volver al Dashboard';
        backBtn.addEventListener('click', () => {
            window.history.pushState({}, '', '/dashboard');
            window.dispatchEvent(new Event('popstate'));
        });

        buttonGroup.append(submitBtn, backBtn);

        form.append(basicSection, passengerSection, passwordSection, buttonGroup);
        container.append(title, form);
        this.shadowRoot.append(styles, container);
    }

    createFormGroup(labelText, name, type, value, disabled = false) {
        const group = document.createElement('div');
        group.classList.add('form-group');

        const label = document.createElement('label');
        label.textContent = labelText;
        label.setAttribute('for', name);

        const input = document.createElement('input');
        input.type = type;
        input.name = name;
        input.id = name;
        input.value = value;
        input.disabled = disabled;

        const infoText = document.createElement('p');
        infoText.classList.add('info-text');

        group.append(label, input, infoText);
        return group;
    }

    addEvents() {
        const form = this.shadowRoot.getElementById('profile-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit);
        }
    }

    removeEvents() {
        const form = this.shadowRoot.getElementById('profile-form');
        if (form) {
            form.removeEventListener('submit', this.handleSubmit);
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        const form = e.currentTarget;
        const submitBtn = this.shadowRoot.getElementById('submit-btn');

        const name = form.name.value;
        const telefono = form.telefono.value;
        const direccion = form.direccion.value;
        const currentPassword = form.currentPassword.value;
        const newPassword = form.newPassword.value;
        const confirmPassword = form.confirmPassword.value;

        // Validar contraseñas
        if (newPassword || confirmPassword) {
            if (!currentPassword) {
                this.showAlert('Debes ingresar tu contraseña actual', 'error');
                return;
            }

            if (newPassword !== confirmPassword) {
                this.showAlert('Las contraseñas nuevas no coinciden', 'error');
                return;
            }

            if (newPassword.length < 6) {
                this.showAlert('La nueva contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }
        }

        const data = {
            name,
            telefono,
            direccion
        };

        if (newPassword) {
            data.currentPassword = currentPassword;
            data.newPassword = newPassword;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando...';

        const res = await api.updateProfile(data);

        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Cambios';

        if (res.success) {
            this.showAlert('Perfil actualizado correctamente', 'success');
            form.currentPassword.value = '';
            form.newPassword.value = '';
            form.confirmPassword.value = '';
            
            setTimeout(() => {
                this.loadProfile();
            }, 2000);
        } else {
            this.showAlert(res.error || 'Error al actualizar perfil', 'error');
        }
    }

    showAlert(message, type) {
        const existingAlert = this.shadowRoot.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alert = document.createElement('div');
        alert.classList.add('alert', `alert-${type}`);
        alert.textContent = message;

        const container = this.shadowRoot.querySelector('.profile-container');
        const title = container.querySelector('h2');
        container.insertBefore(alert, title.nextSibling);

        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    set data(user) {
        this.user = user;
        if (this.isConnected) {
            this.render();
            this.addEvents();
        }
    }
}

customElements.define('passenger-profile-wc', PassengerProfileWC);