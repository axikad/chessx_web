import { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { ArrowUpRight, Boxes, CreditCard, MoreHorizontal, TrendingUp } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardFooter, CardHeader } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';

const variants = [
  { id: 'basic', label: 'Basic' },
  { id: 'advance', label: 'Advance' },
  { id: 'statistics', label: 'Statistics' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'actions', label: 'Actions' },
];

export function CardsPage() {
  const { variant = 'basic' } = useParams();
  const [saved, setSaved] = useState(false);

  return <div className="space-y-6 pb-12">
    <PageHeader title="Cards" subtitle="Reusable content containers for application screens, metrics, actions, and summaries." breadcrumbs={[{ label: 'Components' }, { label: 'Cards' }]} />

    <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
      {variants.map((item) => <NavLink key={item.id} to={`/components/cards/${item.id}`} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{item.label}</NavLink>)}
    </div>

    {variant === 'basic' && <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {['Simple content', 'With header', 'Interactive card'].map((title, index) => <Card key={title} hoverable={index === 2}>
        {index === 1 && <CardHeader title="Team workspace" description="A card header keeps information structured." />}
        <CardBody><h2 className="mb-2 font-semibold text-slate-900 dark:text-white">{title}</h2><p className="text-sm leading-6 text-slate-500 dark:text-slate-400">Use this base card for settings, summaries, forms, and compact content groups.</p></CardBody>
        {index === 2 && <CardFooter><Button size="sm" variant="outline">Open details</Button></CardFooter>}
      </Card>)}
    </div>}

    {variant === 'advance' && <div className="grid gap-5 lg:grid-cols-2">
      <Card><CardHeader title="Project Aurora" description="Design system refresh" action={<Badge variant="success" dot>On track</Badge>} /><CardBody className="space-y-5"><div className="flex items-center justify-between text-sm"><span className="text-slate-500">Progress</span><strong className="text-slate-900 dark:text-white">72%</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full w-[72%] rounded-full bg-indigo-600" /></div><div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-sm dark:border-slate-800"><div><p className="text-slate-400">Tasks</p><p className="mt-1 font-semibold">36 / 50</p></div><div><p className="text-slate-400">Members</p><p className="mt-1 font-semibold">8</p></div><div><p className="text-slate-400">Due</p><p className="mt-1 font-semibold">18 Sep</p></div></div></CardBody></Card>
      <Card className="overflow-hidden"><div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white"><CreditCard className="mb-8 h-8 w-8 opacity-90" /><p className="text-sm opacity-75">Business balance</p><p className="mt-1 text-3xl font-bold">₹ 84,200</p><div className="mt-8 flex justify-between text-sm"><span>•••• 4242</span><span>09/28</span></div></div><CardFooter className="flex items-center justify-between"><span className="text-sm text-slate-500">Available to spend</span><Button size="sm">Manage</Button></CardFooter></Card>
    </div>}

    {variant === 'statistics' && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[['Total revenue', '₹ 2.48L', '+12.5%', 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40'], ['Active customers', '1,248', '+8.2%', 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'], ['Open orders', '86', '+5.4%', 'bg-amber-50 text-amber-600 dark:bg-amber-950/40'], ['Conversion rate', '4.86%', '-0.8%', 'bg-rose-50 text-rose-600 dark:bg-rose-950/40']].map(([label, value, change, color]) => <Card key={label} hoverable><CardBody><div className="flex items-start justify-between"><span className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}><TrendingUp className="h-5 w-5" /></span><span className={`text-xs font-semibold ${change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>{change}</span></div><p className="mt-5 text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p></CardBody></Card>)}
    </div>}

    {variant === 'analytics' && <Card><CardHeader title="Weekly performance" description="A compact analytics-card pattern for dashboards." action={<Button size="sm" variant="outline">Last 7 days</Button>} /><CardBody><div className="grid gap-6 md:grid-cols-[1fr_220px]"><div className="flex h-48 items-end gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">{[42, 64, 48, 78, 55, 90, 72].map((height, index) => <div key={index} className="group flex flex-1 flex-col justify-end gap-2"><div style={{ height: `${height}%` }} className="rounded-t-md bg-gradient-to-t from-indigo-600 to-violet-400 transition-opacity group-hover:opacity-75" /><span className="text-center text-xs text-slate-400">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</span></div>)}</div><div className="space-y-5"><div><p className="text-sm text-slate-500">Net sales</p><p className="mt-1 text-2xl font-bold">₹ 48,380</p></div><div><p className="text-sm text-slate-500">Target achieved</p><p className="mt-1 text-2xl font-bold text-emerald-600">82.4%</p></div><Badge variant="success" dot>Above target</Badge></div></div></CardBody></Card>}

    {variant === 'actions' && <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {[['Create invoice', 'Prepare and send a new customer invoice.', 'Create'], ['Add product', 'Add a product to your catalog.', 'Add product'], ['Invite teammate', 'Give a teammate access to this workspace.', 'Send invite']].map(([title, description, action], index) => <Card key={title} hoverable><CardBody><div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40"><Boxes className="h-5 w-5" /></span><MoreHorizontal className="h-5 w-5 text-slate-400" /></div><h2 className="mt-5 font-semibold text-slate-900 dark:text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></CardBody><CardFooter><Button size="sm" onClick={() => index === 0 && setSaved(!saved)} rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}>{index === 0 && saved ? 'Created' : action}</Button></CardFooter></Card>)}
    </div>}
  </div>;
}
