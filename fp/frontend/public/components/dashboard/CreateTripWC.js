import { api } from '../../services/api.js';

class CreateTripWC extends HTMLElement {
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
        // contenedor
        const container = document.createElement('div');
        container.classList.add('create-trip-container');

        const title = document.createElement('h2');
        title.textContent = 'Crear Viaje';

        const form = document.createElement('form');
        form.id = 'create-trip-form';

        const fields = [
            { placeholder: 'Origen', name: 'origen', type: 'text' },
            { placeholder: 'Destino', name: 'destino', type: 'text' },
            { placeholder: 'Fecha y hora de salida', name: 'fecha_salida', type: 'datetime-local' },
            { placeholder: 'Asientos disponibles', name: 'asientos_disponibles', type: 'number' },
            { placeholder: 'Precio', name: 'precio', type: 'number', step: '0.01' }
        ];

        fields.forEach(f => {
            const input = document.createElement('input');
            input.name = f.name;
            input.placeholder = f.placeholder;
            input.type = f.type;
            if (f.step) input.step = f.step;
            input.required = true;
            form.appendChild(input);
        });

        const submit = document.createElement('button');
        submit.type = 'submit';
        submit.textContent = 'Crear';

        form.appendChild(submit);

        // link style
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/components/dashboard/dashboard.css';

        container.append(title, form);
        this.shadowRoot.append(link, container);
    }

    addEvents() {
        const form = this.shadowRoot.getElementById('create-trip-form');
        if (form) form.addEventListener('submit', this.handleSubmit);
    }

    removeEvents() {
        const form = this.shadowRoot.getElementById('create-trip-form');
        if (form) form.removeEventListener('submit', this.handleSubmit);
    }

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form).entries());
        if (data.fecha_salida) {
            // normalize local datetime-local to MySQL format (YYYY-MM-DD HH:MM:SS)
            data.fecha_salida = data.fecha_salida.replace('T', ' ');
        }
        const res = await api.createTrip(data);
        if (res.success) {
            alert('Viaje creado correctamente');
            // navegar a mis viajes
            window.history.pushState({}, '', '/dashboard/my-trips');
            window.dispatchEvent(new Event('popstate'));
        } else {
            alert(res.error || 'Error creando viaje');
        }
    }
}

customElements.define('create-trip', CreateTripWC);
