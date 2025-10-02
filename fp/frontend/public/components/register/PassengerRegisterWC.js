// frontend/public/components/register/PassengerRegisterWC.js
class PassengerRegisterWC extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }

    connectedCallback() {
        this.render()
    }

    disconnectedCallback() {}

    render() {
        this.shadowRoot.innerHTML = ''

        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = '/components/register/register.css'

        const container = document.createElement('div')
        container.classList.add('form-container')

        const title = document.createElement('h1')
        title.textContent = 'Registro Pasajero'

        const form = document.createElement('form')
        form.action = '/api/v1/register/passenger'
        form.method = 'POST'

        const fields = [
            { label: 'Nombre completo', name: 'name', type: 'text' },
            { label: 'Correo electrónico', name: 'email', type: 'email' },
            { label: 'Teléfono', name: 'telefono', type: 'text' },
            { label: 'Dirección', name: 'direccion', type: 'text' },
            { label: 'Contraseña', name: 'password', type: 'password' }
        ]

        fields.forEach(f => {
            const label = document.createElement('label')
            label.setAttribute('for', f.name)
            label.textContent = f.label

            const input = document.createElement('input')
            input.type = f.type
            input.name = f.name
            input.id = f.name
            input.required = true

            form.append(label, input)
        })

        const submit = document.createElement('button')
        submit.type = 'submit'
        submit.textContent = 'Registrarse'

        form.appendChild(submit)
        container.append(title, form)
        this.shadowRoot.append(link, container)
    }
}

customElements.define('passenger-register', PassengerRegisterWC)
