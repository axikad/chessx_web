import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import AdminAuthLayout from '@/apex/components/layout/AdminAuthLayout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('password.email'));
    };

    return (
        <AdminAuthLayout title="Reset your password" description="Recover access to your Laravel administration panel">
            <Head title="Forgot password" />
            <p className="mb-5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Enter your account email and we will send you a password reset link.</p>
            <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email address</label>
                    <input id="email" type="email" name="email" required autoFocus autoComplete="email" value={data.email} onChange={(event) => setData('email', event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="email@example.com" />
                    <InputError message={errors.email} />
                </div>
                <button type="submit" disabled={processing} className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Email reset link
                </button>
                {status && <p className="text-center text-xs font-medium text-emerald-600">{status}</p>}
                <p className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500 dark:border-slate-800">
                    Remember your password? <Link href={route('login')} className="font-bold text-indigo-600 hover:underline dark:text-indigo-400">Sign in</Link>
                </p>
            </form>
        </AdminAuthLayout>
    );
}
