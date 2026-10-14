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
  filters?: Record<string, any>;
}

// Simulated network latency helper for realistic UX states
export const simulateDelay = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms));
