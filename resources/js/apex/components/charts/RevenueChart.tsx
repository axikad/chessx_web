import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { revenueAnalyticsData } from '../../data/dashboard';

export const RevenueChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '12m'>('7d');
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');
  const [metric, setMetric] = useState<'revenue' | 'orders' | 'customers'>('revenue');

  const data = revenueAnalyticsData[timeRange];

  const formatYAxis = (val: number) => {
    if (metric === 'revenue') {
      if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
      return `$${val}`;
    }
    return val.toString();
  };

  const metricColors = {
    revenue: { stroke: '#4f46e5', fill: '#4f46e5' },
    orders: { stroke: '#06b6d4', fill: '#06b6d4' },
    customers: { stroke: '#10b981', fill: '#10b981' },
  };

  const currentColor = metricColors[metric];

  return (
    <div className="w-full">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium w-fit">
          <button
            onClick={() => setMetric('revenue')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              metric === 'revenue'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setMetric('orders')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              metric === 'orders'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setMetric('customers')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              metric === 'customers'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Customers
          </button>
        </div>

        {/* Chart Type & Period Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart visual type */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 rounded transition-colors ${
                chartType === 'area'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 rounded transition-colors ${
                chartType === 'line'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1 rounded transition-colors ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Bar
            </button>
          </div>

          {/* Time range tabs */}
          <div className="flex items-center gap-1 text-xs">
            {(['7d', '30d', '90d', '12m'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentColor.fill} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={currentColor.fill} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
              <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tickFormatter={formatYAxis} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '10px',
                  border: '1px solid #1e293b',
                  fontSize: '12px',
                  color: '#fff',
                }}
                formatter={(value: any) => [
                  metric === 'revenue' ? `$${Number(value).toLocaleString()}` : Number(value).toLocaleString(),
                  metric.toUpperCase(),
                ]}
              />
              <Area
                type="monotone"
                dataKey={metric}
                stroke={currentColor.stroke}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorMetric)"
              />
            </AreaChart>
          ) : chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
              <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tickFormatter={formatYAxis} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '10px',
                  border: '1px solid #1e293b',
                  fontSize: '12px',
                  color: '#fff',
                }}
                formatter={(value: any) => [
                  metric === 'revenue' ? `$${Number(value).toLocaleString()}` : Number(value).toLocaleString(),
                  metric.toUpperCase(),
                ]}
              />
              <Line
                type="monotone"
                dataKey={metric}
                stroke={currentColor.stroke}
                strokeWidth={2.5}
                dot={{ r: 3, fill: currentColor.stroke }}
              />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
              <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tickFormatter={formatYAxis} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '10px',
                  border: '1px solid #1e293b',
                  fontSize: '12px',
                  color: '#fff',
                }}
                formatter={(value: any) => [
                  metric === 'revenue' ? `$${Number(value).toLocaleString()}` : Number(value).toLocaleString(),
                  metric.toUpperCase(),
                ]}
              />
              <Bar dataKey={metric} fill={currentColor.fill} radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
