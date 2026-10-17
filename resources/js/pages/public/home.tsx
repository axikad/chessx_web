import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Crown, Globe2, MapPin, ShieldCheck, Sparkles, Trophy, UsersRound } from 'lucide-react';

import PublicLayout from '@/layouts/public-layout';
import type { SharedData, User } from '@/types';

const leagues = [
    { name: 'City League', scope: 'Begin in your confirmed city', image: '/storage/leagues/Lcity.png', icon: MapPin },
    { name: 'State League', scope: 'Qualify to represent your state', image: '/storage/leagues/Lstate.png', icon: Trophy },
    { name: 'National League', scope: 'Compete among the country’s best', image: '/storage/leagues/Lnational.png', icon: Crown },
    { name: 'World League', scope: 'Reach the global stage', image: '/storage/leagues/Lworld.png', icon: Globe2 },
];

export default function PublicHome() {
    const { auth, site } = usePage<SharedData>().props;
    const user = auth.user as User | null;
    const primaryHref = user ? route('dashboard') : route('register');
    const primaryLabel = user ? 'Open dashboard' : 'Create your player account';

    return (
        <PublicLayout site={site} user={user}>
            <Head title="Competitive chess, locally rooted" />

            <section className="relative isolate overflow-hidden border-b border-white/10">
                <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_20%,rgba(251,191,36,0.16),transparent_32%),radial-gradient(circle_at_85%_30%,rgba(37,99,235,0.16),transparent_30%),linear-gradient(180deg,#061321_0%,#020912_100%)]" />
                <div className="absolute inset-y-0 right-0 -z-10 hidden w-1/2 overflow-hidden lg:block">
                    <img src="/storage/leagues/Lworld.png" alt="" className="h-full w-full object-cover opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#061321] via-[#061321]/55 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020912] via-transparent to-[#020912]/30" />
                </div>

                <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-28">
                    <div className="max-w-3xl">
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-xs font-bold tracking-[0.16em] text-amber-200 uppercase">
                            <Sparkles className="h-4 w-4" aria-hidden="true" />
                            Competitive chess, locally rooted
                        </div>
                        <h1 className="text-5xl leading-[0.98] font-black tracking-[-0.05em] text-balance sm:text-6xl lg:text-7xl">
                            Start in your city.
                            <span className="mt-2 block bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                                Earn the world stage.
                            </span>
                        </h1>
                        <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                            Chess Mission is building a fair competitive journey where every player begins locally and advances through proven
                            performance.
                        </p>
                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href={primaryHref}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-300 px-6 py-4 text-sm font-black text-slate-950 shadow-xl shadow-amber-950/30 transition hover:-translate-y-0.5 hover:bg-amber-200"
                            >
                                {primaryLabel}
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                            {!user && (
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-bold text-white transition hover:border-amber-300/40 hover:bg-white/10"
                                >
                                    I already have an account
                                </Link>
                            )}
                        </div>
                        <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-400">
                            {['Location-based leagues', 'Clear promotion path', 'Permission-aware platform'].map((item) => (
                                <span key={item} className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="relative mx-auto hidden w-full max-w-lg lg:block" aria-hidden="true">
                        <div className="absolute -inset-8 rounded-full bg-amber-300/10 blur-3xl" />
                        <div className="relative rounded-[2rem] border border-white/15 bg-slate-950/55 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
                            <div className="flex items-center justify-between border-b border-white/10 pb-5">
                                <div>
                                    <p className="text-xs font-bold tracking-[0.18em] text-amber-300 uppercase">Your progression</p>
                                    <p className="mt-1 text-xl font-black">One mission. Four stages.</p>
                                </div>
                                <Crown className="h-8 w-8 text-amber-300" />
                            </div>
                            <div className="grid gap-3 pt-5">
                                {leagues.map((league, index) => (
                                    <div key={league.name} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-300/10 text-sm font-black text-amber-300">
                                            {index + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold">{league.name}</p>
                                            <p className="truncate text-xs text-slate-400">{league.scope}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="leagues" className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10">
                <div className="mx-auto max-w-7xl">
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold tracking-[0.2em] text-amber-300 uppercase">The league journey</p>
                        <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Progress must be earned.</h2>
                        <p className="mt-5 text-lg leading-8 text-slate-400">
                            Players begin at city level. Higher leagues unlock through configurable eligibility and qualification rules.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {leagues.map((league, index) => {
                            const Icon = league.icon;

                            return (
                                <article
                                    key={league.name}
                                    className="group relative min-h-80 overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900"
                                >
                                    <img
                                        src={league.image}
                                        alt=""
                                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#020912] via-[#020912]/65 to-[#020912]/10" />
                                    <div className="relative flex h-full min-h-80 flex-col justify-between p-6">
                                        <div className="flex items-center justify-between">
                                            <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-xs font-bold backdrop-blur">
                                                Stage {index + 1}
                                            </span>
                                            <Icon className="h-5 w-5 text-amber-300" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black">{league.name}</h3>
                                            <p className="mt-2 text-sm leading-6 text-slate-300">{league.scope}</p>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section id="experience" className="scroll-mt-24 border-y border-white/10 bg-white/[0.025] px-5 py-24 sm:px-8 lg:px-10">
                <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                    <div>
                        <p className="text-xs font-bold tracking-[0.2em] text-amber-300 uppercase">A clear path forward</p>
                        <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Built for meaningful competition.</h2>
                        <p className="mt-5 text-lg leading-8 text-slate-400">
                            Your confirmed location establishes the right starting league. Ratings and qualification records keep progression
                            transparent.
                        </p>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {[
                            { icon: MapPin, title: 'Start locally', text: 'Your confirmed city places you in the correct local competitive region.' },
                            {
                                icon: Trophy,
                                title: 'Meet the standard',
                                text: 'Promotion rules can combine games, rating targets, and qualification.',
                            },
                            {
                                icon: ShieldCheck,
                                title: 'Protected progress',
                                text: 'League access and decisions remain authoritative on the backend.',
                            },
                            { icon: UsersRound, title: 'Grow together', text: 'Compete within a community that expands as the platform develops.' },
                        ].map(({ icon: Icon, title, text }) => (
                            <article key={title} className="rounded-[1.5rem] border border-white/10 bg-[#071522] p-6">
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-300">
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <h3 className="mt-5 text-lg font-black">{title}</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="community" className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10">
                <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-amber-300/20 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_35%),linear-gradient(135deg,#0b1b2a,#07111d)] px-6 py-14 text-center shadow-2xl shadow-black/30 sm:px-12">
                    <Crown className="mx-auto h-10 w-10 text-amber-300" aria-hidden="true" />
                    <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">Your first move starts here.</h2>
                    <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                        Create your player identity, confirm your location, and get ready for the Chess Mission competitive journey.
                    </p>
                    <Link
                        href={primaryHref}
                        className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-amber-300 px-6 py-4 text-sm font-black text-slate-950 transition hover:bg-amber-200"
                    >
                        {primaryLabel}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </div>
            </section>
        </PublicLayout>
    );
}
