import { ApiResponse } from '@/types/user';
import { get ,post} from './http';
import { CalculateFeeRequest, CarrierPackageFee, CarrierType } from '@/types/carrier';

export const getCarrierTypes = async (): Promise<CarrierType[]> => {
  const response = await get<{ message: string; status: number; data: CarrierType[] }>('/carriers/carrier-types/list');
  return response.data.data;
};

export const calculateFee = async (data: CalculateFeeRequest): Promise<CarrierPackageFee[]> => {
  const response = await post<ApiResponse>('/carriers/calculate-fee',data);
  return response.data.data;
};