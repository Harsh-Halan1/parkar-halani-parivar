import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle response errors and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Wait for the token refresh to complete
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                // No refresh token, logout user
                auth.logout();
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
                const { accessToken } = response.data;

                localStorage.setItem('token', accessToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                processQueue(null, accessToken);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                auth.logout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// Auth utilities
export const auth = {
    getToken: () => localStorage.getItem('token'),
    getRefreshToken: () => localStorage.getItem('refreshToken'),

    setTokens: (accessToken, refreshToken) => {
        if (accessToken) localStorage.setItem('token', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    },

    clearTokens: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },

    isAuthenticated: () => !!localStorage.getItem('token'),

    logout: () => {
        auth.clearTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        // Redirect to home instead of non-existent /login page
        if (window.location.pathname !== '/') {
            window.location.href = '/';
        }
    },

    getUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    setUser: (user) => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            window.dispatchEvent(new CustomEvent('auth:login', { detail: user }));
        }
    }
};

export default api;
