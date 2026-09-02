import { get, post, del ,patch} from './http';
import { GetUsersResponse, GetRolesResponse, CreateUserRequest, AssignRoleRequest, RemoveRoleRequest, SettleBalanceRequest, SettleBalanceResponse, ApiResponse, GetTransactionsResponse, GetProfileResponse, GetAllTransactionsResponse, TransactionsResponse } from '@/types/user';

export interface UserListQuery {
  search?: string;
  roleId?: number;
  page?: number;
  pageSize?: number;
}

export interface TransactionListQuery {
  search?: string;
  page?: number;
  pageSize?: number;
}

export const getUsers = async (query: UserListQuery = {}): Promise<GetUsersResponse> => {
  const params: Record<string, string | number> = {};
  if (query.search?.trim()) params.search = query.search.trim();
  if (query.roleId) params.role_id = query.roleId;
  if (query.page) params.page = query.page;
  if (query.pageSize) params.page_size = query.pageSize;

  const response = await get<GetUsersResponse>('/accounts/users/list', { params });
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

export const getAllTransactions = async (query: TransactionListQuery = {}): Promise<GetAllTransactionsResponse> => {
  const params: Record<string, string | number> = {};
  if (query.search?.trim()) params.search = query.search.trim();
  if (query.page) params.page = query.page;
  if (query.pageSize) params.page_size = query.pageSize;

  const response = await get<GetAllTransactionsResponse>('/accounts/transactions', { params });
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
