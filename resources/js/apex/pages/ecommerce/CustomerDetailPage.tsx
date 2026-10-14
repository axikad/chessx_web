import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ShoppingBag,
  MapPin,
  FileText,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { customerService } from '../../services/customerService';
import { mockOrders } from '../../data/orders';
import { Customer } from '../../types';
import { useToast } from '../../context/ToastContext';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (id) {
      customerService.getCustomerById(id).then(c => {
        if (c) setCustomer(c);
      });
    }
  }, [id]);

  if (!customer) {
    return <div className="p-12 text-center text-slate-400">Loading customer account...</div>;
  }

  const customerOrders = mockOrders.filter(o => o.customer.id === customer.id);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    toast.success('Customer log note appended to record');
    setNote('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        subtitle={`Customer since ${customer.registeredDate} • ${customer.ordersCount} completed orders`}
        breadcrumbs={[
          { label: 'E-Commerce', href: '/ecommerce/customers' },
          { label: 'Customers', href: '/ecommerce/customers' },
          { label: customer.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/ecommerce/customers">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to Customers
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info(`Email sent to ${customer.email}`)}
              leftIcon={<Mail className="w-3.5 h-3.5" />}
            >
              Contact Customer
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 col): Profile Info & Addresses */}
        <div className="space-y-6">
          <Card>
            <CardBody className="p-6 text-center">
              <img
                src={customer.avatar}
                alt={customer.name}
                className="w-20 h-20 rounded-full mx-auto object-cover ring-4 ring-indigo-50 dark:ring-indigo-950 shadow-md mb-3"
              />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{customer.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{customer.email}</p>
              <div className="mt-3">
                <Badge variant={customer.status === 'active' ? 'success' : 'neutral'} dot>
                  {customer.status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 text-left text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Phone</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{customer.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Member Since</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {customer.registeredDate}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Primary Address */}
          <Card>
            <CardHeader title="Saved Addresses" />
            <CardBody className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white mb-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Default Shipping Address</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed pl-5">
                  {customer.address.street}
                  <br />
                  {customer.address.city}, {customer.address.state} {customer.address.zipCode}
                  <br />
                  {customer.address.country}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column (2 cols): Spending metrics, Orders history, notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4">
              <span className="text-xs text-slate-400 font-medium">Lifetime Gross Spend</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                ${customer.totalSpent.toFixed(2)}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">+18% high-value tier</span>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-slate-400 font-medium">Completed Orders</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {customer.ordersCount}
              </div>
              <span className="text-[11px] text-slate-400">Zero disputes or chargebacks</span>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-slate-400 font-medium">Average Basket Size</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                ${(customer.totalSpent / (customer.ordersCount || 1)).toFixed(2)}
              </div>
              <span className="text-[11px] text-indigo-600 font-medium">Per checkout session</span>
            </Card>
          </div>

          {/* Customer Order History */}
          <Card>
            <CardHeader
              title="Recent Purchases"
              description="Orders placed by this customer"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 font-semibold">
                    <th className="py-2.5 px-4">Order ID</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {customerOrders.length > 0 ? (
                    customerOrders.map(ord => (
                      <tr key={ord.id}>
                        <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                          <Link to={`/ecommerce/orders/${ord.id}`}>{ord.orderNumber}</Link>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{ord.createdAt}</td>
                        <td className="py-3 px-4 text-right font-bold">${ord.total.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <Badge variant="success" dot>
                            {ord.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/ecommerce/orders/${ord.id}`}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No orders recorded for this customer yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Staff CRM Notes */}
          <Card>
            <CardHeader title="Account Activity & Notes" />
            <CardBody className="space-y-4">
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  <div className="flex justify-between font-medium text-slate-900 dark:text-white mb-0.5">
                    <span>VIP Corporate Account Rep</span>
                    <span className="text-[10px] text-slate-400">May 14, 2026</span>
                  </div>
                  <p className="text-slate-500">
                    Requested priority dispatch and bulk discount pricing on next display hardware shipment.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Write a new account note or internal reminder..."
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button type="submit" size="sm" leftIcon={<Send className="w-3.5 h-3.5" />}>
                  Post Note
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
