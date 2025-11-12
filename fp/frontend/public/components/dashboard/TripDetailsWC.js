// frontend/public/components/dashboard/TripDetailsWC.js
import { api } from '../../services/api.js';

// --- Service Class: Handles all API interactions ---
class TripDetailsService {
    submitRating(tripId, passengerId, rating, comment) {
        // Pasamos 0 como calificación por defecto cuando solo hay comentario.
        return api.submitRating(tripId, passengerId, rating, comment);
    }
}

// --- View Class: Manages DOM creation and updates, emits events ---
class TripDetailsView {
    constructor(host) {
        this.host = host;
        this.shadowRoot = host.shadowRoot;
        this.passengerRatingForms = new Map(); // Almacena referencias a los contenedores de los formularios de calificación
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

        if (!trip) {
            const loadingMessage = document.createElement('p');
            loadingMessage.textContent = 'Cargando detalles del viaje...';
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
        modalTitle.textContent = 'Detalles del Viaje Completado';
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

        modalBody.appendChild(this.createDetail('Origen', trip.origen));
        modalBody.appendChild(this.createDetail('Destino', trip.destino));
        const fecha = new Date(trip.fecha_salida);
        modalBody.appendChild(this.createDetail('Fecha y Hora', fecha.toLocaleString('es-AR')));
        modalBody.appendChild(this.createDetail('Asientos Ofrecidos', trip.asientos_ofrecidos));
        modalBody.appendChild(this.createDetail('Precio por Asiento', `${parseFloat(trip.precio).toFixed(2)}`));

        modalBody.appendChild(document.createElement('hr'));

        const conductorTitle = document.createElement('h4');
        conductorTitle.textContent = 'Conductor';
        modalBody.appendChild(conductorTitle);
        modalBody.appendChild(this.createDetail('Nombre', user?.name || 'No disponible'));
        modalBody.appendChild(this.createDetail('Email', user?.email || 'No disponible'));

        modalBody.appendChild(document.createElement('hr'));

        const pasajerosTitle = document.createElement('h4');
        pasajerosTitle.textContent = 'Pasajeros';
        modalBody.appendChild(pasajerosTitle);

        this.passengerRatingForms.clear(); // Limpiar referencias anteriores

        if (trip.pasajeros && trip.pasajeros.length > 0) {
            trip.pasajeros.forEach(p => {
                const passengerContainer = document.createElement('div');
                passengerContainer.classList.add('passenger-item');

                const passengerP = this.createDetail('Pasajero', `${p.name} (${p.asientos_solicitados} asiento${p.asientos_solicitados > 1 ? 's' : ''})`);
                
                const rateBtn = document.createElement('button');
                rateBtn.textContent = 'Enviar Comentario';
                rateBtn.classList.add('rate-btn');
                rateBtn.addEventListener('click', () => this.dispatchEvent('toggle-rating-form', { passenger: p, container: passengerContainer, rateBtn }));

                const ratingFormWrapper = document.createElement('div'); // Wrapper for the rating form
                passengerContainer.append(passengerP, rateBtn, ratingFormWrapper);
                modalBody.appendChild(passengerContainer);
                this.passengerRatingForms.set(p.id, { wrapper: ratingFormWrapper, rateBtn });
            });
        } else {
            const noPassengers = document.createElement('p');
            noPassengers.textContent = 'No se registraron pasajeros para este viaje.';
            noPassengers.classList.add('italic-placeholder');
            modalBody.appendChild(noPassengers);
        }
        return modalBody;
    }

    createDetail(label, value) {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = `${label}: `;
        p.appendChild(strong);
        p.appendChild(document.createTextNode(value));
        return p;
    }

    // Muestra u oculta el formulario de comentarios para un pasajero
    toggleRatingForm(passenger, show) {
        const ref = this.passengerRatingForms.get(passenger.id);
        if (!ref) return;

        this.clearContainer(ref.wrapper);
        if (ref.rateBtn) ref.rateBtn.style.display = show ? 'none' : 'block';

        if (show) {
            const form = document.createElement('div');
            form.classList.add('rating-form');

            const commentLabel = document.createElement('label');
            commentLabel.textContent = 'Comentario:';
            const commentInput = document.createElement('textarea');
            commentInput.placeholder = `Deja un comentario para ${passenger.name}...`;

            const submitBtn = document.createElement('button');
            submitBtn.textContent = 'Enviar Comentario';
            submitBtn.disabled = true;

            commentInput.addEventListener('input', () => {
                submitBtn.disabled = commentInput.value.trim() === '';
            });

            submitBtn.addEventListener('click', () => {
                this.dispatchEvent('submit-rating', {
                    tripId: this.host._trip.id, // Accede al ID del viaje desde el controlador del host
                    passengerId: passenger.id,
                    comment: commentInput.value
                });
            });

            form.append(commentLabel, commentInput, submitBtn);
            ref.wrapper.appendChild(form);
            ref.submitBtn = submitBtn;
        }
    }

    // Actualiza el estado del botón de envío (cargando/normal)
    setRatingFormLoading(passengerId, isLoading) {
        const ref = this.passengerRatingForms.get(passengerId);
        if (!ref || !ref.submitBtn) return;

        const submitBtn = ref.submitBtn;
        if (submitBtn) {
            submitBtn.disabled = isLoading;
            submitBtn.textContent = isLoading ? 'Enviando...' : 'Enviar Comentario';
        }
    }

    showRatingSuccess(passengerId, passengerName) {
        // Muestra un mensaje de éxito después de enviar el comentario
        const ref = this.passengerRatingForms.get(passengerId);
        if (!ref) return;

        this.clearContainer(ref.wrapper);
        const thanksMsg = document.createElement('p');
        thanksMsg.textContent = `¡Gracias por tu comentario sobre ${passengerName}!`;
        thanksMsg.classList.add('success-message');
        ref.wrapper.appendChild(thanksMsg);
        if (ref.rateBtn) ref.rateBtn.remove(); // Elimina el botón después del éxito
    }

    showRatingError(passengerId, message) {
        // Muestra un error y restaura el formulario
        const ref = this.passengerRatingForms.get(passengerId);
        if (!ref) return;

        alert(message); // Usa alert como en el original
        if (ref.rateBtn) ref.rateBtn.style.display = 'block'; // Muestra el botón de nuevo en caso de error
        this.clearContainer(ref.wrapper); // Limpia el formulario
    }
}

// --- Controller Class: The Web Component itself ---
class TripDetailsWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.service = new TripDetailsService();
        this.view = new TripDetailsView(this);
        this._trip = null;
        this._user = null;
    }

    set trip(data) {
        this._trip = data;
        if (this.isConnected) this.view.render(this._trip, this._user);
    }

    set user(data) {
        this._user = data;
        if (this.isConnected) this.view.render(this._trip, this._user);
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
        this.addEventListener('submit-rating', this.handleSubmitRating);
    }

    removeEventListeners() {
        this.removeEventListener('close-modal', this.handleCloseModal);
        this.removeEventListener('toggle-rating-form', this.handleToggleRatingForm);
        this.removeEventListener('submit-rating', this.handleSubmitRating);
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

    handleToggleRatingForm = (e) => {
        const { passenger, container, rateBtn } = e.detail;
        const ref = this.view.passengerRatingForms.get(passenger.id);
        const isFormShown = ref && ref.wrapper && ref.wrapper.firstChild;
        this.view.toggleRatingForm(passenger, !isFormShown);
    }

    handleSubmitRating = async (e) => {
        const { tripId, passengerId, comment } = e.detail;

        if (comment.trim() === '') {
            this.view.showRatingError(passengerId, 'Por favor, escribe un comentario.');
            return;
        }

        this.view.setRatingFormLoading(passengerId, true);
        const res = await this.service.submitRating(tripId, passengerId, 0, comment); // Enviamos 0 como calificación por defecto
        this.view.setRatingFormLoading(passengerId, false);

        if (res.success) {
            const passenger = this._trip.pasajeros.find(p => p.id === passengerId);
            this.view.showRatingSuccess(passengerId, passenger ? passenger.name : 'Pasajero');
        } else {
            this.view.showRatingError(passengerId, res.error || 'No se pudo enviar el comentario.');
        }
    }
}

customElements.define('trip-details-wc', TripDetailsWC);