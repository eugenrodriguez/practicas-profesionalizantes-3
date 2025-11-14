export class ApiClient {
    constructor(baseURL = '/api/v1') {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
                ...options
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Error de autenticación (401). Redirigiendo al login.');
                    window.location.href = '/login'; 
                    return { success: false, error: 'No autorizado' }; 
                }
                return { success: false, error: result.error || `Error ${response.status}` };
            }

            return { success: true, ...result };
        } catch (error) {
            console.error('Error de red en ApiClient:', error);
            return { success: false, error: 'Error de conexión con el servidor' };
        }
    }

    async checkStatus() {
        const res = await this.request('/status', { method: 'GET' });
        if (res.success && res.user) {
            return { isAuthenticated: true, user: res.user };
        }
        return { isAuthenticated: false, user: null };
    }

    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async logout() {
        return this.request('/auth/logout', { method: 'POST' });
    }

    async registerDriver(name, email, password, licencia, patente, vehiculo) {
        return this.request('/auth/register/driver', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, licencia, patente, vehiculo })
        });
    }

    async registerPassenger(name, email, password, telefono, direccion) {
        return this.request('/auth/register/passenger', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, telefono, direccion })
        });
    }

    async createTrip(payload) {
        return this.request('/trips', { method: 'POST', body: JSON.stringify(payload) });
    }

    async getMyTrips() {
        return this.request('/profiles/me/trips', { method: 'GET' });
    }

    async getTripRequests(tripId) {
        return this.request(`/trips/${tripId}/requests`, { method: 'GET' });
    }

    async requestSeat(tripId, seats) {
        return this.request(`/trips/${tripId}/requests`, {
            method: 'POST',
            body: JSON.stringify({ asientos: seats })
        });
    }

    async respondRequest(requestId, action) {
        return this.request(`/trips/requests/${requestId}`, {
            method: 'PUT',
            body: JSON.stringify({ action })
        });
    }

    async deleteTrip(tripId) {
        return this.request(`/trips/${tripId}`, { method: 'DELETE' });
    }

    async cancelTrip(tripId) {
        return this.request(`/trips/${tripId}/cancel`, { method: 'PUT' });
    }

    async cancelBooking(requestId) {
        return this.request(`/trips/requests/${requestId}/cancel`, { method: 'POST' });
    }

    async getProfile() {
        return this.request('/profiles/me', { method: 'GET' });
    }

    async updateProfile(data) {
        return this.request('/profiles/me', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async searchTrips(filters = {}) {
        const params = new URLSearchParams();
        if (filters.origen) params.append('origen', filters.origen);
        if (filters.destino) params.append('destino', filters.destino);
        if (filters.fecha) params.append('fecha', filters.fecha);
        
        const query = params.toString() ? `?${params.toString()}` : '';
        return this.request(`/trips/search${query}`, { method: 'GET' });
    }

    async getAvailableTrips() {
        return this.request('/trips/available', { method: 'GET' });
    }

    async getMyRequests() {
        return this.request('/trips/my-requests', { method: 'GET' });
    }


    async updateTripStatus(tripId, status) {
        return this.request(`/trips/${tripId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ estado: status })
        });
    }

    async getAllDriverRequests() {
        return this.request('/trips/my/requests', { method: 'GET' });
    }

    async getTripById(tripId) {
        return this.request(`/trips/${tripId}`, { method: 'GET' });
    }

    async getPassengerCompletedTrips() {
        return this.request('/trips/my-completed-bookings', { method: 'GET' });
    }

    async submitRating(viajeId, calificadoId, calificacion, comentario) {
        return this.request('/ratings', {
            method: 'POST',
            body: JSON.stringify({ viajeId, calificadoId, calificacion, comentario })
        });
    }
}

export const api = new ApiClient();