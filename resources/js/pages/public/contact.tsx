import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Clock3, Mail, MessageSquareText, Send } from 'lucide-react';
import type { FormEventHandler, ReactNode } from 'react';

import PublicLayout from '@/layouts/public-layout';
import type { SharedData, User } from '@/types';

const contactInputClass =
    'w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300/50 focus:ring-2 focus:ring-amber-300/15';

interface ContactForm {
    name: string;
    email: string;
    subject: string;
    message: string;
    website: string;
}

export default function Contact() {
    const { auth, flash, site } = usePage<SharedData>().props;
    const user = auth.user as User | null;
    const { data, setData, post, processing, errors, reset } = useForm<ContactForm>({
        name: user?.name ?? '',
        email: user?.email ?? '',
        subject: '',
        message: '',
        website: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('contact.store'), {
            preserveScroll: true,
            onSuccess: () => reset('subject', 'message', 'website'),
        });
    };

    return (
        <PublicLayout site={site} user={user}>
            <Head title="Contact" />
            <section className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
                <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.13),transparent_55%)]" />
                <div className="mx-auto max-w-6xl">
                    <div className="max-w-3xl">
                        <p className="text-xs font-bold tracking-[0.2em] text-amber-300 uppercase">Contact Chess Mission</p>
                        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">How can we help?</h1>
                        <p className="mt-5 text-lg leading-8 text-slate-300">
                            Send questions about your account, leagues, privacy, safety, or technical problems to the Chess Mission team.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
                        <aside className="space-y-5">
                            {[
                                {
                                    icon: MessageSquareText,
                                    title: 'Account and gameplay',
                                    text: 'Get help with access, profiles, leagues, and competition records.',
                                },
                                { icon: Mail, title: 'Privacy requests', text: 'Ask about your data, corrections, access, or account deletion.' },
                                {
                                    icon: Clock3,
                                    title: 'Response handling',
                                    text: 'Include enough detail for the team to investigate without sharing passwords or login codes.',
                                },
                            ].map(({ icon: Icon, title, text }) => (
                                <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                                    <Icon className="h-5 w-5 text-amber-300" aria-hidden="true" />
                                    <h2 className="mt-4 font-black">{title}</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                                </article>
                            ))}
                            <p className="px-1 text-sm leading-6 text-slate-400">
                                Need to remove your account? Review the{' '}
                                <Link href={route('account-deletion')} className="font-semibold text-amber-300 hover:text-amber-200">
                                    account deletion process
                                </Link>
                                .
                            </p>
                        </aside>

                        <div className="rounded-[1.75rem] border border-white/10 bg-[#071522] p-6 shadow-2xl shadow-black/20 sm:p-8">
                            {flash?.success && (
                                <div className="mb-6 flex gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
                                    <p>{flash.success}</p>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Field id="contact-name" label="Name" error={errors.name}>
                                        <input
                                            id="contact-name"
                                            required
                                            value={data.name}
                                            onChange={(event) => setData('name', event.target.value)}
                                            className={contactInputClass}
                                            autoComplete="name"
                                        />
                                    </Field>
                                    <Field id="contact-email" label="Email" error={errors.email}>
                                        <input
                                            id="contact-email"
                                            type="email"
                                            required
                                            value={data.email}
                                            onChange={(event) => setData('email', event.target.value)}
                                            className={contactInputClass}
                                            autoComplete="email"
                                        />
                                    </Field>
                                </div>
                                <Field id="contact-subject" label="Subject" error={errors.subject}>
                                    <input
                                        id="contact-subject"
                                        required
                                        value={data.subject}
                                        onChange={(event) => setData('subject', event.target.value)}
                                        className={contactInputClass}
                                        placeholder="What do you need help with?"
                                    />
                                </Field>
                                <Field id="contact-message" label="Message" error={errors.message}>
                                    <textarea
                                        id="contact-message"
                                        required
                                        rows={7}
                                        value={data.message}
                                        onChange={(event) => setData('message', event.target.value)}
                                        className={`${contactInputClass} resize-y`}
                                        placeholder="Describe the issue and include relevant account or game details. Never send your password or OTP."
                                    />
                                </Field>
                                <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
                                    <label htmlFor="contact-website">Website</label>
                                    <input
                                        id="contact-website"
                                        tabIndex={-1}
                                        autoComplete="off"
                                        value={data.website}
                                        onChange={(event) => setData('website', event.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    <Send className="h-4 w-4" aria-hidden="true" />
                                    {processing ? 'Sending…' : 'Send message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="text-sm font-bold text-slate-200">
                {label}
            </label>
            {children}
            {error && <p className="text-xs font-semibold text-red-400">{error}</p>}
        </div>
    );
}
