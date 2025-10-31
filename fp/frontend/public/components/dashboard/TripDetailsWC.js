// frontend/public/components/dashboard/TripDetailsWC.js

class TripDetailsWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._trip = null;
        this._user = null;
        this.close = this.close.bind(this);
    }

    set trip(data) {
        this._trip = data;
        if (this.isConnected) this.render();
    }

    set user(data) {
        this._user = data;
        if (this.isConnected) this.render();
    }

    show() {
        this.style.display = 'flex';
    }

    close() {
        this.style.display = 'none';
        this.remove(); 
    }

    connectedCallback() {
        this.render();
        this.show(); 
    }

    render() {
        this.shadowRoot.innerHTML = ''; 

        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '/components/dashboard/css/trip-detail.css';
        this.shadowRoot.appendChild(styles);

        if (!this._trip) {
            const loadingMessage = document.createElement('p');
            loadingMessage.textContent = 'Cargando detalles del viaje...';
            this.shadowRoot.appendChild(loadingMessage);
            return;
        }

        const createDetail = (label, value) => {
            const p = document.createElement('p');
            const strong = document.createElement('strong');
            strong.textContent = `${label}: `;
            p.appendChild(strong);
            p.appendChild(document.createTextNode(value));
            return p;
        };

        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-content');
        modalContent.addEventListener('click', e => e.stopPropagation());

        const modalHeader = document.createElement('div');
        modalHeader.classList.add('modal-header');
        const modalTitle = document.createElement('h3');
        modalTitle.textContent = 'Detalles del Viaje Completado';
        const closeBtn = document.createElement('span');
        closeBtn.classList.add('modal-close');
        closeBtn.textContent = '\u00D7';
        closeBtn.onclick = this.close;
        modalHeader.append(modalTitle, closeBtn);

        const modalBody = document.createElement('div');
        modalBody.classList.add('modal-body');

        modalBody.appendChild(createDetail('Origen', this._trip.origen));
        modalBody.appendChild(createDetail('Destino', this._trip.destino));
        const fecha = new Date(this._trip.fecha_salida);
        modalBody.appendChild(createDetail('Fecha y Hora', fecha.toLocaleString('es-AR')));
        modalBody.appendChild(createDetail('Asientos Totales', this._trip.asientos_disponibles));
        modalBody.appendChild(createDetail('Precio por Asiento', `$${parseFloat(this._trip.precio).toFixed(2)}`));

        modalBody.appendChild(document.createElement('hr'));

        const conductorTitle = document.createElement('h4');
        conductorTitle.textContent = 'Conductor';
        modalBody.appendChild(conductorTitle);
        modalBody.appendChild(createDetail('Nombre', this._user?.name || 'No disponible'));
        modalBody.appendChild(createDetail('Email', this._user?.email || 'No disponible'));

        modalBody.appendChild(document.createElement('hr'));

        const pasajerosTitle = document.createElement('h4');
        pasajerosTitle.textContent = 'Pasajeros';
        modalBody.appendChild(pasajerosTitle);

        if (this._trip.pasajeros_confirmados && this._trip.pasajeros_confirmados.length > 0) {
            this._trip.pasajeros_confirmados.forEach(p => {
                modalBody.appendChild(createDetail('Nombre', p.name));
            });
        } else {
            const noPassengers = document.createElement('p');
            noPassengers.textContent = 'No se registraron pasajeros para este viaje.';
            noPassengers.classList.add('italic-placeholder');
            modalBody.appendChild(noPassengers);
        }

        modalContent.append(modalHeader, modalBody);
        this.shadowRoot.appendChild(modalContent);

        this.addEventListener('click', this.close);
    }
}

customElements.define('trip-details-wc', TripDetailsWC);