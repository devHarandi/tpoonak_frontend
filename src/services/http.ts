import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getToken } from '@/utils/storage';

// Keep the public configuration clean (https://api.tpoonak.com) while the
// Django routes remain namespaced under /api/.
const configuredApiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://api.tpoonak.com')
  .replace(/\/+$/, '');
const apiBaseUrl = configuredApiUrl.endsWith('/api')
  ? configuredApiUrl
  : `${configuredApiUrl}/api`;

const http: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
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
    // Axios باید برای FormData مرز multipart را خودش بسازد؛ تعیین دستی JSON
    // باعث می‌شود عکس پروفایل در Django به‌درستی parse نشود.
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers?.['Content-Type'];
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
