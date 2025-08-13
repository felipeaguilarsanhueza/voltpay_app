import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Permite configurar la URL base vía variable de entorno en tiempo de build
// Para Expo web: usar EXPO_PUBLIC_API_BASE_URL; por defecto cae a localhost
const baseURL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (typeof window !== 'undefined' && window.__API_BASE_URL__) ||
  'http://localhost:8000';

const api = axios.create({
  baseURL,
});

// Attach Authorization header with Bearer token from AsyncStorage
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    console.debug('[API] Request', config.method.toUpperCase(), config.url, 'token:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;