import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import AdminAuthLayout from '@/apex/components/layout/AdminAuthLayout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <AdminAuthLayout title="Sign in to dashboard" description="Secure administration for your Laravel application">
            <Head title="Log in" />
            <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email address</label>
                    <input id="email" type="email" required autoFocus autoComplete="email" value={data.email} onChange={(event) => setData('email', event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="email@example.com" />
                    <InputError message={errors.email} />
                </div>
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                        {canResetPassword && <Link href={route('password.request')} className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">Forgot password?</Link>}
                    </div>
                    <div className="relative">
                        <input id="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={data.password} onChange={(event) => setData('password', event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 pr-10 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="Password" />
                        <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <input type="checkbox" checked={data.remember} onChange={(event) => setData('remember', event.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                    Remember me
                </label>
                <button type="submit" disabled={processing} className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Sign in
                </button>
                {status && <p className="text-center text-xs font-medium text-emerald-600">{status}</p>}
                <p className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500 dark:border-slate-800">
                    Need an account? <Link href={route('register')} className="font-bold text-indigo-600 hover:underline dark:text-indigo-400">Create one</Link>
                </p>
            </form>
        </AdminAuthLayout>
    );
}
