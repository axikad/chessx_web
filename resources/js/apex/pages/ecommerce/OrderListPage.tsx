import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Download, CheckCircle, Clock, Truck, XCircle, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';
import { useToast } from '../../context/ToastContext';

export const OrderListPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const { toast } = useToast();
  const navigate = useNavigate();

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await orderService.getOrders({
        filters: {
          status: statusFilter,
          paymentStatus: paymentFilter,
        },
      });
      setOrders(res.data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, paymentFilter]);

  const getStatusBadge = (status: Order['status']) => {
    const map: Record<Order['status'], { variant: BadgeVariant; label: string }> = {
      delivered: { variant: 'success', label: 'Delivered' },
      shipped: { variant: 'info', label: 'Shipped' },
      processing: { variant: 'primary', label: 'Processing' },
      pending: { variant: 'warning', label: 'Pending' },
      cancelled: { variant: 'danger', label: 'Cancelled' },
      refunded: { variant: 'neutral', label: 'Refunded' },
    };
    const s = map[status] || { variant: 'neutral', label: status };
    return <Badge variant={s.variant} dot>{s.label}</Badge>;
  };

  const getPaymentBadge = (status: Order['paymentStatus']) => {
    const map: Record<Order['paymentStatus'], { variant: BadgeVariant; label: string }> = {
      paid: { variant: 'success', label: 'Paid' },
      unpaid: { variant: 'warning', label: 'Unpaid' },
      failed: { variant: 'danger', label: 'Failed' },
      refunded: { variant: 'neutral', label: 'Refunded' },
      partially_refunded: { variant: 'neutral', label: 'Partially Refunded' },
    };
    const s = map[status] || { variant: 'neutral', label: status };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const columns: Column<Order>[] = [
    {
      key: 'orderNumber',
      header: 'Order ID',
      sortable: true,
      render: row => (
        <Link
          to={`/ecommerce/orders/${row.id}`}
          className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {row.orderNumber}
        </Link>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      sortable: true,
      render: row => (
        <div className="flex items-center gap-2.5">
          <img
            src={row.customer.avatar}
            alt={row.customer.name}
            className="w-7 h-7 rounded-full object-cover shrink-0"
          />
          <div>
            <span className="font-medium text-slate-900 dark:text-slate-100 block text-xs">
              {row.customer.name}
            </span>
            <span className="text-[11px] text-slate-400 block">{row.customer.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: row => (
        <div className="text-xs text-slate-600 dark:text-slate-400">
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {row.items[0]?.productName || 'Items'}
          </span>
          {row.items.length > 1 && (
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 ml-1">
              +{row.items.length - 1} more
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total Amount',
      sortable: true,
      align: 'right',
      render: row => (
        <span className="font-bold text-slate-900 dark:text-white">${row.total.toFixed(2)}</span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      sortable: true,
      render: row => (
        <div className="space-y-0.5">
          {getPaymentBadge(row.paymentStatus)}
          <span className="text-[10px] text-slate-400 block">{row.paymentMethod}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Order Status',
      sortable: true,
      render: row => getStatusBadge(row.status),
    },
    {
      key: 'createdAt',
      header: 'Date Created',
      sortable: true,
      render: row => <span className="text-slate-500 text-xs">{row.createdAt}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: row => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(`/ecommerce/orders/${row.id}`)}
            className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="View Order Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders Management"
        subtitle="Track customer purchases, fulfillment progress, invoices and returns."
        breadcrumbs={[{ label: 'E-Commerce' }, { label: 'Orders' }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exported orders to CSV (demo simulation)')}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
        }
      />

      <DataTable
        title="Commercial Orders"
        columns={columns}
        data={orders}
        keyField="id"
        isLoading={isLoading}
        searchPlaceholder="Search order #, customer name, email..."
        customFilters={
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="delivered">Delivered</option>
              <option value="shipped">Shipped</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className="text-xs px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Payment Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        }
      />
    </div>
  );
};
