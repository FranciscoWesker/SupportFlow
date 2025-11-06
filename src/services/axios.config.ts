import axios, { AxiosInstance, AxiosError } from 'axios';
import logger from '@/utils/logger';

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
    response => response,
    (error: AxiosError) => {
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        logger.error('Error de respuesta:', error.response.status, error.response.data);
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        logger.error('Error de red:', error.request);
      } else {
        // Algo pasó al configurar la petición
        logger.error('Error:', error.message);
      }
      return Promise.reject(error);
    }
  );

  return instance;
};
