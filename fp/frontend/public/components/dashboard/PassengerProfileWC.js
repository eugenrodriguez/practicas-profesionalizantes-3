import { api } from '../../services/api.js';

class PassengerProfileService {
    getProfile() {
        return api.getProfile();
    }

    updateProfile(data) {
        return api.updateProfile(data);
    }
}

class PassengerProfileView {
    constructor(host) {
        this.host = host;
        this.shadowRoot = host.shadowRoot;
        this.form = null;
        this.submitBtn = null;
    }

    dispatchEvent(eventName, detail) {
        this.host.dispatchEvent(new CustomEvent(eventName, {
            bubbles: true,
            composed: true,
            detail
        }));
    }

    clearContainer(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    render(user) {
        this.clearContainer(this.shadowRoot);

        this.host.style.transition = 'opacity 0.3s ease-in-out';
        this.host.style.opacity = '0';

        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '/components/dashboard/css/passenger-profile.css';
        styles.onload = () => { this.host.style.opacity = '1'; };

        const container = document.createElement('div');
        container.classList.add('profile-container');

        const title = document.createElement('h2');
        title.textContent = 'Mi Perfil';

        this.form = document.createElement('form');
        this.form.id = 'profile-form';
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            this.dispatchEvent('save-profile', { data });
        });

        this.form.append(
            this.createBasicInfoSection(user),
            this.createContactSection(user),
            this.createPasswordSection(),
            this.createButtonGroup()
        );

