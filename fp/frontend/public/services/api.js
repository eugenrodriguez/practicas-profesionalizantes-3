// frontend/public/services/api.js
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
        return this.request('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async logout() {
        return this.request('/logout', { method: 'POST' });
    }

    async registerDriver(name, email, password, licencia, patente, vehiculo) {
        return this.request('/register/driver', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, licencia, patente, vehiculo })
        });
    }

    async registerPassenger(name, email, password, telefono, direccion) {
        return this.request('/register/passenger', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, telefono, direccion })
        });
    }

    // Trips
    async createTrip(payload) {
        return this.request('/trips', { method: 'POST', body: JSON.stringify(payload) });
    }

    async getMyTrips() {
        return this.request('/trips/my', { method: 'GET' });
    }

    async getUserTrips() {
        return this.request('/trips/my', { method: 'GET' });
    }

    async getTripRequests(tripId) {
        return this.request(`/trips/${tripId}/requests`, { method: 'GET' });
    }

    async requestSeat(tripId, seats) {
        return this.request(`/trips/${tripId}/request`, {
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

    // Profile
    async getProfile() {
        return this.request('/profile', { method: 'GET' });
    }

    async updateProfile(data) {
        return this.request('/profile', {
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
        return this.request(`/trips/${tripId}`);
    }
    
}

export const api = new ApiClient();