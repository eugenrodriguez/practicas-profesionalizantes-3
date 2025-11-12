import { api } from '../../services/api.js';

// --- Service Class: Handles all API interactions ---
class PassengerTripDetailsService {
    submitRating(tripId, driverId, rating, comment) {
        return api.submitRating(tripId, driverId, rating, comment);
    }
}

// --- View Class: Manages DOM creation and updates, emits events ---
class PassengerTripDetailsView {
    constructor(host) {
        this.host = host;
        this.shadowRoot = host.shadowRoot;
        this.ratingFormContainer = null;
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

    render(trip, user) {
        this.clearContainer(this.shadowRoot);

        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '/components/dashboard/css/trip-detail.css';
        this.shadowRoot.appendChild(styles);

        if (!trip || !user) {
            const loadingMessage = document.createElement('p');
            loadingMessage.textContent = 'Cargando detalles...';
            this.shadowRoot.appendChild(loadingMessage);
            return;
        }

        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-content');
        modalContent.addEventListener('click', e => e.stopPropagation());

        const modalHeader = this.createModalHeader();
        const modalBody = this.createModalBody(trip, user);

        modalContent.append(modalHeader, modalBody);
        this.shadowRoot.appendChild(modalContent);
        this.host.addEventListener('click', () => this.dispatchEvent('close-modal'));
    }

    createModalHeader() {
        const modalHeader = document.createElement('div');
        modalHeader.classList.add('modal-header');
        const modalTitle = document.createElement('h3');
        modalTitle.textContent = 'Detalles de tu Viaje';
        const closeBtn = document.createElement('span');
        closeBtn.classList.add('modal-close');
        closeBtn.textContent = '\u00D7';
        closeBtn.addEventListener('click', () => this.dispatchEvent('close-modal'));
        modalHeader.append(modalTitle, closeBtn);
        return modalHeader;
    }

    createModalBody(trip, user) {
        const modalBody = document.createElement('div');
        modalBody.classList.add('modal-body');

        // Trip Details
        modalBody.appendChild(this.createDetail('Origen', trip.origen));
        modalBody.appendChild(this.createDetail('Destino', trip.destino));
        const fecha = new Date(trip.fecha_salida);
        modalBody.appendChild(this.createDetail('Fecha y Hora', fecha.toLocaleString('es-AR')));
        modalBody.appendChild(this.createDetail('Asientos Ofrecidos', trip.asientos_ofrecidos));
        modalBody.appendChild(this.createDetail('Precio por Asiento', `${parseFloat(trip.precio).toFixed(2)}`));

        modalBody.appendChild(document.createElement('hr'));
        
        // Driver Details
        const conductorSection = this.createConductorSection(trip);
        modalBody.appendChild(conductorSection);

        modalBody.appendChild(document.createElement('hr'));

        // Other Passengers
        const pasajerosTitle = document.createElement('h4');
        pasajerosTitle.textContent = 'Compañeros de Viaje';
        modalBody.appendChild(pasajerosTitle);

        const otherPassengers = trip.pasajeros.filter(p => p.id !== user.id);

        if (otherPassengers.length > 0) {
            otherPassengers.forEach(p => {
                const passengerDetail = `${p.name} (${p.asientos_solicitados} asiento${p.asientos_solicitados > 1 ? 's' : ''})`;
                modalBody.appendChild(this.createDetail('Pasajero', passengerDetail));
            });
        } else {
            const noPassengersMessage = document.createElement('p');
            noPassengersMessage.classList.add('italic-placeholder');
            noPassengersMessage.textContent = 'Viajaste solo con el conductor.';
            modalBody.appendChild(noPassengersMessage);
        }
        return modalBody;
    }

    createDetail(label, value) {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = `${label}: `;
        p.appendChild(strong);
        p.appendChild(document.createTextNode(value || 'No disponible'));
        return p;
    }

    createConductorSection(trip) {
        const conductorSection = document.createElement('div');
        conductorSection.classList.add('conductor-section');
        const conductorTitle = document.createElement('h4');
        conductorTitle.textContent = 'Información del Conductor';
        conductorSection.appendChild(conductorTitle);
        conductorSection.appendChild(this.createDetail('Nombre', trip.conductor_name));
        conductorSection.appendChild(this.createDetail('Email de Contacto', trip.conductor_email));
        conductorSection.appendChild(this.createDetail('Vehículo', trip.vehiculo));
        conductorSection.appendChild(this.createDetail('Patente', trip.patente));
        
        const rateBtn = document.createElement('button');
        rateBtn.textContent = 'Enviar Comentario';
        rateBtn.classList.add('rate-btn');
        
        const ratingFormWrapper = document.createElement('div');
        this.ratingFormContainer = { wrapper: ratingFormWrapper, rateBtn };

        rateBtn.addEventListener('click', () => this.dispatchEvent('toggle-rating-form'));
        
        conductorSection.append(rateBtn, ratingFormWrapper);

        return conductorSection;
    }

    toggleRatingForm(show) {
        if (!this.ratingFormContainer) return;

        const { wrapper, rateBtn } = this.ratingFormContainer;
        this.clearContainer(wrapper);
        rateBtn.style.display = show ? 'none' : 'block';

        if (show) {
            const form = document.createElement('div');
            form.classList.add('rating-form');

            const commentLabel = document.createElement('label');
            commentLabel.textContent = 'Comentario:';
            const commentInput = document.createElement('textarea');
            commentInput.placeholder = `Deja un comentario para el conductor...`;

            const submitBtn = document.createElement('button');
            submitBtn.textContent = 'Enviar Comentario';
            submitBtn.disabled = true;

            commentInput.addEventListener('input', () => {
                submitBtn.disabled = commentInput.value.trim() === '';
            });

            submitBtn.addEventListener('click', () => {
                this.dispatchEvent('submit-rating', {
                    comment: commentInput.value
                });
            });

            form.append(commentLabel, commentInput, submitBtn);
            wrapper.appendChild(form);
            this.ratingFormContainer.submitBtn = submitBtn;
        }
    }

    setRatingFormLoading(isLoading) {
        if (!this.ratingFormContainer || !this.ratingFormContainer.submitBtn) return;

        const submitBtn = this.ratingFormContainer.submitBtn;
        if (submitBtn) {
            submitBtn.disabled = isLoading;
            submitBtn.textContent = isLoading ? 'Enviando...' : 'Enviar Comentario';
        }
    }

    showRatingSuccess(driverName) {
        if (!this.ratingFormContainer) return;
        const { wrapper, rateBtn } = this.ratingFormContainer;

        this.clearContainer(wrapper);
        const thanksMsg = document.createElement('p');
        thanksMsg.textContent = `¡Gracias por tu comentario sobre ${driverName}!`;
        thanksMsg.classList.add('success-message');
        wrapper.appendChild(thanksMsg);
        if (rateBtn) rateBtn.remove();
    }

    showRatingError(message) {
        alert(message);
        if (this.ratingFormContainer) this.toggleRatingForm(false);
    }
}

// --- Controller Class: The Web Component itself ---
class PassengerTripDetailsWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.service = new PassengerTripDetailsService();
        this.view = new PassengerTripDetailsView(this);
        this._trip = null;
        this._user = null;
    }

    set trip(data) {
        this._trip = data;
        if (this.isConnected) {
            this.view.render(this._trip, this._user);
        }
    }

    set user(data) {
        this._user = data;
        if (this.isConnected) {
            this.view.render(this._trip, this._user);
        }
    }

    connectedCallback() {
        this.view.render(this._trip, this._user);
        this.show();
        this.addEventListeners();
    }

    disconnectedCallback() {
        this.removeEventListeners();
    }

    addEventListeners() {
        this.addEventListener('close-modal', this.handleCloseModal);
        this.addEventListener('toggle-rating-form', this.handleToggleRatingForm);
        this.addEventListener('submit-rating', this.handleRatingSubmitted);
    }

    removeEventListeners() {
        this.removeEventListener('close-modal', this.handleCloseModal);
        this.removeEventListener('toggle-rating-form', this.handleToggleRatingForm);
        this.removeEventListener('submit-rating', this.handleRatingSubmitted);
    }

    show() {
        this.style.display = 'flex';
    }

    close() {
        this.style.display = 'none';
        this.remove();
    }

    handleCloseModal = () => {
        this.close();
    }

    handleToggleRatingForm = () => {
        const ref = this.view.ratingFormContainer;
        const isFormShown = ref && ref.wrapper && ref.wrapper.firstChild;
        this.view.toggleRatingForm(!isFormShown);
    }

    handleRatingSubmitted = async (e) => {
        const { comment } = e.detail;

        if (comment.trim() === '') {
            this.view.showRatingError('Por favor, escribe un comentario.');
            return;
        }

        this.view.setRatingFormLoading(true);
        const res = await this.service.submitRating(this._trip.id, this._trip.conductor_id, 0, comment);
        this.view.setRatingFormLoading(false);

        if (res.success) {
            this.view.showRatingSuccess(this._trip.conductor_name);
            setTimeout(() => this.close(), 2000); // Cierra el modal después de 2 segundos
        } else {
            this.view.showRatingError(res.error || 'No se pudo enviar el comentario.');
        }
    }
}

customElements.define('passenger-trip-details-wc', PassengerTripDetailsWC);