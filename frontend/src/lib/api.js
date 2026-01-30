import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    me: () => api.get('/auth/me'),
};

// Users endpoints
export const usersAPI = {
    getAll: () => api.get('/users'),
    getTechnicians: () => api.get('/users/technicians'),
    updateRole: (userId, role) => api.put(`/users/${userId}/role`, null, { params: { role } }),
};

// Vehicles endpoints
export const vehiclesAPI = {
    create: (data) => api.post('/vehicles', data),
    getAll: () => api.get('/vehicles'),
    getById: (id) => api.get(`/vehicles/${id}`),
    getByPlate: (plate) => api.get(`/vehicles/plate/${plate}`),
};

// Appointments endpoints
export const appointmentsAPI = {
    create: (data) => api.post('/appointments', data),
    getAll: (date) => api.get('/appointments', { params: date ? { date } : {} }),
    getById: (id) => api.get(`/appointments/${id}`),
    updateStatus: (id, status) => api.put(`/appointments/${id}/status`, null, { params: { status } }),
};

// Inspections endpoints
export const inspectionsAPI = {
    create: (data) => api.post('/inspections', data),
    getByVehicle: (vehicleId) => api.get(`/inspections/vehicle/${vehicleId}`),
};

// Quotes endpoints
export const quotesAPI = {
    create: (data) => api.post('/quotes', data),
    getAll: () => api.get('/quotes'),
    getById: (id) => api.get(`/quotes/${id}`),
    approve: (id, signatureUrl, cedulaPhotoUrl) => 
        api.put(`/quotes/${id}/approve`, null, { params: { signature_url: signatureUrl, cedula_photo_url: cedulaPhotoUrl } }),
};

// Service Orders endpoints
export const serviceOrdersAPI = {
    create: (data) => api.post('/service-orders', data),
    getAll: (params) => api.get('/service-orders', { params }),
    getById: (id) => api.get(`/service-orders/${id}`),
    updateStatus: (id, status) => api.put(`/service-orders/${id}/status`, null, { params: { status } }),
    assignTechnician: (orderId, technicianId) => 
        api.put(`/service-orders/${orderId}/assign`, null, { params: { technician_id: technicianId } }),
};

// Notifications endpoints
export const notificationsAPI = {
    getAll: () => api.get('/notifications'),
    markRead: (id) => api.put(`/notifications/${id}/read`),
    getUnreadCount: () => api.get('/notifications/unread-count'),
};

// Dashboard endpoints
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
};

export default api;
