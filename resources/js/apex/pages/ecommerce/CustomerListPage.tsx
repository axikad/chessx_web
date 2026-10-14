import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Mail, UserPlus, Download } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { customerService } from '../../services/customerService';
import { Customer } from '../../types';
import { useToast } from '../../context/ToastContext';

export const CustomerListPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const { toast } = useToast();
  const navigate = useNavigate();

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await customerService.getCustomers({
        filters: { status: statusFilter },
      });
      setCustomers(res.data);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [statusFilter]);

  const getStatusBadge = (status: Customer['status']) => {
    const map: Record<Customer['status'], { variant: BadgeVariant; label: string }> = {
      active: { variant: 'success', label: 'Active' },
      inactive: { variant: 'neutral', label: 'Inactive' },
      blocked: { variant: 'danger', label: 'Blocked' },
    };
    const s = map[status] || { variant: 'neutral', label: status };
    return <Badge variant={s.variant} dot>{s.label}</Badge>;
  };

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Customer',
      sortable: true,
      render: row => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar}
            alt={row.name}
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
          <div>
            <Link
              to={`/ecommerce/customers/${row.id}`}
              className="font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 block"
            >
              {row.name}
            </Link>
            <span className="text-[11px] text-slate-400">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: row => <span className="text-slate-500 font-mono text-xs">{row.phone}</span>,
    },
    {
      key: 'ordersCount',
      header: 'Total Orders',
      sortable: true,
      align: 'right',
      render: row => <span className="font-semibold text-xs">{row.ordersCount} orders</span>,
    },
    {
      key: 'totalSpent',
      header: 'Lifetime Spent',
      sortable: true,
      align: 'right',
      render: row => (
        <span className="font-bold text-slate-900 dark:text-white text-xs">
          ${row.totalSpent.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Account Status',
      sortable: true,
      render: row => getStatusBadge(row.status),
    },
    {
      key: 'lastOrderDate',
      header: 'Last Order',
      sortable: true,
      render: row => <span className="text-slate-500 text-xs">{row.lastOrderDate}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: row => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(`/ecommerce/customers/${row.id}`)}
            className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="View Profile"
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
        title="Customer Directory"
        subtitle="Manage registered clients, spending accounts, customer value, and engagement."
        breadcrumbs={[{ label: 'E-Commerce' }, { label: 'Customers' }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Customer list exported to CSV')}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export Clients
          </Button>
        }
      />

      <DataTable
        title="Verified Customers"
        columns={columns}
        data={customers}
        keyField="id"
        isLoading={isLoading}
        searchPlaceholder="Search customer name, email, phone..."
        customFilters={
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>
        }
      />
    </div>
  );
};
