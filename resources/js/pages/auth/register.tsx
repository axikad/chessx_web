import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import AdminAuthLayout from '@/apex/components/layout/AdminAuthLayout';
import InputError from '@/components/input-error';

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <AdminAuthLayout title="Create your player account" description="Join the Chess Mission competitive journey">
            <Head title="Register" />
            <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-1.5">
                    <label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Full name
                    </label>
                    <input
                        id="name"
                        type="text"
                        required
                        autoFocus
                        autoComplete="name"
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                        disabled={processing}
                        className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        placeholder="Your full name"
                    />
                    <InputError message={errors.name} />
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Email address
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                        disabled={processing}
                        className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        placeholder="email@example.com"
                    />
                    <InputError message={errors.email} />
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            disabled={processing}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 pr-10 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            placeholder="Password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="password_confirmation" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Confirm password
                    </label>
                    <div className="relative">
                        <input
                            id="password_confirmation"
                            type={showPasswordConfirmation ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(event) => setData('password_confirmation', event.target.value)}
                            disabled={processing}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 pr-10 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            placeholder="Confirm password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswordConfirmation((value) => !value)}
                            aria-label={showPasswordConfirmation ? 'Hide password confirmation' : 'Show password confirmation'}
                            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                        >
                            {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password_confirmation} />
                </div>
                <button
                    type="submit"
                    disabled={processing}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
                >
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Create account
                </button>
                <p className="text-center text-[11px] leading-5 text-slate-500">
                    By creating an account, you agree to our{' '}
                    <Link href={route('terms')} className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                        Terms
                    </Link>{' '}
                    and acknowledge our{' '}
                    <Link href={route('privacy-policy')} className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                        Privacy Policy
                    </Link>
                    .
                </p>
                <p className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500 dark:border-slate-800">
                    Already registered?{' '}
                    <Link href={route('login')} className="font-bold text-indigo-600 hover:underline dark:text-indigo-400">
                        Sign in
                    </Link>
                </p>
            </form>
        </AdminAuthLayout>
    );
}
