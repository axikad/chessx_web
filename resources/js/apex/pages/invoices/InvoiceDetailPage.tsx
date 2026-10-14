import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Download,
  Send,
  CheckCircle,
  Building,
  CreditCard,
  FileText,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { invoiceService } from '../../services/invoiceService';
import { Invoice } from '../../types';
import { useToast } from '../../context/ToastContext';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [status, setStatus] = useState<Invoice['status']>('pending');

  useEffect(() => {
    if (id) {
      invoiceService.getInvoiceById(id).then(inv => {
        if (inv) {
          setInvoice(inv);
          setStatus(inv.status);
        }
      });
    }
  }, [id]);

  if (!invoice) {
    return <div className="p-12 text-center text-slate-400">Loading invoice document...</div>;
  }

  const handleMarkAsPaid = async () => {
    setStatus('paid');
    await invoiceService.updateInvoiceStatus(invoice.id, 'paid');
    toast.success('Invoice marked as PAID');
  };

  const getStatusBadge = (s: Invoice['status']) => {
    const map: Record<Invoice['status'], { variant: BadgeVariant; label: string }> = {
      paid: { variant: 'success', label: 'Paid' },
      pending: { variant: 'warning', label: 'Pending' },
      overdue: { variant: 'danger', label: 'Overdue' },
      cancelled: { variant: 'neutral', label: 'Cancelled' },
    };
    const item = map[s] || { variant: 'neutral', label: s };
    return <Badge variant={item.variant} dot>{item.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Invoice ${invoice.invoiceNumber}`}
        subtitle={`Issued on ${invoice.issueDate} • Due by ${invoice.dueDate}`}
        breadcrumbs={[
          { label: 'Invoices', href: '/invoices' },
          { label: invoice.invoiceNumber },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/invoices">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to Invoices
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success(`Invoice emailed to ${invoice.customer.email}`)}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Send to Client
            </Button>
            {status !== 'paid' && (
              <Button size="sm" onClick={handleMarkAsPaid} leftIcon={<CheckCircle className="w-3.5 h-3.5" />}>
                Mark as Paid
              </Button>
            )}
          </div>
        }
      />

      {/* Printable Invoice Document Sheet */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-8 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                A
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Apex Enterprises Inc.
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              100 Innovation Way, Suite 800
              <br />
              San Francisco, CA 94105, United States
              <br />
              billing@apexenterprises.io
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="inline-block">{getStatusBadge(status)}</div>
            <h2 className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              {invoice.invoiceNumber}
            </h2>
            <p className="text-xs text-slate-500">Issued: {invoice.issueDate}</p>
            <p className="text-xs text-slate-500 font-semibold">Payment Due: {invoice.dueDate}</p>
          </div>
        </div>

        {/* Billed To / Client Coordinates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">
              Billed To:
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{invoice.customer.name}</h4>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              {invoice.customer.company}
              <br />
              {invoice.customer.address}
              <br />
              {invoice.customer.email}
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">
              Payment Method:
            </span>
            <p className="text-slate-700 dark:text-slate-300 font-medium">Wire Transfer (ACH / SWIFT)</p>
            <p className="text-slate-500 mt-1">Currency: USD ($)</p>
          </div>
        </div>

        {/* Invoice Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2 text-center">Qty</th>
                <th className="py-3 px-2 text-right">Unit Rate</th>
                <th className="py-3 px-2 text-right">Tax</th>
                <th className="py-3 px-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3.5 px-2">
                    <span className="font-semibold text-slate-900 dark:text-white block">{item.description}</span>
                  </td>
                  <td className="py-3.5 px-2 text-center text-slate-600 dark:text-slate-400 font-medium">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 px-2 text-right text-slate-600 dark:text-slate-400">
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-2 text-right text-slate-500">{item.taxPercent}%</td>
                  <td className="py-3.5 px-2 text-right font-bold text-slate-900 dark:text-white">
                    ${item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Calculation Box */}
        <div className="flex justify-end pt-4">
          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                ${invoice.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax Rate (8.5%):</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">${invoice.tax.toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span className="font-medium">-${invoice.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Total Due:</span>
              <span className="text-indigo-600 dark:text-indigo-400">${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Wire Instructions */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-500">
          <div>
            <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Payment Instructions:</h5>
            <p className="leading-relaxed">
              Bank: Silicon Valley Bank
              <br />
              Account Name: Apex Enterprises Inc.
              <br />
              Account Number: 9874-2309-1123
              <br />
              Routing / SWIFT: SVBUS6S
            </p>
          </div>
          <div>
            <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Terms & Notes:</h5>
            <p className="leading-relaxed">
              {invoice.notes ||
                'Thank you for your business. Payment is due within 15 days of invoice date. Please quote invoice number with wire transfer.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
