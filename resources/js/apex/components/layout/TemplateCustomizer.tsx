import { useState, type ReactNode } from 'react';
import { Monitor, Moon, Settings2, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Offcanvas } from '../ui/Offcanvas';

type ChoiceProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
  preview: ReactNode;
};

function Choice({ label, selected, onClick, preview }: ChoiceProps) {
  return <button type="button" aria-pressed={selected} onClick={onClick} className="group text-left">
    <span className={`grid h-20 place-items-center overflow-hidden rounded-xl border-2 bg-slate-50 transition-all dark:bg-slate-800/60 ${selected ? 'border-indigo-600 shadow-sm shadow-indigo-100 dark:border-indigo-400 dark:shadow-none' : 'border-slate-200 group-hover:border-slate-300 dark:border-slate-700 dark:group-hover:border-slate-600'}`}>{preview}</span>
    <span className={`mt-2 block text-sm font-medium ${selected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>{label}</span>
  </button>;
}

export function TemplateCustomizer() {
  const [open, setOpen] = useState(false);
  const { mode, setMode, compactMode, setCompactMode } = useTheme();

  return <>
    <button type="button" onClick={() => setOpen(true)} aria-label="Open template customizer" title="Template customizer" className="fixed right-0 top-1/2 z-40 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-l-xl bg-indigo-600 text-white shadow-lg shadow-indigo-950/20 transition-colors hover:bg-indigo-700">
      <Settings2 className="h-5 w-5" />
    </button>

    <Offcanvas open={open} onClose={() => setOpen(false)} title="Template Customizer" width="sm">
      <p className="-mt-2 mb-7 text-sm text-slate-500 dark:text-slate-400">Customize and preview in real time.</p>

      <section>
        <span className="inline-flex rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">Theming</span>
        <h3 className="mb-3 mt-5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Style (mode)</h3>
        <div className="grid grid-cols-3 gap-3">
          <Choice label="Light" selected={mode === 'light'} onClick={() => setMode('light')} preview={<Sun className="h-7 w-7 text-amber-500" />} />
          <Choice label="Dark" selected={mode === 'dark'} onClick={() => setMode('dark')} preview={<Moon className="h-7 w-7 text-indigo-500" />} />
          <Choice label="System" selected={mode === 'system'} onClick={() => setMode('system')} preview={<Monitor className="h-7 w-7 text-slate-500 dark:text-slate-300" />} />
        </div>
      </section>

      <div className="my-8 border-t border-slate-200 dark:border-slate-800" />

      <section>
        <span className="inline-flex rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">Layout</span>
        <h3 className="mb-3 mt-5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Content</h3>
        <div className="grid grid-cols-2 gap-4">
          <Choice label="Compact" selected={compactMode} onClick={() => setCompactMode(true)} preview={<span className="flex h-12 w-16 flex-col gap-1.5 rounded-md border border-slate-300 bg-white p-2 shadow-sm dark:border-slate-600 dark:bg-slate-900"><span className="h-1.5 w-8 rounded bg-slate-300 dark:bg-slate-600" /><span className="h-5 rounded bg-slate-100 dark:bg-slate-800" /><span className="h-1.5 w-10 rounded bg-slate-200 dark:bg-slate-700" /></span>} />
          <Choice label="Wide" selected={!compactMode} onClick={() => setCompactMode(false)} preview={<span className="flex h-12 w-24 flex-col gap-1.5 rounded-md border border-slate-300 bg-white p-2 shadow-sm dark:border-slate-600 dark:bg-slate-900"><span className="h-1.5 w-10 rounded bg-slate-300 dark:bg-slate-600" /><span className="h-5 rounded bg-slate-100 dark:bg-slate-800" /><span className="h-1.5 w-14 rounded bg-slate-200 dark:bg-slate-700" /></span>} />
        </div>
      </section>
    </Offcanvas>
  </>;
}
