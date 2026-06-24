import { get } from './http';
import { Package } from '@/types/package';

export const getPackages = async (): Promise<Package[]> => {
  const response = await get<{ message: string; status: number; data: Package[] }>('/packages/list');
  return response.data.data;
};