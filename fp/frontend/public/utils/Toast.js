const toastStyles = `
:host {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-family: Arial, sans-serif;
    font-size: 16px;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease-in-out, bottom 0.3s ease-in-out;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
:host(.show) {
    opacity: 1;
    bottom: 40px;
}
:host(.success) { background-color: #4CAF50; }
:host(.error) { background-color: #f44336; }
:host(.warning) { background-color: #ff9800; }
:host(.info) { background-color: #2196F3; }
`;

class ToastNotification extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = toastStyles;
        this.shadowRoot.appendChild(style);
    }

    static show(message, type = 'info', duration = 4000) {
        const toast = new ToastNotification();
        toast.shadowRoot.append(document.createTextNode(message));
        toast.classList.add(type);

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });
        });

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, duration);
    }
}

customElements.define('toast-notification', ToastNotification);
export const Toast = ToastNotification;

