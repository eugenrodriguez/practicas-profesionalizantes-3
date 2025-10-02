// frontend/public/components/login/LoginFormWC.js
class LoginFormWC extends HTMLElement {
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
        link.href = '/components/login/login.css'

        const container = document.createElement('div')
        container.classList.add('form-container')

        const title = document.createElement('h1')
        title.textContent = 'Iniciar sesión'

        const desc = document.createElement('p')
        desc.textContent = 'Ingrese sus credenciales para ingresar'

        const form = document.createElement('form')
        form.id = 'login-form'
        form.action = '/api/v1/login'
        form.method = 'POST'

        const userInput = document.createElement('input')
        userInput.type = 'text'
        userInput.name = 'email'
        userInput.id = 'email'
        userInput.placeholder = 'Correo electrónico'
        userInput.required = true

        const passInput = document.createElement('input')
        passInput.type = 'password'
        passInput.name = 'password'
        passInput.id = 'password'
        passInput.placeholder = 'Contraseña'
        passInput.required = true

        const submit = document.createElement('button')
        submit.type = 'submit'
        submit.textContent = 'Iniciar sesión'

        form.append(userInput, passInput, submit)

        const alt = document.createElement('p')
        alt.classList.add('alternativa')
        const altLink = document.createElement('a')
        altLink.href = 'register'
        altLink.textContent = 'Registrarse'
        alt.textContent = 'Si no tienes una cuenta ingresa a: '
        alt.appendChild(altLink)

        container.append(title, desc, form, alt)

        this.shadowRoot.append(link, container)
    }

    addEvents() {
        const form = this.shadowRoot.getElementById('login-form')
        if (form) form.addEventListener('submit', this.handleSubmit)
    }

    removeEvents() {
        const form = this.shadowRoot.getElementById('login-form')
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
                alert(`Bienvenido, ${result.user.name}`)
                window.history.pushState({}, '', '/dashboard')
                window.dispatchEvent(new Event('popstate'))
            } else {
                alert(result.error || 'Error de login')
            }
        } catch (err) {
            console.error(err)
            alert('Error de conexión con el servidor')
        }
    }
}

customElements.define('login-form', LoginFormWC)
