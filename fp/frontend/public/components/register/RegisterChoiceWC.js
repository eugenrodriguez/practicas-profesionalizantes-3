// frontend/public/components/register/RegisterChoiceWC.js
class RegisterChoiceWC extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.handlePassengerClick = this.handlePassengerClick.bind(this)
        this.handleDriverClick = this.handleDriverClick.bind(this)
    }

    connectedCallback() {
        this.render()
        this.addEvents()
    }

    disconnectedCallback() {
        this.removeEvents()
    }

    render() {
        this.shadowRoot.innerHTML = ''

        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = '/components/register/register.css'

        const container = document.createElement('div')
        container.classList.add('container')

        const title = document.createElement('h1')
        title.textContent = 'Registrarse'

        const desc = document.createElement('p')
        desc.textContent = 'Seleccione el tipo de usuario'

        const passengerBtn = document.createElement('button')
        passengerBtn.id = 'passenger-btn'
        passengerBtn.textContent = 'Pasajero'

        const driverBtn = document.createElement('button')
        driverBtn.id = 'driver-btn'
        driverBtn.textContent = 'Conductor'

        container.append(title, desc, passengerBtn, driverBtn)
        this.shadowRoot.append(link, container)
    }

    addEvents() {
        const passengerBtn = this.shadowRoot.getElementById('passenger-btn')
        const driverBtn = this.shadowRoot.getElementById('driver-btn')
        if (passengerBtn) passengerBtn.addEventListener('click', this.handlePassengerClick)
        if (driverBtn) driverBtn.addEventListener('click', this.handleDriverClick)
    }

    removeEvents() {
        const passengerBtn = this.shadowRoot.getElementById('passenger-btn')
        const driverBtn = this.shadowRoot.getElementById('driver-btn')
        if (passengerBtn) passengerBtn.removeEventListener('click', this.handlePassengerClick)
        if (driverBtn) driverBtn.removeEventListener('click', this.handleDriverClick)
    }

    handlePassengerClick() {
        window.history.pushState({}, '', '/register/passenger')
        window.dispatchEvent(new Event('popstate'))
    }

    handleDriverClick() {
        window.history.pushState({}, '', '/register/driver')
        window.dispatchEvent(new Event('popstate'))
    }
}

customElements.define('register-choice', RegisterChoiceWC)
