import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  CreditCard,
  ExternalLink,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SparklineChart } from '../../components/charts/SparklineChart';
import { RevenueChart } from '../../components/charts/RevenueChart';
import { CategoryPieChart } from '../../components/charts/CategoryPieChart';
import { PerformanceCard } from '../../components/charts/PerformanceCard';
import { primaryKPICards, mockRecentActivities } from '../../data/dashboard';
import { mockOrders } from '../../data/orders';
import { mockProducts } from '../../data/products';
import { useToast } from '../../context/ToastContext';

export const OverviewDashboard: React.FC = () => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Dashboard metrics refreshed');
    }, 400);
  };

  const getKPIIcon = (name: string) => {
    switch (name) {
      case 'DollarSign': return <DollarSign className="w-5 h-5" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      case 'Package': return <Package className="w-5 h-5" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5" />;
      case 'CreditCard': return <CreditCard className="w-5 h-5" />;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: BadgeVariant; label: string }> = {
      delivered: { variant: 'success', label: 'Delivered' },
      shipped: { variant: 'info', label: 'Shipped' },
      processing: { variant: 'primary', label: 'Processing' },
      pending: { variant: 'warning', label: 'Pending' },
      cancelled: { variant: 'danger', label: 'Cancelled' },
    };
    const s = map[status] || { variant: 'neutral', label: status };
    return <Badge variant={s.variant} dot>{s.label}</Badge>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="System Overview"
        subtitle="Real-time commercial performance, active orders, and sales analytics."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Export Data
            </Button>
            <Link to="/ecommerce/products/create">
              <Button size="sm" leftIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                + Create Report
              </Button>
            </Link>
          </div>
        }
      />

      {/* Geometric Balance KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {primaryKPICards.map((kpi, idx) => {
          // Geometric color cycle for icon boxes
          const iconColors = [
            'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
            'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
            'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
            'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
            'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
            'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
          ];
          const colorClass = iconColors[idx % iconColors.length];

          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${colorClass}`}>
                    {getKPIIcon(kpi.icon)}
                  </div>
                  <span
                    className={`text-xs font-bold flex items-center px-2 py-0.5 rounded-full ${
                      kpi.isPositive
                        ? 'text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                        : 'text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
                    }`}
                  >
                    {kpi.isPositive ? `+${kpi.change}%` : `${kpi.change}%`}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  {kpi.title}
                </p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                  {kpi.value}
                </h3>
              </div>

              {/* Sparkline */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                <div className="mb-1">
                  <SparklineChart data={kpi.sparkline} isPositive={kpi.isPositive} height={26} />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">vs previous month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Analytics & Category Breakdown (Section 3.B, 3.C, 3.D) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart (2 cols) */}
        <Card className="lg:col-span-2 !rounded-3xl shadow-sm">
          <CardHeader
            title="Revenue & Growth Analytics"
            description="Multi-metric visualizer with flexible temporal granularity"
          />
          <CardBody>
            <RevenueChart />
          </CardBody>
        </Card>

        {/* Revenue by Category Donut (1 col) */}
        <Card className="!rounded-3xl shadow-sm">
          <CardHeader
            title="Revenue by Category"
            description="Distribution across top product departments"
          />
          <CardBody>
            <CategoryPieChart />
          </CardBody>
        </Card>
      </div>

      {/* Performance Overview & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Overview (Section 3.H) */}
        <Card>
          <CardHeader
            title="Performance Target"
            description="Monthly sales quota and benchmark pacing"
          />
          <CardBody>
            <PerformanceCard />
          </CardBody>
        </Card>

        {/* Top Selling Products (Section 3.F) */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Top Performing Products"
            description="Highest grossing items in inventory catalog"
            action={
              <Link
                to="/ecommerce/products"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                View all
                <ExternalLink className="w-3 h-3" />
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 font-semibold">
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-right">Units Sold</th>
                  <th className="py-2.5 px-4 text-right">Gross Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockProducts.slice(0, 4).map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div>
                        <Link
                          to={`/ecommerce/products/${product.id}`}
                          className="font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-1"
                        >
                          {product.name}
                        </Link>
                        <span className="text-[11px] text-slate-400 font-mono">{product.sku}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{product.category}</td>
                    <td className="py-3 px-4 text-right font-medium">{product.salesCount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      ${product.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Recent Orders & Activity Timeline (Section 3.E, 3.G) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table (2 cols) */}
        <Card className="lg:col-span-2 !rounded-3xl shadow-sm">
          <CardHeader
            title="Recent Orders"
            description="Live feed of outbound transactions"
            action={
              <Link
                to="/ecommerce/orders"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                View all orders
                <ExternalLink className="w-3 h-3" />
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 font-semibold">
                  <th className="py-2.5 px-4">Order ID</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Total</th>
                  <th className="py-2.5 px-4">Payment</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockOrders.slice(0, 5).map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      <Link to={`/ecommerce/orders/${order.id}`}>{order.orderNumber}</Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={order.customer.avatar}
                          alt={order.customer.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                          {order.customer.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {order.paymentMethod}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/ecommerce/orders/${order.id}`}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Activity Timeline (Section 3.G) */}
        <Card className="!rounded-3xl shadow-sm">
          <CardHeader
            title="Recent Activity"
            description="Real-time operational audit log"
          />
          <CardBody className="space-y-5">
            {mockRecentActivities.map((act, idx) => {
              const nodeColors = [
                'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
                'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
                'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
                'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
              ];
              const colorClass = nodeColors[idx % nodeColors.length];

              return (
                <div key={act.id} className="flex gap-4 relative">
                  {/* Connecting line */}
                  {idx < mockRecentActivities.length - 1 && (
                    <div className="absolute left-[17px] top-9 bottom-[-20px] w-0.5 bg-slate-100 dark:bg-slate-800" />
                  )}
                  <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center z-10 ${colorClass}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight mb-1">
                      {act.action}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 leading-relaxed">
                      {act.target} by <span className="font-medium text-slate-700 dark:text-slate-300">{act.user}</span>
                    </p>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {act.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
