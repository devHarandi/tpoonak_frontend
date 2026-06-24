import { get, post } from './http';
import { Address, CreateAddressRequest, CreateAddressResponse } from '@/types/address';

export const getAddresses = async (): Promise<Address[]> => {
  const response = await get<{ message: string; status: number; data: Address[] }>('/accounts/addresses');
  return response.data.data;
};

export const createAddress = async (data: CreateAddressRequest): Promise<CreateAddressResponse> => {
  const response = await post<CreateAddressResponse>('/accounts/address/create', data);
  return response.data;
};