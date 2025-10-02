class DriverRegisterWC extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.handleSubmit = this.handleSubmit.bind(this)
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
        container.classList.add('form-container')

        const title = document.createElement('h1')
        title.textContent = 'Registro Conductor'

        const form = document.createElement('form')
        form.id = 'driver-register-form'
        form.action = '/api/v1/register/driver'
        form.method = 'POST'

        // Inputs
        const nameInput = document.createElement('input')
        nameInput.type = 'text'
        nameInput.name = 'name'
        nameInput.id = 'name'
        nameInput.placeholder = 'Nombre completo'
        nameInput.required = true

        const emailInput = document.createElement('input')
        emailInput.type = 'email'
        emailInput.name = 'email'
        emailInput.id = 'email'
        emailInput.placeholder = 'Correo electrónico'
        emailInput.required = true

        const passwordInput = document.createElement('input')
        passwordInput.type = 'password'
        passwordInput.name = 'password'
        passwordInput.id = 'password'
        passwordInput.placeholder = 'Contraseña'
        passwordInput.required = true

        const licenciaInput = document.createElement('input')
        licenciaInput.type = 'text'
        licenciaInput.name = 'licencia'
        licenciaInput.id = 'licencia'
        licenciaInput.placeholder = 'Número de licencia'
        licenciaInput.required = true

        const patenteInput = document.createElement('input')
        patenteInput.type = 'text'
        patenteInput.name = 'patente'
        patenteInput.id = 'patente'
        patenteInput.placeholder = 'Patente del vehículo'
        patenteInput.required = true

        const vehiculoInput = document.createElement('input')
        vehiculoInput.type = 'text'
        vehiculoInput.name = 'vehiculo'
        vehiculoInput.id = 'vehiculo'
        vehiculoInput.placeholder = 'Modelo del vehículo'
        vehiculoInput.required = true

        const submit = document.createElement('button')
        submit.type = 'submit'
        submit.textContent = 'Registrarse'

        form.append(
            nameInput,
            emailInput,
            passwordInput,
            licenciaInput,
            patenteInput,
            vehiculoInput,
            submit
        )

        // Link a login
        const alt = document.createElement('p')
        alt.classList.add('alternativa')
        const altLink = document.createElement('a')
        altLink.href = '/login'
        altLink.textContent = 'Iniciar sesión'
        alt.textContent = 'Si ya tienes una cuenta ingresa a: '
        alt.appendChild(altLink)

        container.append(title, form, alt)
        this.shadowRoot.append(link, container)
    }

    addEvents() {
        const form = this.shadowRoot.getElementById('driver-register-form')
        if (form) form.addEventListener('submit', this.handleSubmit)
    }

    removeEvents() {
        const form = this.shadowRoot.getElementById('driver-register-form')
        if (form) form.removeEventListener('submit', this.handleSubmit)
    }

    async handleSubmit(e) {
        e.preventDefault()
        const form = e.currentTarget
        const data = Object.fromEntries(new FormData(form).entries())

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            })
            const result = await response.json()
            if (response.ok) {
                alert(`Registro exitoso, ${result.user.name}`)
                window.history.pushState({}, '', '/login')
                window.dispatchEvent(new Event('popstate'))
            } else {
                alert(result.error || 'Error en el registro')
            }
        } catch (err) {
            console.error(err)
            alert('Error de conexión con el servidor')
        }
    }
}

customElements.define('driver-register', DriverRegisterWC)
