import React from 'react';
import { Target, TrendingUp, Award } from 'lucide-react';
import { performanceOverviewData } from '../../data/dashboard';

export const PerformanceCard: React.FC = () => {
  const { monthlyTarget, achieved, remaining, percentage } = performanceOverviewData;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Monthly Revenue Goal</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pacing for Q2 target</p>
          </div>
        </div>
        <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
          {percentage}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Achieved: ${achieved.toLocaleString()}</span>
          <span>Target: ${monthlyTarget.toLocaleString()}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Remaining</span>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 block">
            ${remaining.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500">11 days left in cycle</span>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Run Rate</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 block">
            +114.2%
          </span>
          <span className="text-[10px] text-slate-500">Ahead of benchmark</span>
        </div>
      </div>
    </div>
  );
};
