import React, { useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Users2,
  Building2,
  Truck,
  FolderKanban,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Globe,
  Compass,
  CreditCard,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

export const DashboardVariants: React.FC = () => {
  const { variant = 'analytics' } = useParams<{ variant: string }>();

  const variantTabs = [
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'sales', label: 'Sales Pipeline', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'ecommerce', label: 'E-Commerce', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'crm', label: 'CRM & Accounts', icon: <Users2 className="w-4 h-4" /> },
    { id: 'finance', label: 'Finance & Ledger', icon: <Building2 className="w-4 h-4" /> },
    { id: 'logistics', label: 'Logistics & Fleet', icon: <Truck className="w-4 h-4" /> },
    { id: 'project', label: 'Project Portfolio', icon: <FolderKanban className="w-4 h-4" /> },
  ];

  // Render specific content depending on variant
  return (
    <div className="space-y-6">
      <PageHeader
        title={`${variant.charAt(0).toUpperCase() + variant.slice(1)} Dashboard`}
        subtitle="Specialized domain KPI matrix and business intelligence widgets."
      />

      {/* Navigation Pills between dashboard variants */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto">
        {variantTabs.map(tab => (
          <NavLink
            key={tab.id}
            to={`/dashboard/${tab.id}`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            {tab.icon}
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Variant-specific dashboard contents */}
      {variant === 'analytics' && <AnalyticsView />}
      {variant === 'sales' && <SalesView />}
      {variant === 'ecommerce' && <ECommerceView />}
      {variant === 'crm' && <CRMView />}
      {variant === 'finance' && <FinanceView />}
      {variant === 'logistics' && <LogisticsView />}
      {variant === 'project' && <ProjectView />}
    </div>
  );
};

/* 1. Analytics Dashboard */
const AnalyticsView = () => {
  const trafficData = [
    { day: 'Mon', organic: 3400, direct: 1800, referral: 820 },
    { day: 'Tue', organic: 4100, direct: 2200, referral: 950 },
    { day: 'Wed', organic: 4800, direct: 2600, referral: 1200 },
    { day: 'Thu', organic: 5200, direct: 2900, referral: 1100 },
    { day: 'Fri', organic: 6100, direct: 3400, referral: 1450 },
    { day: 'Sat', organic: 4300, direct: 2100, referral: 900 },
    { day: 'Sun', organic: 3800, direct: 1900, referral: 780 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Unique Visitors', val: '482,910', chg: '+14.2%', up: true },
          { label: 'Bounce Rate', val: '28.4%', chg: '-3.1%', up: true },
          { label: 'Avg Session Duration', val: '4m 32s', chg: '+18.5%', up: true },
          { label: 'Page Views / Session', val: '5.82', chg: '+6.8%', up: true },
        ].map((item, i) => (
          <Card key={i} className="p-4">
            <span className="text-xs text-slate-500 font-medium">{item.label}</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xl font-bold text-slate-900 dark:text-white">{item.val}</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{item.chg}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Traffic Acquisition by Source" description="Organic Search vs Direct vs Referral visits" />
          <CardBody>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="organic" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="direct" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="referral" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Geographic Distribution" description="Top converting countries" />
          <CardBody className="space-y-3">
            {[
              { country: 'United States', visitors: '184,200', pct: '38%' },
              { country: 'Germany', visitors: '68,140', pct: '14%' },
              { country: 'United Kingdom', visitors: '52,900', pct: '11%' },
              { country: 'Canada', visitors: '41,800', pct: '9%' },
              { country: 'Japan', visitors: '34,200', pct: '7%' },
            ].map((g, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">{g.country}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">{g.visitors}</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{g.pct}</span>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

/* 2. Sales Pipeline Dashboard */
const SalesView = () => {
  const salesFunnel = [
    { stage: 'Leads Generated', count: 1240, value: '$2,480,000', pct: 100 },
    { stage: 'Qualified Meetings', count: 680, value: '$1,520,000', pct: 68 },
    { stage: 'Proposal / Quote Sent', count: 320, value: '$840,000', pct: 38 },
    { stage: 'Negotiation', count: 140, value: '$460,000', pct: 21 },
    { stage: 'Closed Won', count: 98, value: '$342,000', pct: 14 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <span className="text-xs text-slate-500">Pipeline Total Value</span>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">$5,642,000</h3>
          <span className="text-xs text-emerald-600 font-semibold">+22% month over month</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-500">Average Deal Size</span>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">$34,800</h3>
          <span className="text-xs text-emerald-600 font-semibold">+8.4% improvement</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-500">Win Rate</span>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">29.6%</h3>
          <span className="text-xs text-slate-400">Target benchmark: 28%</span>
        </Card>
      </div>

      <Card>
        <CardHeader title="Sales Deal Conversion Funnel" description="Velocity across enterprise deal pipeline" />
        <CardBody className="space-y-4">
          {salesFunnel.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.stage}</span>
                <span className="text-slate-500">{item.count} deals • <span className="font-bold text-slate-900 dark:text-white">{item.value}</span></span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
};

/* 3. E-Commerce Dashboard */
const ECommerceView = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-slate-500">Cart Abandonment</span>
          <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">18.2%</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">-2.4% better than industry avg</p>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-500">Return Rate</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">1.8%</h3>
          <p className="text-[11px] text-emerald-600 mt-0.5">Very low return disputes</p>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-500">Repeat Customer Rate</span>
          <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">42.5%</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">High customer lifetime value</p>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-500">Fulfillment Time</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">14.2 hrs</h3>
          <p className="text-[11px] text-emerald-600 mt-0.5">Same-day dispatch on 92% orders</p>
        </Card>
      </div>

      <Card>
        <CardHeader title="Inventory Health Status" description="SKU threshold warnings across distribution centers" />
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold block">Adequate Stock</span>
              <span className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1 block">1,340 SKUs</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">94% of active catalog</span>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
              <span className="text-amber-700 dark:text-amber-300 font-semibold block">Low Stock Alert</span>
              <span className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-1 block">18 SKUs</span>
              <span className="text-amber-600 dark:text-amber-400 text-[11px]">Re-orders automatically dispatched</span>
            </div>
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
              <span className="text-rose-700 dark:text-rose-300 font-semibold block">Out of Stock</span>
              <span className="text-2xl font-bold text-rose-900 dark:text-rose-100 mt-1 block">4 SKUs</span>
              <span className="text-rose-600 dark:text-rose-400 text-[11px]">Supplier lead time ~4 days</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

/* 4. CRM Dashboard */
const CRMView = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Accounts', val: '840', sub: 'Enterprise & Mid-market' },
          { label: 'Open Support Tickets', val: '14', sub: 'Avg response 18 min' },
          { label: 'NPS Customer Score', val: '74 / 100', sub: 'World-class satisfaction' },
          { label: 'Contract Renewals', val: '98.2%', sub: 'Q2 retention pacing' },
        ].map((c, i) => (
          <Card key={i} className="p-4">
            <span className="text-xs text-slate-500">{c.label}</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{c.val}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{c.sub}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* 5. Finance Dashboard */
const FinanceView = () => {
  const financeData = [
    { month: 'Jan', income: 94000, expenses: 62000, net: 32000 },
    { month: 'Feb', income: 108000, expenses: 68000, net: 40000 },
    { month: 'Mar', income: 122000, expenses: 71000, net: 51000 },
    { month: 'Apr', income: 118000, expenses: 69000, net: 49000 },
    { month: 'May', income: 134000, expenses: 74000, net: 60000 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <span className="text-xs text-slate-500">Gross Operating Profit</span>
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">$232,000</h3>
          <span className="text-xs text-slate-400">Operating margin 44.8%</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-500">Total Accounts Receivable</span>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">$48,920</h3>
          <span className="text-xs text-slate-400">92% current / 8% past due</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-500">Monthly Burn Rate</span>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">$74,000</h3>
          <span className="text-xs text-emerald-600 font-semibold">Profitable cashflow positive</span>
        </Card>
      </div>

      <Card>
        <CardHeader title="Income vs Operational Expenses" description="Monthly Cash Flow Overview" />
        <CardBody>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="income" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Income ($)" />
                <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expenses ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

/* 6. Logistics Dashboard */
const LogisticsView = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Shipments', val: '412', status: 'In Transit' },
          { label: 'On-Time Delivery', val: '98.6%', status: 'Within ETA window' },
          { label: 'Average Dispatch Lag', val: '2.4 hrs', status: 'Fulfillment speed' },
          { label: 'Carrier Exceptions', val: '3 packages', status: 'Weather delay' },
        ].map((l, i) => (
          <Card key={i} className="p-4">
            <span className="text-xs text-slate-500">{l.label}</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{l.val}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{l.status}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* 7. Project Dashboard */
const ProjectView = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <span className="text-xs text-slate-500">Active Sprint Tasks</span>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">48 / 64</h3>
          <span className="text-xs text-emerald-600 font-semibold">75% completed</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-500">Deployment Uptime</span>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">99.98%</h3>
          <span className="text-xs text-slate-400">All services healthy</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-500">Code Reviews Pending</span>
          <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">5 PRs</h3>
          <span className="text-xs text-slate-400">Average review latency 1.2 hrs</span>
        </Card>
      </div>
    </div>
  );
};
