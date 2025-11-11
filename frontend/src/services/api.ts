
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000'; 

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to set the authorization header
export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

// Interceptor to handle token refresh (optional, but good practice)
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        // If error is 401 and not a refresh token request
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const res = await axios.post(`${API_BASE_URL}/api/refresh`, null, {
                        headers: {
                            'refresh_token': refreshToken
                        }
                    });
                    const { access_token, refresh_token } = res.data;
                    localStorage.setItem('accessToken', access_token);
                    localStorage.setItem('refreshToken', refresh_token);
                    setAuthToken(access_token);
                    return api(originalRequest);
                } catch (refreshError) {
                    // Handle refresh token failure
                    console.error('Unable to refresh token', refreshError);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    // Optionally redirect to login page
                    window.location.href = '/login';
                }
            } else {
                // No refresh token, redirect to login
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
