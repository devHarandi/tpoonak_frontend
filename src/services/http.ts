import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getToken } from '@/utils/storage';

const http: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include token in headers
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      // اطمینان از اینکه headers وجود دارد
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const get = <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
  http.get<T>(url, config);

export const post = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
  http.post<T>(url, data, config);

export const patch = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
  http.patch<T>(url, data, config);

export const del = <T>(url: string,data?:any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
  http.delete<T>(url, config);


export default http;