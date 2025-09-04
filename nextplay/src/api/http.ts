import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5130';

export const http = axios.create({
    baseURL,
    timeout: 30000, // Aumentar para 30 segundos
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar token de autenticação
http.interceptors.request.use(
    (config: any) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratamento de erros
http.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
        if (error.response?.status === 401) {
            // Token expirado ou inválido
            localStorage.removeItem('auth_token');
            window.location.href = '/onboarding';
        }
        return Promise.reject(error);
    }
);
