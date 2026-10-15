import { ApiResponse, User } from '../types';
import { apiRequest, QueryParams } from './apiClient';

/**
 * User Service - Ready for Laravel `Route::apiResource('users', UserController::class);`
 */
class UserService {
    async getRoleOptions(): Promise<{ id: number; name: string; slug: string; description: string | null }[]> {
        const response = await apiRequest<{ data: { id: number; name: string; slug: string; description: string | null }[] }>(
            '/management/user-role-options',
        );
        return response.data;
    }

    async getUsers(params?: QueryParams): Promise<ApiResponse<User[]>> {
        const query = new URLSearchParams({
            page: String(params?.page || 1),
            perPage: String(params?.perPage || 10),
        });

        if (params?.search) query.set('search', params.search);

        if (params?.filters?.role) query.set('role', params.filters.role);
        if (params?.filters?.status) query.set('status', params.filters.status);
        return apiRequest(`/management/users?${query.toString()}`);
    }

    async getUserById(id: string): Promise<User | null> {
        const response = await apiRequest<{ data: User }>(`/management/users/${id}`);
        return response.data;
    }

    async createUser(data: Record<string, unknown>): Promise<User> {
        const response = await apiRequest<{ data: User }>('/management/users', { method: 'POST', body: this.formData(data) });
        return response.data;
    }

    async updateUser(id: string, data: Record<string, unknown>): Promise<User> {
        const formData = this.formData(data);
        formData.append('_method', 'PUT');
        const response = await apiRequest<{ data: User }>(`/management/users/${id}`, { method: 'POST', body: formData });
        return response.data;
    }

    async deleteUser(id: string): Promise<boolean> {
        await apiRequest(`/management/users/${id}`, { method: 'DELETE' });
        return true;
    }

    private formData(data: Record<string, unknown>): FormData {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value instanceof File) formData.append(key, value);
            else if (value !== null && value !== undefined) formData.append(key, String(value));
        });
        return formData;
    }
}

export const userService = new UserService();
