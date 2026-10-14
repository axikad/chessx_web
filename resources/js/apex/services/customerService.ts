import { Customer, ApiResponse } from '../types';
import { mockCustomers } from '../data/customers';
import { QueryParams, simulateDelay } from './apiClient';

/**
 * Customer Service - Ready for Laravel `Route::apiResource('customers', CustomerController::class);`
 */
class CustomerService {
  private customers: Customer[] = [...mockCustomers];

  async getCustomers(params?: QueryParams): Promise<ApiResponse<Customer[]>> {
    await simulateDelay(150);
    let filtered = [...this.customers];

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q)
      );
    }

    if (params?.filters?.status && params.filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === params.filters?.status);
    }

    const page = params?.page || 1;
    const perPage = params?.perPage || 10;
    const total = filtered.length;
    const totalPages = Math.ceil(total / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    return {
      data: paginated,
      pagination: { page, perPage, total, totalPages }
    };
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    await simulateDelay(100);
    return this.customers.find(c => c.id === id) || null;
  }
}

export const customerService = new CustomerService();
