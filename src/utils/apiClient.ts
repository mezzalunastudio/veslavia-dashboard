// utils/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Penting: selalu kirim cookies
  timeout: 10000,
});

// Request interceptor untuk menambahkan auth header jika diperlukan
apiClient.interceptors.request.use(
  (config) => {
    // Anda bisa menambahkan logic di sini jika perlu
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect ke login jika unauthorized
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;