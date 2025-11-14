import { api } from '../../services/api.js';

class ProfileService {
    static async getProfile() {
        return await api.getProfile();
    }

    static async updateProfile(data) {
        return await api.updateProfile(data);
    }
}

class ProfileValidator {
    static validatePassword(newPassword, confirmPassword) {
        if (newPassword !== confirmPassword) {
            return 'Las contraseñas nuevas no coinciden';
        }
        if (newPassword) {
            const passwordRequirements = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]).{8,16}$/;
            if (!passwordRequirements.test(newPassword)) {
                return 'La nueva contraseña debe tener 8-16 caracteres, una mayúscula, un número y un símbolo.';
            }
        }
        return null; 
    }
}

class DriverProfileView {
    constructor() {
        this.elements = {};
        this.elements.alert = null;
    }

    render(user) {
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
        const { group: nameGroup } = this.createFormGroup('Nombre', 'name', 'text', user.name);
        const { group: emailGroup, infoText: emailInfoText } = this.createFormGroup('Email', 'email', 'email', user.email, true);
        emailInfoText.textContent = 'El email no se puede modificar.';
        basicSection.append(basicTitle, nameGroup, emailGroup);
        form.appendChild(basicSection);

        if (user && user.roles.includes('conductor')) {
            const conductorSection = document.createElement('div');
            conductorSection.classList.add('profile-section');

            const conductorTitle = document.createElement('h3');
            conductorTitle.textContent = 'Datos del Conductor';

            const { group: vehiculoGroup } = this.createFormGroup('Vehículo', 'vehiculo', 'text', user.vehiculo || '');
            const { group: patenteGroup } = this.createFormGroup('Patente', 'patente', 'text', user.patente || '');
            const { group: licenciaGroup, infoText: licenciaInfoText } = this.createFormGroup('Licencia', 'licencia', 'text', user.licencia || '', true);
            licenciaInfoText.textContent = 'La licencia no se puede modificar.';
            
            conductorSection.append(conductorTitle, vehiculoGroup, patenteGroup, licenciaGroup);
            form.appendChild(conductorSection);
        }

        const passwordToggleSection = document.createElement('div');
        passwordToggleSection.classList.add('profile-section');

        const togglePasswordBtn = document.createElement('button');
        togglePasswordBtn.type = 'button';
        togglePasswordBtn.textContent = 'Cambiar Contraseña';
        togglePasswordBtn.classList.add('toggle-password-btn');

        const passwordFieldsContainer = document.createElement('div');
        passwordFieldsContainer.classList.add('password-fields-container');
        passwordFieldsContainer.style.display = 'none'; 

        const passwordTitle = document.createElement('h3');
        passwordTitle.textContent = 'Cambiar Contraseña';
        const { group: currentPasswordGroup } = this.createFormGroup('Contraseña Actual', 'currentPassword', 'password', '');
        const { group: newPasswordGroup } = this.createFormGroup('Nueva Contraseña', 'newPassword', 'password', '');
        const { group: confirmPasswordGroup } = this.createFormGroup('Confirmar Nueva Contraseña', 'confirmPassword', 'password', '');
        
        const passwordInfo = document.createElement('p');
        passwordInfo.classList.add('info-text');
        passwordInfo.textContent = 'Deja estos campos vacíos si no deseas cambiar tu contraseña.';

        passwordFieldsContainer.append(passwordTitle, currentPasswordGroup, newPasswordGroup, confirmPasswordGroup, passwordInfo);
        passwordToggleSection.append(togglePasswordBtn, passwordFieldsContainer);
        form.appendChild(passwordToggleSection);

        togglePasswordBtn.addEventListener('click', () => {
            const isHidden = passwordFieldsContainer.style.display === 'none';
            passwordFieldsContainer.style.display = isHidden ? 'block' : 'none';
            togglePasswordBtn.textContent = isHidden ? 'Cancelar cambio de contraseña' : 'Cambiar Contraseña';
        });

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
        
        buttonGroup.append(submitBtn, backBtn);
        form.appendChild(buttonGroup);

        container.append(title, form);
        this.elements.form = form;
        this.elements.submitBtn = submitBtn;
        this.elements.backBtn = backBtn;
        return container;
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
        return { group, infoText };
    }

    showAlert(shadowRoot, message, type, formElement) {
        if (this.elements.alert) {
            this.elements.alert.remove();
        }

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;

        formElement.parentNode.insertBefore(alert, formElement);
        this.elements.alert = alert;

        setTimeout(() => alert.remove(), 5000);
    }
}

class DriverProfileWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.user = null;
        this.view = new DriverProfileView();
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleBack = this.handleBack.bind(this);
    }

    connectedCallback() {
        this.loadProfile();
    }

    disconnectedCallback() {
        if (this.view.elements.form) {
            this.view.elements.form.removeEventListener('submit', this.handleSubmit);
        }
        if (this.view.elements.backBtn) {
            this.view.elements.backBtn.removeEventListener('click', this.handleBack);
        }
    }

    async loadProfile() {
        const res = await ProfileService.getProfile();
        if (res.success) {
            this.user = res.user;
            this.render();
        } else {
            const errorP = document.createElement('p');
            errorP.textContent = `Error al cargar el perfil: ${res.error}`;
            this.shadowRoot.appendChild(errorP);
        }
    }

    render() {
        while (this.shadowRoot.firstChild) {
            this.shadowRoot.removeChild(this.shadowRoot.firstChild);
        }

        this.style.transition = 'opacity 0.3s ease-in-out';
        this.style.opacity = '0';
        
        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '/components/dashboard/css/driver-profile.css'; 

        styles.onload = () => {
            this.style.opacity = '1'; 
        };
        
        const profileContent = this.view.render(this.user);
        this.shadowRoot.append(styles, profileContent);
        this.addEvents();
    }

    addEvents() {
        if (this.view.elements.form) {
            this.view.elements.form.addEventListener('submit', this.handleSubmit);
        }
        if (this.view.elements.backBtn) {
            this.view.elements.backBtn.addEventListener('click', this.handleBack);
        }
    }

    handleBack() {
        window.history.pushState({}, '', '/dashboard');
        window.dispatchEvent(new Event('popstate'));
    }

    async handleSubmit(e) {
        e.preventDefault();
        const form = this.view.elements.form;
        const submitBtn = this.view.elements.submitBtn;

        const newPassword = form.newPassword.value;
        const confirmPassword = form.confirmPassword.value;

        const passwordValidationError = ProfileValidator.validatePassword(newPassword, confirmPassword);
        if (passwordValidationError) {
            this.view.showAlert(this.shadowRoot, passwordValidationError, 'error', form);
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

        const res = await ProfileService.updateProfile(data);

        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Cambios';

        if (res.success) {
            this.view.showAlert(this.shadowRoot, 'Perfil actualizado correctamente', 'success', form);
            setTimeout(() => this.loadProfile(), 2000);
        } else {
            this.view.showAlert(this.shadowRoot, res.error || 'Error al actualizar perfil', 'error', form);
        }
    }
}

customElements.define('driver-profile-wc', DriverProfileWC);