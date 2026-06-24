export interface LoginRequest {
  mobile: string;
}

export interface LoginResponse {
  message: string;
}

export interface VerifyRequest {
  mobile: string;
  code: string;
}

export interface VerifyResponse {
  message: string;
  status: number;
  data: {
    user: {
      id: number;
      mobile: string;
      profile: {
        first_name: string;
        last_name: string;
        mobile: string;
        verified_phone: boolean;
        roles: Array<{
          id: number;
          name: string;
        }>;
      };
    };
    tokens: {
      refresh: string;
      access: string;
    };
  };
}

export interface ProfileResponse {
  message: string;
  status: number;
  data: {
    profile: {
      first_name: string;
      last_name: string;
      mobile: string;
      verified_phone: boolean;
      roles: Array<{
        id: number;
        name: string;
      }>;
    };
    balances: Array<{
      id: number;
      user: number;
      role: {
        id: number;
        name: string;
      };
      balance: string;
      updated_at: string;
    }>;
  };
}

export interface UpdateProfileRequest {
  first_name: string;
  last_name: string;
  mobile: string;
}