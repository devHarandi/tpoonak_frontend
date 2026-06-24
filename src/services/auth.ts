import { post, get, patch } from './http';
import { LoginRequest, LoginResponse, VerifyRequest, VerifyResponse, ProfileResponse, UpdateProfileRequest } from '@/types/auth';

export const sendLoginCode = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await post<LoginResponse>('/accounts/auth/send-code', data);
  return response.data;
};

export const verifyCode = async (data: VerifyRequest): Promise<VerifyResponse> => {
  const response = await post<VerifyResponse>('/accounts/auth/verify-code', data);
  return response.data;
};

export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await get<ProfileResponse>('/accounts/profile/get');
  return response.data;
};

export const updateProfile = async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
  const response = await patch<ProfileResponse>('/accounts/profile/update', data);
  return response.data;
};