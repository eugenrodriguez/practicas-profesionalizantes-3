export const AuthService = {
    async checkStatus() {
        try {
            const response = await fetch('/api/v1/status', {
                method: 'GET',
                credentials: 'include' // 🌟 INCLUYE COOKIES HTTP ONLY
            });
            if (response.ok) {
                const result = await response.json();
                return { isAuthenticated: true, user: result.user };
            }
            return { isAuthenticated: false, user: null };
        } catch (error) {
            console.error('Error de red en AuthService:', error);
            return { isAuthenticated: false, user: null, error: 'Network Error' };
        }
    }
    // Aquí puedes añadir login(data), logout() si quieres.
};