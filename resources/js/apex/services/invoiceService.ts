import { Invoice, ApiResponse } from '../types';
import { mockInvoices } from '../data/invoices';
import { QueryParams, simulateDelay } from './apiClient';

/**
 * Invoice Service - Ready for Laravel `Route::apiResource('invoices', InvoiceController::class);`
 */
class InvoiceService {
  private invoices: Invoice[] = [...mockInvoices];

  async getInvoices(params?: QueryParams): Promise<ApiResponse<Invoice[]>> {
    await simulateDelay(150);
    let filtered = [...this.invoices];

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customer.name.toLowerCase().includes(q) ||
        inv.customer.company.toLowerCase().includes(q)
      );
    }

    if (params?.filters?.status && params.filters.status !== 'all') {
      filtered = filtered.filter(inv => inv.status === params.filters?.status);
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

  async getInvoiceById(id: string): Promise<Invoice | null> {
    await simulateDelay(100);
    return this.invoices.find(inv => inv.id === id || inv.invoiceNumber === id) || null;
  }

  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>): Promise<Invoice> {
    await simulateDelay(250);
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-2024-${Math.floor(10000 + Math.random() * 90000)}`,
    };
    this.invoices.unshift(newInvoice);
    return newInvoice;
  }

  async updateInvoiceStatus(id: string, status: Invoice['status']): Promise<Invoice | null> {
    await simulateDelay(150);
    const index = this.invoices.findIndex(inv => inv.id === id);
    if (index === -1) return null;
    this.invoices[index] = { ...this.invoices[index], status };
    return this.invoices[index];
  }
}

export const invoiceService = new InvoiceService();
