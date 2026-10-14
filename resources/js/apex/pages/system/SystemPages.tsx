import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  ServerCrash,
  Clock,
  Rocket,
  ArrowLeft,
  RefreshCw,
  Home,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const SystemPages: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'404' | '403' | '500' | 'maintenance' | 'comingSoon'>('404');

  // Countdown timer simulation for maintenance
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[680px] flex flex-col items-center justify-center p-4">
      {/* Switcher Bar to demonstrate each system error page */}
      <div className="mb-8 p-1.5 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl flex items-center gap-1 text-xs font-semibold">
        {[
          { id: '404', label: '404 Not Found' },
          { id: '403', label: '403 Forbidden' },
          { id: '500', label: '500 Server Error' },
          { id: 'maintenance', label: 'Maintenance Mode' },
          { id: 'comingSoon', label: 'Coming Soon' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedView(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedView === tab.id
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-lg w-full text-center space-y-6">
        {/* 404 View */}
        {selectedView === '404' && (
          <div className="space-y-4">
            <h1 className="text-8xl font-black text-indigo-600/20 dark:text-indigo-400/20 font-mono">
              404
            </h1>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Page Not Found</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              The requested administrative resource, route, or document does not exist or has been moved.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link to="/">
                <Button size="sm" leftIcon={<Home className="w-3.5 h-3.5" />}>
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* 403 View */}
        {selectedView === '403' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
              Access Forbidden
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              You do not have the necessary role permission privileges to access this system module. Please contact your Super Administrator.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link to="/">
                <Button size="sm" variant="outline">
                  Go Back
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* 500 View */}
        {selectedView === '500' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mx-auto">
              <ServerCrash className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
              Internal Server Error
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              The backend application encountered an unexpected runtime exception. Incident logged for debugging.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Button size="sm" onClick={() => window.location.reload()} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Reload Application
              </Button>
            </div>
          </div>
        )}

        {/* Maintenance View */}
        {selectedView === 'maintenance' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Scheduled Maintenance
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              We are currently performing scheduled database schema migrations and infrastructure upgrades. We will be back online shortly.
            </p>

            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto pt-2">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 block">Hours</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 block">Minutes</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 block">Seconds</span>
              </div>
            </div>
          </div>
        )}

        {/* Coming Soon View */}
        {selectedView === 'comingSoon' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center mx-auto">
              <Rocket className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Something Great is Coming
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              This module is actively undergoing UI polish and will be released in the next sprint release.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link to="/">
                <Button size="sm">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
