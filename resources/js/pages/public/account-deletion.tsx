import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CircleAlert, LogIn, ShieldCheck, Trash2 } from 'lucide-react';

import PublicLayout from '@/layouts/public-layout';
import type { SharedData, User } from '@/types';

export default function AccountDeletion() {
    const { auth, site } = usePage<SharedData>().props;
    const user = auth.user as User | null;

    return (
        <PublicLayout site={site} user={user}>
            <Head title="Account Deletion" />
            <section className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
                <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.12),transparent_58%)]" />
                <div className="mx-auto max-w-4xl">
                    <div className="border-b border-white/10 pb-10">
                        <p className="text-xs font-bold tracking-[0.2em] text-red-300 uppercase">Account and data controls</p>
                        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Delete your Chess Mission account</h1>
                        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                            You can start account deletion from the web settings page after securely signing in.
                        </p>
                    </div>

                    <div className="mt-10 rounded-[1.75rem] border border-white/10 bg-[#071522] p-6 sm:p-8">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-black">{user ? 'Continue to account settings' : 'Sign in to verify your account'}</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    Deletion requires your current password so another person cannot remove your account.
                                </p>
                            </div>
                            <Link
                                href={user ? route('settings.index') : route('login')}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-red-300"
                            >
                                {user ? <Trash2 className="h-4 w-4" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
                                {user ? 'Open settings' : 'Sign in'}
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2">
                        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
                            <ShieldCheck className="h-6 w-6 text-emerald-400" aria-hidden="true" />
                            <h2 className="mt-4 text-xl font-black">How deletion works</h2>
                            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-300 marker:font-bold marker:text-amber-300">
                                <li>Sign in to the Chess Mission website.</li>
                                <li>Open Settings and choose the Profile section.</li>
                                <li>Select Delete account and confirm your current password.</li>
                                <li>Your session is ended and the account is deactivated from normal use.</li>
                            </ol>
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
                            <CircleAlert className="h-6 w-6 text-amber-300" aria-hidden="true" />
                            <h2 className="mt-4 text-xl font-black">What may be retained</h2>
                            <p className="mt-4 text-sm leading-6 text-slate-300">
                                Some security, fraud-prevention, dispute, competition-integrity, or legally required records may be retained for a
                                limited period. Records that must remain for leaderboard, game, or tournament integrity may be anonymised where
                                appropriate.
                            </p>
                        </section>
                    </div>

                    <div className="mt-10 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-6">
                        <h2 className="font-black text-amber-100">Cannot access your account?</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                            Use the public contact form with the email address associated with your account. The team may request additional
                            verification before processing a deletion request.
                        </p>
                        <Link
                            href={route('contact')}
                            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-amber-300 hover:text-amber-200"
                        >
                            Contact support <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                    </div>

                    <p className="mt-8 text-sm leading-6 text-slate-500">
                        Removing access from Google or Apple does not by itself delete your Chess Mission account. Follow the steps above or contact
                        support.
                    </p>
                </div>
            </section>
        </PublicLayout>
    );
}
