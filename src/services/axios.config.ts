import axios, { AxiosInstance, AxiosError } from 'axios';

export const createAxiosInstance = (baseURL?: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 30000, // 30 segundos
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor de respuesta para manejo de errores
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        console.error('Error de respuesta:', error.response.status, error.response.data);
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        console.error('Error de red:', error.request);
      } else {
        // Algo pasó al configurar la petición
        console.error('Error:', error.message);
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

