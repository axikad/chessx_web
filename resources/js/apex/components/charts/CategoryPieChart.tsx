import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { categoryBreakdownData } from '../../data/dashboard';

export const CategoryPieChart: React.FC = () => {
  return (
    <div className="w-full">
      <div className="h-56 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                border: '1px solid #1e293b',
                fontSize: '12px',
                color: '#fff',
              }}
              formatter={(value: any, name: any, item: any) => [
                `$${item.payload.amount.toLocaleString()} (${value}%)`,
                name,
              ]}
            />
            <Pie
              data={categoryBreakdownData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {categoryBreakdownData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Total Share</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">100%</span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="mt-4 space-y-2">
        {categoryBreakdownData.map((cat, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-slate-600 dark:text-slate-300 truncate max-w-[140px]">{cat.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100">{cat.value}%</span>
              <span className="text-slate-400 text-[11px]">${(cat.amount / 1000).toFixed(1)}k</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
