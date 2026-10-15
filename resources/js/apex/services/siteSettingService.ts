import { SiteBranding } from '../types/site';
import { apiRequest } from './apiClient';

export const siteSettingService = {
    get: () => apiRequest<{ data: SiteBranding }>('/management/branding'),
    update: (data: FormData) =>
        apiRequest<{ data: SiteBranding; message: string }>('/management/branding', {
            method: 'POST',
            body: data,
        }),
};
