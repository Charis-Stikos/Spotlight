import axios from 'axios';
import Constants from 'expo-constants';

// Στο Expo Go ο host του Metro είναι η διεύθυνση που βλέπει το κινητό· τη χρησιμοποιούμε για το backend (port 4000)
function resolveBaseUrl() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest?.debuggerHost ||
    '';
  const host = hostUri.split(':')[0] || 'localhost';
  return `http://${host}:4000/api`;
}

export const API_BASE_URL = resolveBaseUrl();

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 12000 });

// Συνδέονται από το AuthContext (αποφυγή κυκλικού import)
let handlers = {
  getAccessToken: () => null,
  refreshTokens: async () => null,
  onAuthLost: () => {},
};
export const configureApiAuth = (next) => {
  handlers = { ...handlers, ...next };
};

// Προσθήκη του access token σε κάθε αίτημα
api.interceptors.request.use((config) => {
  const token = handlers.getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Σε 401: μία ανανέωση token (single-flight) και επανάληψη του αιτήματος
let refreshPromise = null;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthRoute = original?.url?.includes('/auth/');

    if (status === 401 && original && !original._retried && !isAuthRoute) {
      original._retried = true;
      try {
        if (!refreshPromise) {
          refreshPromise = handlers.refreshTokens().finally(() => { refreshPromise = null; });
        }
        const newToken = await refreshPromise;
        if (newToken) {
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      } catch (refreshErr) {
        handlers.onAuthLost();
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  },
);
