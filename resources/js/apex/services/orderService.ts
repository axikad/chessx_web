import { Order, ApiResponse } from '../types';
import { mockOrders } from '../data/orders';
import { QueryParams, simulateDelay } from './apiClient';

/**
 * Order Service - Ready for Laravel `Route::apiResource('orders', OrderController::class);`
 */
class OrderService {
  private orders: Order[] = [...mockOrders];

  async getOrders(params?: QueryParams): Promise<ApiResponse<Order[]>> {
    await simulateDelay(150);
    let filtered = [...this.orders];

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q)
      );
    }

    if (params?.filters?.status && params.filters.status !== 'all') {
      filtered = filtered.filter(o => o.status === params.filters?.status);
    }
    if (params?.filters?.paymentStatus && params.filters.paymentStatus !== 'all') {
      filtered = filtered.filter(o => o.paymentStatus === params.filters?.paymentStatus);
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

  async getOrderById(id: string): Promise<Order | null> {
    await simulateDelay(100);
    return this.orders.find(o => o.id === id || o.orderNumber === id) || null;
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    await simulateDelay(200);
    const order = this.orders.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    order.status = status;
    order.timeline.unshift({
      status: `Status updated to ${status}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      description: `Order status changed via Admin Console.`,
    });
    return order;
  }
}

export const orderService = new OrderService();
