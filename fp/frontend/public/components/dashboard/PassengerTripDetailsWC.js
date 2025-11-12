// --- View Class: Manages DOM creation and updates, emits events ---
class PassengerTripDetailsView {
    constructor(host) {
        this.host = host;
        this.shadowRoot = host.shadowRoot;
        this.ratingWC = null;
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

        this.ratingWC = document.createElement('rating-wc');
        this.ratingWC.style.display = 'none'; // Hidden by default
        
        modalContent.append(modalHeader, modalBody, this.ratingWC);
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
        rateBtn.textContent = 'Calificar Viaje';
        rateBtn.classList.add('rate-btn');
        rateBtn.addEventListener('click', () => this.dispatchEvent('toggle-rating-wc'));
        conductorSection.appendChild(rateBtn);

        return conductorSection;
    }
}

// --- Controller Class: The Web Component itself ---
class PassengerTripDetailsWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.view = new PassengerTripDetailsView(this);
        this._trip = null;
        this._user = null;
    }

    set trip(data) {
        this._trip = data;
        if (this.isConnected) {
            this.view.render(this._trip, this._user);
            if (this.view.ratingWC) {
                this.view.ratingWC.tripData = this._trip;
                this.view.ratingWC.user = this._user;
            }
        }
    }

    set user(data) {
        this._user = data;
        if (this.isConnected) {
            this.view.render(this._trip, this._user);
            if (this.view.ratingWC) {
                this.view.ratingWC.tripData = this._trip;
                this.view.ratingWC.user = this._user;
            }
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
        this.addEventListener('toggle-rating-wc', this.handleToggleRatingWC);
        // Listen for the submit-rating event from the nested RatingWC
        this.addEventListener('submit-rating', this.handleRatingSubmitted);
    }

    removeEventListeners() {
        this.removeEventListener('close-modal', this.handleCloseModal);
        this.removeEventListener('toggle-rating-wc', this.handleToggleRatingWC);
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

    handleToggleRatingWC = () => {
        if (this.view.ratingWC) {
            const isHidden = this.view.ratingWC.style.display === 'none';
            this.view.ratingWC.style.display = isHidden ? 'block' : 'none';
            // Ensure tripData and user are set when showing the rating component
            if (isHidden) {
                this.view.ratingWC.tripData = this._trip;
                this.view.ratingWC.user = this._user;
            }
        }
    }

    handleRatingSubmitted = () => {
        // After rating is submitted, close the modal
        this.close();
    }
}

customElements.define('passenger-trip-details-wc', PassengerTripDetailsWC);