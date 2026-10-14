import { Product, ApiResponse } from '../types';
import { mockProducts } from '../data/products';
import { QueryParams, simulateDelay } from './apiClient';

/**
 * Product Service - Ready for Laravel `Route::apiResource('products', ProductController::class);`
 */
class ProductService {
  private products: Product[] = [...mockProducts];

  async getProducts(params?: QueryParams): Promise<ApiResponse<Product[]>> {
    await simulateDelay(150);
    let filtered = [...this.products];

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }

    if (params?.filters?.category && params.filters.category !== 'all') {
      filtered = filtered.filter(p => p.category === params.filters?.category);
    }
    if (params?.filters?.status && params.filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === params.filters?.status);
    }

    if (params?.sortBy) {
      filtered.sort((a, b) => {
        const aVal = (a as any)[params.sortBy!];
        const bVal = (b as any)[params.sortBy!];
        if (params.sortOrder === 'desc') {
          return aVal < bVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
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

  async getProductById(id: string): Promise<Product | null> {
    await simulateDelay(100);
    return this.products.find(p => p.id === id) || null;
  }

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'salesCount' | 'revenue' | 'rating' | 'reviewsCount'>): Promise<Product> {
    await simulateDelay(250);
    const newProduct: Product = {
      ...data,
      id: `prd_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      salesCount: 0,
      revenue: 0,
      rating: 5.0,
      reviewsCount: 0,
    };
    this.products.unshift(newProduct);
    return newProduct;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    await simulateDelay(200);
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    this.products[index] = { ...this.products[index], ...data };
    return this.products[index];
  }

  async deleteProduct(id: string): Promise<boolean> {
    await simulateDelay(200);
    this.products = this.products.filter(p => p.id !== id);
    return true;
  }
}

export const productService = new ProductService();
