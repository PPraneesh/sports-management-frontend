import api from './axios';

import type {
  LoginRequest,
  LoginResponse,
  RegisterUserRequest,
  UserResponse,
} from '../types/auth.types';

export const registerUser = async (
  request: RegisterUserRequest
): Promise<UserResponse> => {
  const response = await api.post<UserResponse>(
    '/api/users/register',
    request
  );

  return response.data;
};

export const loginUser = async (
  request: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    '/api/users/login',
    request
  );

  return response.data;
};