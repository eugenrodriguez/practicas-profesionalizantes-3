// frontend/public/components/logout/LogoutButtonWC.js
class LogoutButtonWC extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.handleLogout = this.handleLogout.bind(this)
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
        link.href = '/components/logout/logout.css'

        const button = document.createElement('button')
        button.textContent = 'Cerrar Sesión'

        this.shadowRoot.append(link, button)
    }

    addEvents() {
        const button = this.shadowRoot.querySelector('button')
        if (button) button.addEventListener('click', this.handleLogout)
    }

    removeEvents() {
        const button = this.shadowRoot.querySelector('button')
        if (button) button.removeEventListener('click', this.handleLogout)
    }

    async handleLogout() {
        try {
            const response = await fetch('/api/v1/logout', {
                method: 'POST',
                credentials: 'include' 
            })
            if (response.ok) {
                alert('Sesión cerrada correctamente.')
                window.location.replace('/')
            } else {
                alert('Error al cerrar sesión.')
            }
        } catch (err) {
            console.error(err)
            alert('Error de conexión con el servidor.')
        }
    }
}

customElements.define('logout-button-wc', LogoutButtonWC)
