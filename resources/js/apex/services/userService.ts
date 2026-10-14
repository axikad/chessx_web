import { User, ApiResponse } from '../types';
import { QueryParams } from './apiClient';

/**
 * User Service - Ready for Laravel `Route::apiResource('users', UserController::class);`
 */
class UserService {
  async getUsers(params?: QueryParams): Promise<ApiResponse<User[]>> {
    const query = new URLSearchParams({
      page: String(params?.page || 1),
      perPage: String(params?.perPage || 10),
    });

    if (params?.search) query.set('search', params.search);

    const response = await fetch(`/users/data?${query.toString()}`, {
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    });

    if (!response.ok) throw new Error('Unable to load users');

    return response.json();
  }

  async getUserById(id: string): Promise<User | null> {
    throw new Error(`User details are not implemented for ${id}`);
  }

  async createUser(data: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): Promise<User> {
    throw new Error(`User creation is not implemented for ${data.email}`);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    throw new Error(`User updates are not implemented for ${id}`);
  }

  async deleteUser(id: string): Promise<boolean> {
    throw new Error(`User deletion is not implemented for ${id}`);
  }
}

export const userService = new UserService();
