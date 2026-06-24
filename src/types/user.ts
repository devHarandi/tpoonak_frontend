export interface User {
  id: number;
  mobile: string;
  profile: {
    first_name: string;
    last_name: string;
    mobile: string;
    verified_phone: boolean;
    created_at:string;
    roles: Array<{ id: number; name: string }>;
  };
  balances: Array<{
    id?: number;
    user?: number;
    role: { id: number; name: string };
    balance: string;
    updated_at: string | null;
  }>;
}

export interface Role {
  id: number;
  name: string;
}

export interface Transaction {
  id: number;
  wallet_balance: {
    id: number;
    user: number;
    role: { id: number; name: string };
    balance: string;
    updated_at: string;
  };
  amount: string;
  transaction_type: string;
  description: string;
  created_at: string;
}

export interface GetUsersResponse {
  message: string;
  status: number;
  data: User[];
}

export interface GetRolesResponse {
  message: string;
  status: number;
  data: Role[];
}

export interface GetTransactionsResponse {
  message: string;
  status: number;
  data: Transaction[];
}

export interface GetAllTransactionsResponse {
  message: string;
  status: number;
  data: {
    transactions: Transaction[];
    total_debt: string;
  };
}

export interface TransactionsResponse {
  data: {
    transactions: Transaction[];
    total_debt: string;
  };
}

export interface GetProfileResponse {
  message: string;
  status: number;
  data: {
    profile: {
      first_name: string;
      last_name: string;
      mobile: string;
      verified_phone: boolean;
      roles: Array<{ id: number; name: string }>;
    };
    balances: Array<{
      id: number;
      user: number;
      role: { id: number; name: string };
      balance: string;
      updated_at: string | null;
    }>;
  };
}

export interface CreateUserRequest {
  mobile: string;
  first_name: string;
  last_name: string;
  role_ids: number[];
}

export interface AssignRoleRequest {
  user_id: number;
  role_id: number;
}

export interface RemoveRoleRequest {
  user_id: number;
  role_id: number;
}

export interface SettleBalanceRequest {
  user_id: number;
  role_id: number;
  amount: number;
  description: string;
}

export interface SettleBalanceResponse {
  message: string;
  status: number;
  data: {
    id: number;
    user: number;
    role: { id: number; name: string };
    balance: string;
    updated_at: string;
  };
}

export interface ApiResponse {
  message: string;
  status: number;
  data: any;
}