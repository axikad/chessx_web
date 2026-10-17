import { Link } from '@inertiajs/react';
import { Crown, LogIn } from 'lucide-react';
import type { ReactNode } from 'react';

import type { SiteBranding, User } from '@/types';

interface PublicLayoutProps {
    children: ReactNode;
    site: SiteBranding;
    user: User | null;
}

function BrandMark({ site }: { site: SiteBranding }) {
    return (
        <Link href={route('home')} className="flex items-center gap-3" aria-label={`${site.name} home`}>
            {site.logo_url ? (
                <img src={site.logo_url} alt="" className="h-11 w-11 rounded-2xl object-contain" />
            ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-300/10 text-amber-300 shadow-lg shadow-amber-950/30">
                    <Crown className="h-5 w-5" aria-hidden="true" />
                </span>
            )}
            <span className="flex flex-col leading-none">
                <span className="text-base font-black tracking-tight text-white">{site.name}</span>
                <span className="mt-1 text-[10px] font-semibold tracking-[0.24em] text-amber-300 uppercase">Rise through the ranks</span>
            </span>
        </Link>
    );
}

export default function PublicLayout({ children, site, user }: PublicLayoutProps) {
    return (
        <div className="min-h-screen bg-[#020912] text-white antialiased">
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020912]/90 backdrop-blur-xl">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
                    <BrandMark site={site} />

                    <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-300 md:flex" aria-label="Main navigation">
                        <Link href={`${route('home')}#leagues`} className="transition-colors hover:text-amber-300">
                            Leagues
                        </Link>
                        <Link href={`${route('home')}#experience`} className="transition-colors hover:text-amber-300">
                            How it works
                        </Link>
                        <Link href={`${route('home')}#community`} className="transition-colors hover:text-amber-300">
                            Community
                        </Link>
                    </nav>

                    <div className="flex items-center gap-2">
                        {user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-black text-slate-950 transition hover:bg-amber-200"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="hidden items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/5 hover:text-white sm:flex"
                                >
                                    <LogIn className="h-4 w-4" aria-hidden="true" />
                                    Sign in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-black text-slate-950 transition hover:bg-amber-200"
                                >
                                    Join now
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main>{children}</main>

            <footer className="border-t border-white/10 bg-[#01060d]">
                <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
                    <BrandMark site={site} />
                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
                        <Link href={`${route('home')}#leagues`} className="transition hover:text-amber-300">
                            Leagues
                        </Link>
                        <Link href={`${route('home')}#experience`} className="transition hover:text-amber-300">
                            How it works
                        </Link>
                        <Link href={route('privacy-policy')} className="transition hover:text-amber-300">
                            Privacy
                        </Link>
                        <Link href={route('terms')} className="transition hover:text-amber-300">
                            Terms
                        </Link>
                        <Link href={route('contact')} className="transition hover:text-amber-300">
                            Contact
                        </Link>
                        <Link href={route('account-deletion')} className="transition hover:text-amber-300">
                            Account deletion
                        </Link>
                    </div>
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} {site.name}
                    </p>
                </div>
            </footer>
        </div>
    );
}
