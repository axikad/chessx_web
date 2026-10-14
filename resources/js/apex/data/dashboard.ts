import { KPICardData, ActivityItem, NotificationItem } from '../types';

export const primaryKPICards: KPICardData[] = [
  {
    title: 'Total Revenue',
    value: '$128,430.00',
    previousPeriod: '$109,210.00',
    change: 17.6,
    isPositive: true,
    sparkline: [45, 52, 49, 62, 58, 70, 75, 84],
    icon: 'DollarSign',
  },
  {
    title: 'Total Orders',
    value: '3,842',
    previousPeriod: '3,520',
    change: 9.1,
    isPositive: true,
    sparkline: [28, 32, 30, 42, 38, 45, 48, 54],
    icon: 'ShoppingBag',
  },
  {
    title: 'Active Customers',
    value: '14,290',
    previousPeriod: '12,980',
    change: 10.1,
    isPositive: true,
    sparkline: [60, 64, 68, 71, 75, 82, 88, 95],
    icon: 'Users',
  },
  {
    title: 'Active Products',
    value: '1,420',
    previousPeriod: '1,450',
    change: -2.1,
    isPositive: false,
    sparkline: [95, 93, 90, 88, 89, 87, 85, 84],
    icon: 'Package',
  },
  {
    title: 'Conversion Rate',
    value: '3.84%',
    previousPeriod: '3.20%',
    change: 20.0,
    isPositive: true,
    sparkline: [2.5, 2.8, 3.0, 3.1, 3.4, 3.6, 3.8, 3.84],
    icon: 'TrendingUp',
  },
  {
    title: 'Avg Order Value',
    value: '$142.50',
    previousPeriod: '$135.00',
    change: 5.5,
    isPositive: true,
    sparkline: [120, 125, 128, 132, 136, 138, 140, 142.5],
    icon: 'CreditCard',
  },
];

export const revenueAnalyticsData = {
  '7d': [
    { period: 'Mon', revenue: 14200, orders: 120, customers: 85 },
    { period: 'Tue', revenue: 18500, orders: 154, customers: 110 },
    { period: 'Wed', revenue: 16800, orders: 142, customers: 98 },
    { period: 'Thu', revenue: 22400, orders: 190, customers: 145 },
    { period: 'Fri', revenue: 26900, orders: 230, customers: 172 },
    { period: 'Sat', revenue: 29500, orders: 265, customers: 195 },
    { period: 'Sun', revenue: 21800, orders: 188, customers: 130 },
  ],
  '30d': [
    { period: 'Week 1', revenue: 84000, orders: 740, customers: 510 },
    { period: 'Week 2', revenue: 96500, orders: 830, customers: 590 },
    { period: 'Week 3', revenue: 104200, orders: 910, customers: 680 },
    { period: 'Week 4', revenue: 118400, orders: 1020, customers: 760 },
  ],
  '90d': [
    { period: 'Month 1', revenue: 340000, orders: 2900, customers: 2100 },
    { period: 'Month 2', revenue: 395000, orders: 3400, customers: 2540 },
    { period: 'Month 3', revenue: 462000, orders: 4100, customers: 3120 },
  ],
  '12m': [
    { period: 'Jan', revenue: 95000, orders: 810, customers: 610 },
    { period: 'Feb', revenue: 104000, orders: 890, customers: 680 },
    { period: 'Mar', revenue: 118000, orders: 1010, customers: 740 },
    { period: 'Apr', revenue: 112000, orders: 980, customers: 710 },
    { period: 'May', revenue: 134000, orders: 1150, customers: 890 },
    { period: 'Jun', revenue: 145000, orders: 1260, customers: 960 },
    { period: 'Jul', revenue: 152000, orders: 1320, customers: 1020 },
    { period: 'Aug', revenue: 160000, orders: 1410, customers: 1100 },
    { period: 'Sep', revenue: 158000, orders: 1380, customers: 1080 },
    { period: 'Oct', revenue: 172000, orders: 1510, customers: 1190 },
    { period: 'Nov', revenue: 198000, orders: 1750, customers: 1340 },
    { period: 'Dec', revenue: 224000, orders: 1980, customers: 1520 },
  ],
};

export const categoryBreakdownData = [
  { name: 'Computer Peripherals', value: 38, amount: 48803, color: '#3b82f6' },
  { name: 'Office Furniture', value: 27, amount: 34676, color: '#10b981' },
  { name: 'Consumer Electronics', value: 20, amount: 25686, color: '#8b5cf6' },
  { name: 'Office Accessories', value: 15, amount: 19265, color: '#f59e0b' },
];

export const mockRecentActivities: ActivityItem[] = [
  {
    id: 'act_01',
    user: 'Alexander Wright',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    action: 'Dispatched order',
    target: 'ORD-2024-8841 ($790.80)',
    timestamp: '12 minutes ago',
    type: 'order',
  },
  {
    id: 'act_02',
    user: 'Sophia Vance',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    action: 'Issued invoice',
    target: 'INV-2024-00110 to Dr. Lucas Sterling',
    timestamp: '45 minutes ago',
    type: 'invoice',
  },
  {
    id: 'act_03',
    user: 'Marcus Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    action: 'Updated inventory price for',
    target: 'UltraWide 34-Inch Curved Display',
    timestamp: '2 hours ago',
    type: 'product',
  },
  {
    id: 'act_04',
    user: 'David Kalu',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    action: 'Resolved dispute for customer',
    target: 'Beatrice Delgado (Delgado Media)',
    timestamp: '4 hours ago',
    type: 'user',
  },
  {
    id: 'act_05',
    user: 'System Bot',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    action: 'Nightly database snapshot & backup completed',
    target: 'Cluster ap-southeast-1',
    timestamp: '7 hours ago',
    type: 'system',
  },
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif_01',
    title: 'High-Value Order Received',
    message: 'Evelyn St. Claire placed an order worth $790.80',
    timestamp: '10 min ago',
    read: false,
    type: 'order',
  },
  {
    id: 'notif_02',
    title: 'Low Stock Alert',
    message: 'Thunderbolt 4 Docking Hub is down to 8 units in warehouse',
    timestamp: '1 hour ago',
    read: false,
    type: 'alert',
  },
  {
    id: 'notif_03',
    title: 'Payout Dispatched',
    message: 'Stripe payout of $24,190.00 settled to primary bank account',
    timestamp: '3 hours ago',
    read: true,
    type: 'payment',
  },
  {
    id: 'notif_04',
    title: 'New Enterprise Lead',
    message: 'Sterling Genomics requested a custom quote for 25 monitors',
    timestamp: 'Yesterday',
    read: true,
    type: 'user',
  }
];

export const performanceOverviewData = {
  monthlyTarget: 150000,
  achieved: 128430,
  remaining: 21570,
  percentage: 85.6,
  quarterlyTarget: 450000,
  quarterlyAchieved: 398200,
  quarterlyPercentage: 88.5,
};
