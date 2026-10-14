import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Download, FileText, Send, DollarSign } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { invoiceService } from '../../services/invoiceService';
import { Invoice } from '../../types';
import { useToast } from '../../context/ToastContext';

export const InvoiceListPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const { toast } = useToast();
  const navigate = useNavigate();

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await invoiceService.getInvoices({
        filters: { status: statusFilter },
      });
      setInvoices(res.data);
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  const getStatusBadge = (status: Invoice['status']) => {
    const map: Record<Invoice['status'], { variant: BadgeVariant; label: string }> = {
      paid: { variant: 'success', label: 'Paid' },
      pending: { variant: 'warning', label: 'Pending' },
      overdue: { variant: 'danger', label: 'Overdue' },
      cancelled: { variant: 'neutral', label: 'Cancelled' },
    };
    const s = map[status] || { variant: 'neutral', label: status };
    return <Badge variant={s.variant} dot>{s.label}</Badge>;
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      sortable: true,
      render: row => (
        <Link
          to={`/invoices/${row.id}`}
          className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {row.invoiceNumber}
        </Link>
      ),
    },
    {
      key: 'customer',
      header: 'Client / Company',
      sortable: true,
      render: row => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block text-xs">
            {row.customer.name}
          </span>
          <span className="text-[11px] text-slate-400">{row.customer.email}</span>
        </div>
      ),
    },
    {
      key: 'issueDate',
      header: 'Issued Date',
      sortable: true,
      render: row => <span className="text-slate-500 text-xs">{row.issueDate}</span>,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      render: row => <span className="text-slate-500 text-xs">{row.dueDate}</span>,
    },
    {
      key: 'total',
      header: 'Amount',
      sortable: true,
      align: 'right',
      render: row => (
        <span className="font-bold text-slate-900 dark:text-white text-xs">
          ${row.total.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: row => getStatusBadge(row.status),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: row => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(`/invoices/${row.id}`)}
            className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="View & Print Invoice"
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
        title="Invoicing & Billing"
        subtitle="Commercial billing records, issued statements, and payment statuses."
        breadcrumbs={[{ label: 'Invoices' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Invoices exported to CSV')}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export
            </Button>
            <Link to="/invoices/new">
              <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Create Invoice
              </Button>
            </Link>
          </div>
        }
      />

      <DataTable
        title="All Billing Invoices"
        columns={columns}
        data={invoices}
        keyField="id"
        isLoading={isLoading}
        searchPlaceholder="Search invoice #, client, email..."
        customFilters={
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Invoices</option>
            <option value="paid">Paid</option>
            <option value="sent">Sent</option>
            <option value="draft">Draft</option>
            <option value="overdue">Overdue</option>
          </select>
        }
      />
    </div>
  );
};
