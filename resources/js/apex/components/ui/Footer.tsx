import type { ReactNode } from 'react';

export type FooterLink = { label: string; href: string };
export type FooterProps = { brand?: string; links?: FooterLink[]; status?: ReactNode; className?: string };

export function Footer({ brand = 'Apex UI Template', links = [], status = <>● System operational</>, className = '' }: FooterProps) {
  return <footer className={`border-t border-slate-200/70 px-6 py-4 text-xs text-slate-400 dark:border-slate-800/80 ${className}`}>
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row"><p>© {new Date().getFullYear()} {brand}</p><div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">{links.map((link) => <a key={link.label} href={link.href} className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">{link.label}</a>)}<span className="font-medium text-emerald-600 dark:text-emerald-400">{status}</span></div></div>
  </footer>;
}
