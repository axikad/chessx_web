/**
 * Laravel API Client Abstraction
 *
 * In a production Laravel + Inertia/Sanctum setup, replace this mock layer
 * with Axios or Fetch pointing to your Laravel backend (e.g. `axios.create({ baseURL: '/api/v1' })`).
 */

export interface QueryParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, string>;
}

// Simulated network latency helper for realistic UX states
export const simulateDelay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export class ApiError extends Error {
    constructor(
        message: string,
        public errors: Record<string, string[]> = {},
    ) {
        super(message);
    }
}

export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
    const isFormData = options.body instanceof FormData;
    const response = await fetch(url, {
        ...options,
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            ...(!isFormData && { 'Content-Type': 'application/json' }),
            'X-CSRF-TOKEN': token ?? '',
            ...options.headers,
        },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(payload.message ?? 'Request failed.', payload.errors ?? {});
    return payload;
}
