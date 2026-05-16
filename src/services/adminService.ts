import { api } from '@/lib/apiClient';
import type { AuthUser } from '@/types/auth';

type ApiEnvelope<T> = {
  status: number;
  response: string;
  message: string;
  data: T;
};

export interface UsersResponse {
  users: AuthUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const adminService = {
  async listUsers(params: { page?: number; limit?: number; search?: string } = {}) {
    const { data } = await api.get<ApiEnvelope<UsersResponse>>('/admin/users', { params });
    return data.data;
  },

  async setUserStatus(id: string, isActive: boolean) {
    const { data } = await api.patch<ApiEnvelope<{ user: AuthUser }>>(
      `/admin/users/${id}/status`,
      { isActive },
    );
    return data.data.user;
  },
};
