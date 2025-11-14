import { api } from '../../services/api.js';

class RatingService {
    submitRating(tripId, targetId, rating, comment) {
        return api.submitRating(tripId, targetId, rating, comment);
    }
}

class RatingView {
    constructor(host) {
        this.host = host;
        this.shadowRoot = host.shadowRoot;
        this.passengerRatingLists = new Map(); 
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

    render(tripData, user) {
        this.clearContainer(this.shadowRoot);

        const link = document.createElement('link');
        link.rel = "stylesheet";
        link.href = "/components/dashboard/css/rating.css";
        this.shadowRoot.appendChild(link);

        if (!tripData || !user) return;

        const container = document.createElement('div');
        container.className = 'rating-container';

        const isDriver = user.id === tripData.conductor_id;

        if (isDriver) {
            this.renderDriverRating(container, tripData);
        } else {
            this.renderPassengerRating(container, tripData);
        }

        this.shadowRoot.appendChild(container);
    }

    renderDriverRating(container, tripData) {
        const title = document.createElement('h2');
        title.textContent = 'Califica a tus Pasajeros';
        container.appendChild(title);

        const passengerList = document.createElement('ul');
        passengerList.className = 'passenger-rating-list';

        this.passengerRatingLists.clear(); 

        if (tripData.pasajeros && tripData.pasajeros.length > 0) {
            tripData.pasajeros.forEach(pasajero => {
                const item = document.createElement('li');
                item.className = 'passenger-rating-item';

                const passengerName = document.createElement('h3');
                passengerName.textContent = pasajero.name;

                const starsDiv = this.createStarsElement(pasajero.id);
                const submitBtn = document.createElement('button');
                submitBtn.textContent = `Calificar a ${pasajero.name}`;
                submitBtn.disabled = true;

                starsDiv.addEventListener('star-selected', (e) => {
                    submitBtn.disabled = false;
                    starsDiv.dataset.rating = e.detail.rating;
                });

                submitBtn.addEventListener('click', () => {
                    const rating = parseInt(starsDiv.dataset.rating || '0');
                    this.dispatchEvent('submit-rating', {
                        tripId: tripData.id,
                        targetId: pasajero.id,
                        rating: rating,
                        comment: ''
                    });
                });

                item.append(passengerName, starsDiv, submitBtn);
                passengerList.appendChild(item);
                this.passengerRatingLists.set(pasajero.id, { item, submitBtn, starsDiv, passengerName });
            });
        } else {
            const noPassengers = document.createElement('p');
            noPassengers.textContent = 'No hubo pasajeros en este viaje.';
            passengerList.appendChild(noPassengers);
        }
        container.appendChild(passengerList);
    }

    renderPassengerRating(container, tripData) {
        const title = document.createElement('h2');
        title.textContent = `Califica tu viaje con ${tripData.conductor_name}`;
        
        const starsDiv = this.createStarsElement(tripData.conductor_id);
        const submitRatingBtn = document.createElement('button');
        submitRatingBtn.textContent = 'Enviar Calificación';
        submitRatingBtn.disabled = true;

        starsDiv.addEventListener('star-selected', (e) => {
            submitRatingBtn.disabled = false;
            starsDiv.dataset.rating = e.detail.rating;
        });

        submitRatingBtn.addEventListener('click', () => {
            const selectedRating = parseInt(starsDiv.dataset.rating || '0');
            this.dispatchEvent('submit-rating', {
                tripId: tripData.id,
                targetId: tripData.conductor_id,
                rating: selectedRating,
                comment: ''
            });
        });

        container.append(title, starsDiv, submitRatingBtn);
        this.passengerRatingLists.set(tripData.conductor_id, { submitRatingBtn, starsDiv }); 
    }

    createStarsElement(targetId) {
        const starsDiv = document.createElement('div');
        starsDiv.className = 'stars';
        starsDiv.dataset.targetId = targetId;
        const starElements = [];

        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.textContent = '☆';
            star.dataset.value = i;
            starsDiv.appendChild(star);
            starElements.push(star);
        }

        starElements.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.value);
                starElements.forEach(s => {
                    s.textContent = parseInt(s.dataset.value) <= rating ? '★' : '☆';
                });
                starsDiv.dispatchEvent(new CustomEvent('star-selected', { detail: { rating } }));
            });
        });

        return starsDiv;
    }

    setSubmitButtonState(targetId, isLoading, success = false, errorMessage = '') {
        const ref = this.passengerRatingLists.get(targetId);
        if (!ref) return;

        if (ref.submitBtn) {
            ref.submitBtn.disabled = isLoading;
            ref.submitBtn.textContent = isLoading ? 'Enviando...' : 'Enviar Calificación';
            if (!isLoading && !success && errorMessage) {
                ref.submitBtn.textContent = 'Reintentar'; 
            }
        }

        if (success && ref.item && ref.passengerName) { 
            this.clearContainer(ref.item);
            ref.item.appendChild(ref.passengerName);
            const successMsg = document.createElement('p');
            successMsg.className = 'success-message';
            successMsg.textContent = `¡Gracias por calificar a ${ref.passengerName.textContent}!`;
            ref.item.appendChild(successMsg);
        } else if (errorMessage) {
            alert(errorMessage); 
        }
    }
}

class RatingWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.service = new RatingService();
        this.view = new RatingView(this);
        this._tripData = null;
        this._user = null;
    }

    set tripData(data) {
        this._tripData = data;
        this.view.render(this._tripData, this._user);
    }

    get tripData() {
        return this._tripData;
    }

    set user(userData) {
        this._user = userData;
        this.view.render(this._tripData, this._user);
    }

    get user() {
        return this._user;
    }

    connectedCallback() {
        this.addEventListeners();
        this.view.render(this._tripData, this._user);
    }

    disconnectedCallback() {
        this.removeEventListeners();
    }

    addEventListeners() {
        this.addEventListener('submit-rating', this.handleSubmitRating);
        this.addEventListener('back-to-dashboard', this.handleBackToDashboard);
    }

    removeEventListeners() {
        this.removeEventListener('submit-rating', this.handleSubmitRating);
        this.removeEventListener('back-to-dashboard', this.handleBackToDashboard);
    }

    handleBackToDashboard = () => {
        window.history.pushState({}, '', '/dashboard');
        window.dispatchEvent(new Event('popstate'));
    }

    handleSubmitRating = async (e) => {
        const { tripId, targetId, rating, comment } = e.detail;

        if (rating === 0) {
            this.view.setSubmitButtonState(targetId, false, false, 'Por favor, selecciona una calificación.');
            return;
        }

        this.view.setSubmitButtonState(targetId, true);
        const res = await this.service.submitRating(tripId, targetId, rating, comment);
        this.view.setSubmitButtonState(targetId, false);

        if (res.success) {
            if (this._user.id === this._tripData.conductor_id) { 
                this.view.setSubmitButtonState(targetId, false, true); 
            } else { 
                alert('¡Gracias por tu calificación!'); 
                this.handleBackToDashboard();
            }
        } else {
            this.view.setSubmitButtonState(targetId, false, false, res.error || 'Error al enviar calificación.');
        }
    }
}

customElements.define('rating-wc', RatingWC);