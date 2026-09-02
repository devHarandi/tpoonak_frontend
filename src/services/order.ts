import { post, get,patch } from './http';
import { CreateOrderRequest, CreateOrderResponse, GetOrdersResponse, GetOrderResponse, GetVehicleTypeResponse, GetCanCreateOrder, GetSystemSetting, GetChangeSystemSetting, SetChangeSystemSetting, ManageOrderRequest } from '@/types/order';

export const createOrder = async (data: CreateOrderRequest): Promise<CreateOrderResponse> => {
  const response = await post<CreateOrderResponse>('/orders/create', data);
  return response.data;
};

export const getOrders = async (): Promise<GetOrdersResponse> => {
  const response = await get<GetOrdersResponse>('/orders/my-orders');
  return response.data;
};

export const getOrder = async (id: number): Promise<GetOrderResponse> => {
  const response = await get<GetOrderResponse>(`/orders/${id}`);
  return response.data;
};

export const getAllOrders = async (status?: string): Promise<GetOrdersResponse> => {
  const timestamp = new Date().getTime(); // پارامتر تصادفی برای جلوگیری از کش
  const url = status 
    ? `/orders/all-orders?status=${status}&_=${timestamp}` 
    : `/orders/all-orders?_=${timestamp}`;
  const response = await get<GetOrdersResponse>(url);
  return response.data;
};

export const getAllOrdersToday = async (status?: string): Promise<GetOrdersResponse> => {
  const timestamp = new Date().getTime(); // پارامتر تصادفی
  const url = status 
    ? `/orders/all-orders?status=${status}&is_today=true&_=${timestamp}`
    : `/orders/all-orders?is_today=true&_=${timestamp}`;
  const response = await get<GetOrdersResponse>(url);
  return response.data;
};

export const updateOrderStatus = async (id: number, status: string): Promise<GetOrderResponse> => {
  const response = await patch<GetOrderResponse>(`/orders/${id}/status`, { status });
  return response.data;
};

export const manageOrder = async (id: number, data: ManageOrderRequest): Promise<GetOrderResponse> => {
  const response = await patch<GetOrderResponse>(`/orders/${id}/manage`, data);
  return response.data;
};

export const uploadOrderImage = async (id: number, image: File): Promise<GetOrderResponse> => {
  const formData = new FormData();
  formData.append('image', image);
  const response = await post<GetOrderResponse>(`/orders/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getVehicle = async (): Promise<GetVehicleTypeResponse> => {
  const response = await get<GetVehicleTypeResponse>('/orders/vehicle-types');
  return response.data;
};

export const canCreateOrder = async (): Promise<GetCanCreateOrder> => {
  const response = await get<GetCanCreateOrder>('/orders/can-create-order');
  return response.data;
};

export const settingOrder = async (): Promise<GetSystemSetting> => {
  const response = await get<GetSystemSetting>('/orders/settings');
  return response.data;
};

export const changeSettingOrder = async (data: SetChangeSystemSetting): Promise<GetChangeSystemSetting> => {
  const response = await post<GetChangeSystemSetting>('/orders/change-status-setting',data);
  return response.data;
};
