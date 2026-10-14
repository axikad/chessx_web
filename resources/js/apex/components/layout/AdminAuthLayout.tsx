import { ReactNode } from 'react';

interface AdminAuthLayoutProps {
    title: string;
    description: string;
    children: ReactNode;
}

export default function AdminAuthLayout({ title, description, children }: AdminAuthLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-12 font-sans dark:bg-slate-950 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-md">
                <div className="flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-2xl font-extrabold text-white shadow-lg shadow-indigo-500/25">
                        A
                    </div>
                </div>
                <h1 className="mt-4 text-center text-2xl font-extrabold text-slate-900 dark:text-white">Apex Admin</h1>
                <p className="mt-1 text-center text-xs text-slate-500">{description}</p>
            </div>

            <div className="mx-auto mt-6 w-full max-w-md rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:px-10">
                <h2 className="mb-5 text-base font-bold text-slate-900 dark:text-white">{title}</h2>
                {children}
            </div>
        </div>
    );
}
