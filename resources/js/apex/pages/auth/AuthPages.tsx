import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Shield,
  Key,
  CheckCircle,
  Eye,
  EyeOff,
  Github,
  Chrome,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';

export const AuthPages: React.FC = () => {
  const [authView, setAuthView] = useState<
    'login' | 'register' | 'forgot' | 'reset' | 'verify' | '2fa' | 'lock'
  >('login');

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('alexander@apexenterprises.io');
  const [password, setPassword] = useState('secret12345');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Authenticated successfully (Local session started)');
    navigate('/');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Registration successful! Check verification email.');
    setAuthView('verify');
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Password recovery link sent to your email');
    setAuthView('reset');
  };

  const handle2FA = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Two-factor code verified');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Switcher bar at top to demonstrate all 7 auth screens */}
      <div className="max-w-md mx-auto w-full mb-6 px-4">
        <div className="p-1.5 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl flex items-center justify-between text-[11px] font-semibold overflow-x-auto gap-1">
          {[
            { id: 'login', label: 'Login' },
            { id: 'register', label: 'Register' },
            { id: 'forgot', label: 'Forgot' },
            { id: 'reset', label: 'Reset' },
            { id: 'verify', label: 'Verify' },
            { id: '2fa', label: '2FA' },
            { id: 'lock', label: 'Lock' },
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setAuthView(view.id as any)}
              className={`px-2.5 py-1 rounded-lg transition-all capitalize whitespace-nowrap ${
                authView === view.id
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/25">
            A
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-slate-900 dark:text-white">
          Apex Admin
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Ready for Laravel Sanctum & Inertia authentication
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          {/* 1. Login View */}
          {authView === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Sign In to Dashboard</h3>
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setAuthView('forgot')}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-slate-600 dark:text-slate-400">Remember me for 30 days</span>
                </label>
              </div>

              <Button type="submit" className="w-full">
                Sign In
              </Button>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <span className="text-slate-500">Need an account? </span>
                <button
                  type="button"
                  onClick={() => setAuthView('register')}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Create one here
                </button>
              </div>
            </form>
          )}

          {/* 2. Register View */}
          {authView === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Enterprise Account</h3>
              <Input label="Full Name" placeholder="e.g. Rachel Adams" required />
              <Input label="Work Email" type="email" placeholder="rachel@company.com" required />
              <Input label="Password" type="password" placeholder="At least 8 characters" required />
              <Button type="submit" className="w-full">
                Register Account
              </Button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthView('login')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Already registered? Sign in
                </button>
              </div>
            </form>
          )}

          {/* 3. Forgot Password */}
          {authView === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Reset Password</h3>
              <p className="text-slate-500 leading-relaxed">
                Enter the email associated with your account and we will send a password reset link.
              </p>
              <Input label="Email Address" type="email" defaultValue={email} required />
              <Button type="submit" className="w-full">
                Send Reset Link
              </Button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthView('login')}
                  className="text-slate-500 hover:text-indigo-600"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {/* 4. Reset Password View */}
          {authView === 'reset' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Set New Password</h3>
              <Input label="New Password" type="password" placeholder="Min 12 characters" />
              <Input label="Confirm Password" type="password" placeholder="Confirm password" />
              <Button
                className="w-full"
                onClick={() => {
                  toast.success('Password updated! You may now sign in.');
                  setAuthView('login');
                }}
              >
                Update Password
              </Button>
            </div>
          )}

          {/* 5. Verify Email View */}
          {authView === 'verify' && (
            <div className="space-y-4 text-xs text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Verify Your Email</h3>
              <p className="text-slate-500">
                We sent a verification link to <strong className="text-slate-900 dark:text-white">{email}</strong>.
                Click the link to activate your access.
              </p>
              <Button variant="outline" className="w-full" onClick={() => toast.info('Verification link resent')}>
                Resend Link
              </Button>
              <button
                type="button"
                onClick={() => setAuthView('login')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* 6. 2FA Verification View */}
          {authView === '2fa' && (
            <form onSubmit={handle2FA} className="space-y-4 text-xs">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 mx-auto flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white text-center">
                Two-Factor Security Code
              </h3>
              <p className="text-slate-500 text-center">
                Enter the 6-digit code generated by your Authenticator app.
              </p>
              <Input
                label="Authentication Code"
                placeholder="123 456"
                value={twoFactorCode}
                onChange={e => setTwoFactorCode(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">
                Verify Code
              </Button>
            </form>
          )}

          {/* 7. Lock Screen View */}
          {authView === 'lock' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs text-center">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                alt="Alexander Wright"
                className="w-16 h-16 rounded-full mx-auto object-cover ring-2 ring-indigo-500 shadow-md"
              />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Alexander Wright</h4>
                <span className="text-[11px] text-slate-400">Screen Locked</span>
              </div>
              <Input
                label="Enter Password to Unlock"
                type="password"
                placeholder="••••••••"
                required
              />
              <Button type="submit" className="w-full">
                Unlock Session
              </Button>
              <button
                type="button"
                onClick={() => setAuthView('login')}
                className="text-slate-400 hover:text-slate-600 text-[11px]"
              >
                Sign in with a different account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
