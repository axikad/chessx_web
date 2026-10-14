export type ThemeMode = 'light' | 'dark' | 'system';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'Super Admin' | 'Administrator' | 'Manager' | 'Editor' | 'Customer Support';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  lastLogin: string;
  createdAt: string;
  department: string;
  twoFactorEnabled: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  discount: number;
  tax: number;
  stock: number;
  minStock: number;
  weight: string;
  dimensions: string;
  images: string[];
  variants?: ProductVariant[];
  tags: string[];
  status: 'published' | 'draft' | 'out_of_stock' | 'archived';
  rating: number;
  reviewsCount: number;
  salesCount: number;
  revenue: number;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'paid' | 'unpaid' | 'refunded' | 'failed' | 'partially_refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'Credit Card' | 'PayPal' | 'Bank Transfer' | 'Stripe' | 'Cash on Delivery';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  timeline: {
    status: string;
    timestamp: string;
    description: string;
  }[];
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  ordersCount: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'blocked';
  joinedDate: string;
  lastOrderDate?: string;
  location: string;
  company?: string;
  notes?: string;
  tags: string[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: {
    name: string;
    email: string;
    company: string;
    address: string;
  };
  issuer: {
    company: string;
    email: string;
    address: string;
    taxId: string;
  };
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  notes: string;
  terms: string;
}

export interface RolePermissionModule {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  isSystem: boolean;
  permissions: RolePermissionModule[];
}

export interface KPICardData {
  title: string;
  value: string;
  previousPeriod: string;
  change: number; // e.g. +14.2 or -3.1
  isPositive: boolean;
  sparkline: number[];
  icon: string;
}

export interface ActivityItem {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'order' | 'product' | 'user' | 'system' | 'invoice';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'order' | 'alert' | 'user' | 'payment';
}

export interface PaginationParams {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationParams;
  message?: string;
}
