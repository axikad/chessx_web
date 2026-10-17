import { Link, usePage } from '@inertiajs/react';
import { Crown } from 'lucide-react';
import { ReactNode } from 'react';

import type { SharedData } from '@/types';

interface AdminAuthLayoutProps {
    title: string;
    description: string;
    children: ReactNode;
}

export default function AdminAuthLayout({ title, description, children }: AdminAuthLayoutProps) {
    const { site } = usePage<SharedData>().props;

    return (
        <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-12 font-sans sm:px-6 lg:px-8 dark:bg-slate-950">
            <div className="mx-auto w-full max-w-md">
                <Link href={route('home')} className="flex justify-center" aria-label={`${site.name} home`}>
                    {site.logo_url ? (
                        <img src={site.logo_url} alt="" className="h-12 w-12 rounded-2xl object-contain" />
                    ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/25">
                            <Crown className="h-6 w-6" aria-hidden="true" />
                        </span>
                    )}
                </Link>
                <h1 className="mt-4 text-center text-2xl font-extrabold text-slate-900 dark:text-white">{site.name}</h1>
                <p className="mt-1 text-center text-xs text-slate-500">{description}</p>
            </div>

            <div className="mx-auto mt-6 w-full max-w-md rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-xl sm:px-10 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-5 text-base font-bold text-slate-900 dark:text-white">{title}</h2>
                {children}
            </div>
        </div>
    );
}
