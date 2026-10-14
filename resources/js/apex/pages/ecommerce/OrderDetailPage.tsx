import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Mail,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  User,
  Package,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';
import { useToast } from '../../context/ToastContext';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [currentStatus, setCurrentStatus] = useState<Order['status']>('processing');
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    if (id) {
      orderService.getOrderById(id).then(o => {
        if (o) {
          setOrder(o);
          setCurrentStatus(o.status);
          setAdminNote(o.notes || '');
        }
      });
    }
  }, [id]);

  if (!order) {
    return <div className="p-12 text-center text-slate-400">Loading order records...</div>;
  }

  const handleStatusChange = async (newStatus: Order['status']) => {
    setCurrentStatus(newStatus);
    try {
      await orderService.updateOrderStatus(order.id, newStatus);
      toast.success(`Order marked as ${newStatus.toUpperCase()}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleSaveNote = () => {
    toast.success('Admin note saved to order history');
  };

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order ${order.orderNumber}`}
        subtitle={`Placed on ${order.createdAt} • Payment via ${order.paymentMethod}`}
        breadcrumbs={[
          { label: 'E-Commerce', href: '/ecommerce/orders' },
          { label: 'Orders', href: '/ecommerce/orders' },
          { label: order.orderNumber },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/ecommerce/orders">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to Orders
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Print invoice view opened')}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print Invoice
            </Button>
          </div>
        }
      />

      {/* Main Order Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Items table, pricing breakdown, timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table */}
          <Card>
            <CardHeader
              title="Line Items"
              description={`${order.items.length} items included in shipment`}
              action={getStatusBadge(currentStatus)}
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 font-semibold">
                    <th className="py-2.5 px-4">Item Details</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                            {item.productName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            SKU: {item.sku}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-medium">{item.quantity}</td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                        ${item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-slate-50/70 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
              <div className="max-w-xs ml-auto space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    ${order.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Discount</span>
                  <span className="font-medium text-emerald-600">-${order.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Estimated Tax</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    ${order.tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Standard Shipping</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    ${order.shippingCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Amount</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Fulfillment & Tracking Timeline */}
          <Card>
            <CardHeader
              title="Fulfillment Timeline"
              description={`Carrier: ${order.shippingMethod} • Tracking: ${order.trackingNumber || 'Pending'}`}
            />
            <CardBody className="space-y-4">
              {order.timeline.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 relative text-xs">
                  {idx < order.timeline.length - 1 && (
                    <div className="absolute left-3 top-5 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
                  )}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      step.completed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-semibold ${
                          step.completed
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        {step.title}
                      </span>
                      <span className="text-[11px] text-slate-400">{step.timestamp}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Right Column (1 col): Status control, Customer, Addresses, Notes */}
        <div className="space-y-6">
          {/* Order Status Action Card */}
          <Card>
            <CardHeader title="Manage Status" />
            <CardBody className="space-y-4">
              <Select
                label="Fulfillment Stage"
                value={currentStatus}
                onChange={e => handleStatusChange(e.target.value as Order['status'])}
                options={[
                  { value: 'pending', label: 'Pending Payment' },
                  { value: 'processing', label: 'Processing in Warehouse' },
                  { value: 'shipped', label: 'Shipped with Carrier' },
                  { value: 'delivered', label: 'Delivered to Customer' },
                  { value: 'cancelled', label: 'Cancelled' },
                  { value: 'refunded', label: 'Refunded' },
                ]}
              />
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Payment Status</span>
                <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
                  {order.paymentStatus.toUpperCase()}
                </Badge>
              </div>
            </CardBody>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader
              title="Customer"
              action={
                <Link
                  to={`/ecommerce/customers/${order.customer.id}`}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  View Profile
                </Link>
              }
            />
            <CardBody className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={order.customer.avatar}
                  alt={order.customer.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {order.customer.name}
                  </h4>
                  <p className="text-slate-500">{order.customer.email}</p>
                  <p className="text-slate-400 text-[11px]">{order.customer.phone}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Shipping & Billing Address */}
          <Card>
            <CardHeader title="Addresses" />
            <CardBody className="space-y-4 text-xs">
              <div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Shipping Address</span>
                </div>
                <p className="text-slate-500 leading-relaxed pl-5">
                  {order.shippingAddress.street}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                  <br />
                  {order.shippingAddress.country}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Billing Address</span>
                </div>
                <p className="text-slate-500 leading-relaxed pl-5">
                  {order.billingAddress.street}
                  <br />
                  {order.billingAddress.city}, {order.billingAddress.state}{' '}
                  {order.billingAddress.zipCode}
                  <br />
                  {order.billingAddress.country}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Internal Notes */}
          <Card>
            <CardHeader title="Internal Staff Note" />
            <CardBody className="space-y-2 text-xs">
              <textarea
                rows={3}
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="Add private staff note or dispatch instructions..."
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button size="sm" onClick={handleSaveNote} className="w-full">
                Save Note
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
