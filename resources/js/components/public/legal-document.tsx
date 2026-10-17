import type { ReactNode } from 'react';

interface LegalDocumentProps {
    title: string;
    summary: string;
    children: ReactNode;
}

export function LegalDocument({ title, summary, children }: LegalDocumentProps) {
    return (
        <div className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
            <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_58%)]" />
            <div className="mx-auto max-w-4xl">
                <div className="border-b border-white/10 pb-10">
                    <p className="text-xs font-bold tracking-[0.2em] text-amber-300 uppercase">Legal information</p>
                    <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">{title}</h1>
                    <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{summary}</p>
                    <p className="mt-5 text-sm font-semibold text-slate-500">Effective date: October 17, 2026</p>
                </div>

                <div className="mt-12 space-y-12">{children}</div>
            </div>
        </div>
    );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section>
            <h2 className="text-2xl font-black tracking-tight text-white">{title}</h2>
            <div className="mt-4 space-y-4 text-base leading-7 text-slate-300">{children}</div>
        </section>
    );
}

export function LegalList({ children }: { children: ReactNode }) {
    return <ul className="grid list-disc gap-3 pl-5 marker:text-amber-300">{children}</ul>;
}