        container.append(title, this.form);
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
        return { group, infoText }; 
    }

    createBasicInfoSection(user) {
        const section = document.createElement('div');
        section.classList.add('profile-section');
        const title = document.createElement('h3');
        title.textContent = 'Información Personal';
        const nameGroup = this.createFormGroup('Nombre', 'name', 'text', user.name).group;
        const emailFormGroup = this.createFormGroup('Email', 'email', 'email', user.email, true);
        emailFormGroup.infoText.textContent = 'El email no se puede modificar';
        section.append(title, nameGroup, emailFormGroup.group);
        return section;
    }

    createContactSection(user) {
        const section = document.createElement('div');
        section.classList.add('profile-section');
        const title = document.createElement('h3');
        title.textContent = 'Datos de Contacto';
        const telefonoGroup = this.createFormGroup('Teléfono', 'telefono', 'tel', user.telefono || '').group;
        const direccionGroup = this.createFormGroup('Dirección', 'direccion', 'text', user.direccion || '').group;
        section.append(title, telefonoGroup, direccionGroup);
        return section;
    }

    createPasswordSection() {
        const passwordToggleSection = document.createElement('div');
        passwordToggleSection.classList.add('profile-section');

        const togglePasswordBtn = document.createElement('button');
        togglePasswordBtn.type = 'button';
        togglePasswordBtn.textContent = 'Cambiar Contraseña';
        togglePasswordBtn.classList.add('toggle-password-btn');

        const passwordFieldsContainer = document.createElement('div');
        passwordFieldsContainer.classList.add('password-fields-container');
        passwordFieldsContainer.style.display = 'none'; 

        const title = document.createElement('h3');
        title.textContent = 'Cambiar Contraseña';
        const currentPasswordGroup = this.createFormGroup('Contraseña Actual', 'currentPassword', 'password', '').group;
        const newPasswordGroup = this.createFormGroup('Nueva Contraseña', 'newPassword', 'password', '').group;
        const confirmPasswordGroup = this.createFormGroup('Confirmar Nueva Contraseña', 'confirmPassword', 'password', '').group;
        
        const passwordInfo = document.createElement('p');
        passwordInfo.classList.add('info-text');
        passwordInfo.textContent = 'Deja estos campos vacíos si no deseas cambiar tu contraseña';
        
        passwordFieldsContainer.append(title, currentPasswordGroup, newPasswordGroup, confirmPasswordGroup, passwordInfo);
        passwordToggleSection.append(togglePasswordBtn, passwordFieldsContainer);

        togglePasswordBtn.addEventListener('click', () => {
            const isHidden = passwordFieldsContainer.style.display === 'none';
            passwordFieldsContainer.style.display = isHidden ? 'block' : 'none';
            togglePasswordBtn.textContent = isHidden ? 'Cancelar cambio de contraseña' : 'Cambiar Contraseña';
        });

        return passwordToggleSection;
    }

    createButtonGroup() {
        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('button-group');
        this.submitBtn = document.createElement('button');
        this.submitBtn.type = 'submit';
        this.submitBtn.textContent = 'Guardar Cambios';
        const backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.classList.add('back-btn');
        backBtn.textContent = '← Volver al Dashboard';
        backBtn.addEventListener('click', () => this.dispatchEvent('back-to-dashboard'));
        buttonGroup.append(this.submitBtn, backBtn);
        return buttonGroup;
    }

    setLoading(isLoading) {
        if (!this.submitBtn) return;
        this.submitBtn.disabled = isLoading;
        this.submitBtn.textContent = isLoading ? 'Guardando...' : 'Guardar Cambios';
    }

    clearPasswordFields() {
        if (!this.form) return;
        this.form.elements.currentPassword.value = '';
        this.form.elements.newPassword.value = '';
        this.form.elements.confirmPassword.value = '';
    }

    showAlert(message, type) {
        if (!this.form) return;
        let existingAlert = null;
        for (const child of this.form.parentNode.children) {
            if (child.classList && child.classList.contains('alert')) {
                existingAlert = child;
                break;
            }
        }
        if (existingAlert) {
            existingAlert.remove();
        }
        const alert = document.createElement('div');
        alert.classList.add('alert', `alert-${type}`);
        alert.textContent = message;
        this.form.parentNode.insertBefore(alert, this.form);
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

class PassengerProfileWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.service = new PassengerProfileService();
        this.view = new PassengerProfileView(this);
        this.user = null;
    }

    connectedCallback() {
        this.loadProfile();
        this.addEventListeners();
    }

    disconnectedCallback() {
        this.removeEventListeners();
    }

    addEventListeners() {
        this.addEventListener('save-profile', this.handleSaveProfile);
        this.addEventListener('back-to-dashboard', this.handleNavigation);
    }

    removeEventListeners() {
        this.removeEventListener('save-profile', this.handleSaveProfile);
        this.removeEventListener('back-to-dashboard', this.handleNavigation);
    }

    async loadProfile() {
        const res = await this.service.getProfile();
        if (res.success) {
            this.user = res.user;
            this.view.render(this.user);
        } else {
            alert('Error al cargar perfil');
        }
    }

    handleNavigation = () => {
        window.history.pushState({}, '', '/dashboard');
        window.dispatchEvent(new Event('popstate'));
    }

    handleSaveProfile = async (e) => {
        const { data } = e.detail;
        
        if ((data.newPassword || data.confirmPassword) && !data.currentPassword) {
            this.view.showAlert('Debes ingresar tu contraseña actual para cambiarla', 'error');
            return;
        }
        if (data.newPassword !== data.confirmPassword) {
            this.view.showAlert('Las contraseñas nuevas no coinciden', 'error');
            return;
        }
        if (data.newPassword) {
            const passReq = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]).{8,16}$/;
            if (!passReq.test(data.newPassword)) {
                this.view.showAlert('La contraseña debe tener 8-16 caracteres, una mayúscula, un número y un símbolo.', 'error');
                return;
            }
        }

        const updateData = {
            name: data.name,
            telefono: data.telefono,
            direccion: data.direccion
        };

        if (data.newPassword) {
            updateData.currentPassword = data.currentPassword;
            updateData.newPassword = data.newPassword;
        }

        this.view.setLoading(true);
        const res = await this.service.updateProfile(updateData);
        this.view.setLoading(false);

        if (res.success) {
            this.view.showAlert('Perfil actualizado correctamente', 'success');
            this.view.clearPasswordFields();
            setTimeout(() => this.loadProfile(), 2000);
        } else {
            this.view.showAlert(res.error || 'Error al actualizar perfil', 'error');
        }
    }
}

customElements.define('passenger-profile-wc', PassengerProfileWC);