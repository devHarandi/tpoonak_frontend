import { get, post, del ,patch} from './http';
import { GetUsersResponse, GetRolesResponse, CreateUserRequest, AssignRoleRequest, RemoveRoleRequest, SettleBalanceRequest, SettleBalanceResponse, ApiResponse, GetTransactionsResponse, GetProfileResponse, GetAllTransactionsResponse, TransactionsResponse } from '@/types/user';

export const getUsers = async (): Promise<GetUsersResponse> => {
  const response = await get<GetUsersResponse>('/accounts/users/list');
  return response.data;
};

export const getRoles = async (): Promise<GetRolesResponse> => {
  const response = await get<GetRolesResponse>('/accounts/roles/list');
  return response.data;
};

export const getTransactions = async (userId: number): Promise<TransactionsResponse> => {
  const response = await get<TransactionsResponse>(`/accounts/users/${userId}/transactions`);
  return response.data;
};

export const getAllTransactions = async (): Promise<GetAllTransactionsResponse> => {
  const response = await get<GetAllTransactionsResponse>('/accounts/transactions');
  return response.data;
};


export const getProfile = async (): Promise<GetProfileResponse> => {
  const response = await get<GetProfileResponse>('/accounts/profile/get');
  return response.data;
};

export const createUser = async (data: CreateUserRequest): Promise<ApiResponse> => {
  const response = await post<ApiResponse>('/accounts/users/create', data);
  return response.data;
};

export const assignRole = async (data: AssignRoleRequest): Promise<ApiResponse> => {
  const response = await patch<ApiResponse>('/accounts/users/assign-role', data);
  return response.data;
};

export const removeRole = async (data: RemoveRoleRequest): Promise<ApiResponse> => {
  const response = await post<ApiResponse>('/accounts/users/remove-role', data);
  return response.data;
};

export const settleBalance = async (data: SettleBalanceRequest): Promise<SettleBalanceResponse> => {
  const response = await post<SettleBalanceResponse>('/accounts/settle-balance', data);
  return response.data;
};