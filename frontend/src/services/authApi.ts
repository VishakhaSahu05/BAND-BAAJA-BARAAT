import { apiRequest } from './apiClient';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export function signup(input: { name: string; email: string; password: string }): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/signup', { method: 'POST', body: input });
}

export function login(input: { email: string; password: string }): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/login', { method: 'POST', body: input });
}

export function logout(): Promise<void> {
  return apiRequest<void>('/auth/logout', { method: 'POST' });
}

export function getCurrentUser(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/me');
}

export function forgotPassword(input: { email: string }): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/auth/forgot-password', { method: 'POST', body: input });
}

export function resetPassword(input: { token: string; password: string }): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/auth/reset-password', { method: 'POST', body: input });
}
