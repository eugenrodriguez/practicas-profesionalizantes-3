// frontend/public/components/dashboard/DriverProfileWC.js
import { api } from '../../services/api.js';

class DriverProfileWC extends HTMLElement {
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
        const form = this.shadowRoot.getElementById('profile-form');
        if (form) form.removeEventListener('submit', this.handleSubmit);
    }

    async loadProfile() {
        const res = await api.getProfile();
        if (res.success) {
            this.user = res.user;
            this.render();
        } else {
            this.shadowRoot.innerHTML = `<p>Error al cargar el perfil: ${res.error}</p>`;
        }
    }

    render() {
        this.shadowRoot.innerHTML = '';

        this.style.transition = 'opacity 0.3s ease-in-out';
        this.style.opacity = '0';
        
        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '/components/dashboard/css/driver-profile.css'; 

        styles.onload = () => {
            this.style.opacity = '1'; 
        };
        const container = document.createElement('div');
        container.classList.add('profile-container');

        const title = document.createElement('h2');
        title.textContent = 'Mi Perfil';

        const form = document.createElement('form');
        form.id = 'profile-form';

        const basicSection = document.createElement('div');
        basicSection.classList.add('profile-section');
        const basicTitle = document.createElement('h3');
        basicTitle.textContent = 'Información Personal';
        const nameGroup = this.createFormGroup('Nombre', 'name', 'text', this.user.name);
        const emailGroup = this.createFormGroup('Email', 'email', 'email', this.user.email, true);
        emailGroup.querySelector('.info-text').textContent = 'El email no se puede modificar.';
        basicSection.append(basicTitle, nameGroup, emailGroup);
        form.appendChild(basicSection);

        if (this.user && this.user.roles.includes('conductor')) {
            const conductorSection = document.createElement('div');
            conductorSection.classList.add('profile-section');

            const conductorTitle = document.createElement('h3');
            conductorTitle.textContent = 'Datos del Conductor';

            const vehiculoGroup = this.createFormGroup('Vehículo', 'vehiculo', 'text', this.user.vehiculo || '');
            
            const patenteGroup = this.createFormGroup('Patente', 'patente', 'text', this.user.patente || '');
            
            const licenciaGroup = this.createFormGroup('Licencia', 'licencia', 'text', this.user.licencia || '', true);
            licenciaGroup.querySelector('.info-text').textContent = 'La licencia no se puede modificar.';

            conductorSection.append(conductorTitle, vehiculoGroup, patenteGroup, licenciaGroup);
            form.appendChild(conductorSection);
        }

        const passwordSection = document.createElement('div');
        passwordSection.classList.add('profile-section', 'password-section');
        const passwordTitle = document.createElement('h3');
        passwordTitle.textContent = 'Cambiar Contraseña';
        const currentPasswordGroup = this.createFormGroup('Contraseña Actual', 'currentPassword', 'password', '');
        const newPasswordGroup = this.createFormGroup('Nueva Contraseña', 'newPassword', 'password', '');
        const confirmPasswordGroup = this.createFormGroup('Confirmar Nueva Contraseña', 'confirmPassword', 'password', '');
        const passwordInfo = document.createElement('p');
        passwordInfo.classList.add('info-text');
        passwordInfo.textContent = 'Deja estos campos vacíos si no deseas cambiar tu contraseña.';
        passwordSection.append(passwordTitle, currentPasswordGroup, newPasswordGroup, confirmPasswordGroup, passwordInfo);
        form.appendChild(passwordSection);

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
        form.appendChild(buttonGroup);

        container.append(title, form);
        this.shadowRoot.append(styles, container);
        form.addEventListener('submit', this.handleSubmit);
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

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const submitBtn = this.shadowRoot.getElementById('submit-btn');

        const newPassword = form.newPassword.value;
        const confirmPassword = form.confirmPassword.value;
        if (newPassword !== confirmPassword) {
            this.showAlert('Las contraseñas nuevas no coinciden', 'error');
            return;
        }

        const data = {
            name: form.name.value,
        };

        if (this.user.roles.includes('conductor')) {
            data.vehiculo = form.vehiculo.value;
            data.patente = form.patente.value;
        }

        if (newPassword) {
            data.currentPassword = form.currentPassword.value;
            data.newPassword = newPassword;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando...';

        const res = await api.updateProfile(data);

        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Cambios';

        if (res.success) {
            this.showAlert('Perfil actualizado correctamente', 'success');
            setTimeout(() => this.loadProfile(), 2000);
        } else {
            this.showAlert(res.error || 'Error al actualizar perfil', 'error');
        }
    }

    showAlert(message, type) {
        const existingAlert = this.shadowRoot.querySelector('.alert');
        if (existingAlert) existingAlert.remove();

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;

        const container = this.shadowRoot.querySelector('.profile-container');
        container.insertBefore(alert, container.children[1]);

        setTimeout(() => alert.remove(), 5000);
    }
}

customElements.define('driver-profile-wc', DriverProfileWC);