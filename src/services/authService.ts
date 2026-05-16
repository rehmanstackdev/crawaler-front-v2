import { api } from '@/lib/apiClient';
import type { AuthResponse, AuthUser } from '@/types/auth';

type ApiEnvelope<T> = {
  status: number;
  response: string;
  message: string;
  data: T;
};

const unwrap = <T,>(payload: ApiEnvelope<T>): T => payload.data;

export const authService = {
  async register(payload: { name: string; email: string; password: string }) {
    const { data } = await api.post<ApiEnvelope<AuthResponse>>('/auth/register', payload);
    return unwrap(data);
  },

  async login(payload: { email: string; password: string }) {
    const { data } = await api.post<ApiEnvelope<AuthResponse>>('/auth/login', payload);
    return unwrap(data);
  },

  async me() {
    const { data } = await api.get<ApiEnvelope<{ user: AuthUser }>>('/auth/me');
    return unwrap(data).user;
  },

  async forgotPassword(email: string) {
    const { data } = await api.post<ApiEnvelope<unknown>>('/auth/forgot-password', { email });
    return data.message;
  },

  async verifyOtp(payload: { email: string; otp: string }) {
    const { data } = await api.post<ApiEnvelope<{ resetToken: string }>>(
      '/auth/verify-otp',
      payload,
    );
    return unwrap(data);
  },

  async resetPassword(payload: { resetToken: string; password: string }) {
    const { data } = await api.post<ApiEnvelope<unknown>>('/auth/reset-password', payload);
    return data.message;
  },
};
