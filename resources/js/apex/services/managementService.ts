import { PermissionModuleRecord, PermissionRecord, Role } from '../types';
import { apiRequest } from './apiClient';

export const roleService = {
    list: () => apiRequest<{ data: Role[]; modules: PermissionModuleRecord[] }>('/management/roles'),
    create: (data: Record<string, unknown>) => apiRequest<{ data: Role }>('/management/roles', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
        apiRequest<{ data: Role }>(`/management/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: string) => apiRequest(`/management/roles/${id}`, { method: 'DELETE' }),
    syncPermissions: (id: string, permissionIds: number[]) =>
        apiRequest<{ data: Role }>(`/management/roles/${id}/permissions`, { method: 'PUT', body: JSON.stringify({ permission_ids: permissionIds }) }),
};

export const permissionService = {
    list: () => apiRequest<{ data: PermissionRecord[]; modules: { id: number; name: string }[] }>('/management/permissions'),
    create: (data: Record<string, unknown>) =>
        apiRequest<{ data: PermissionRecord }>('/management/permissions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Record<string, unknown>) =>
        apiRequest<{ data: PermissionRecord }>(`/management/permissions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: number) => apiRequest(`/management/permissions/${id}`, { method: 'DELETE' }),
};
