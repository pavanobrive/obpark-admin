import { api } from './api'

interface RegisterPayload {
  email: string
  password: string
  name: string
}

interface LoginPayload {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'CUSTOMER' | 'ADMIN'
}

interface AuthResponse {
  user: AuthUser
  accessToken: string
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/register', payload)
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/login', payload)
}

export async function refreshSession(): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/refresh')
}

export async function logoutUser(): Promise<void> {
  await api.post('/auth/logout')
}
