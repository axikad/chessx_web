import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  AlertCircle,
  Info,
  AlertTriangle,
  ChevronRight,
  Download,
  Trash2,
  Share2,
  Plus,
  Eye,
  Sliders,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { useToast } from '../../context/ToastContext';

export const ComponentShowcasePage: React.FC = () => {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [switchState, setSwitchState] = useState(true);
  const [radioVal, setRadioVal] = useState('opt1');
  const [rangeVal, setRangeVal] = useState(65);

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="UI Design System & Components"
        subtitle="Catalog of all reusable interactive UI elements, states, variants, and design patterns."
        breadcrumbs={[{ label: 'Design System' }, { label: 'Components' }]}
        actions={
          <Button
            size="sm"
            onClick={() => toast.success('Design system token manifest copied')}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Export Design Tokens
          </Button>
        }
      />

      {/* 1. Buttons Showcase */}
      <Card>
        <CardHeader
          title="Buttons & Actions"
          description="Variants: Primary, Secondary, Danger, Success, Warning, Ghost, Outline • Sizes: sm, md, lg • Loading & Icons"
        />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button size="xs">Extra Small (xs)</Button>
            <Button size="sm">Small (sm)</Button>
            <Button size="md">Medium (md)</Button>
            <Button size="lg">Large (lg)</Button>
            <Button isLoading size="sm">Loading State</Button>
            <Button disabled size="sm">Disabled</Button>
            <Button leftIcon={<Plus className="w-3.5 h-3.5" />} size="sm">With Icon</Button>
          </div>
        </CardBody>
      </Card>

      {/* 2. Badges & Tags Showcase */}
      <Card>
        <CardHeader
          title="Badges, Status Indicators & Chips"
          description="Subtle color variants, solid indicators, status dot styles, and pill shapes"
        />
        <CardBody className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">Primary Badge</Badge>
            <Badge variant="success">Success Paid</Badge>
            <Badge variant="warning">Warning Pending</Badge>
            <Badge variant="danger">Danger Failed</Badge>
            <Badge variant="info">Info Notice</Badge>
            <Badge variant="neutral">Neutral Tag</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge variant="success" dot>Active Live</Badge>
            <Badge variant="danger" dot>Terminated</Badge>
            <Badge variant="warning" dot>Processing</Badge>
            <Badge variant="neutral" dot>Offline</Badge>
          </div>
        </CardBody>
      </Card>

      {/* 3. Form Inputs & Interactive Controls */}
      <Card>
        <CardHeader
          title="Form Controls & Inputs"
          description="Text fields, select menus, switches, range sliders, checkboxes, and radio buttons"
        />
        <CardBody className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Standard Input" placeholder="Type here..." />
            <Input label="With Helper Text" placeholder="johndoe@example.com" helperText="We will never share your email" />
            <Input label="Input with Error" placeholder="Invalid input" error="Required field cannot be empty" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Select Dropdown"
              options={[
                { value: 'opt1', label: 'Enterprise Cloud' },
                { value: 'opt2', label: 'Dedicated Server' },
                { value: 'opt3', label: 'Serverless Edge' },
              ]}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Interactive Range Slider ({rangeVal}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={rangeVal}
                onChange={e => setRangeVal(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Toggle Switches
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={switchState}
                  onChange={e => setSwitchState(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  {switchState ? 'Notifications Active' : 'Notifications Muted'}
                </span>
              </label>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 4. Alerts & Notifications */}
      <Card>
        <CardHeader title="Alert Messages & Banners" description="Contextual inline feedback alerts" />
        <CardBody className="space-y-3">
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3 text-xs text-emerald-800 dark:text-emerald-300">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Success notification: </strong>
              Your batch update of 24 products has been committed to the inventory database.
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Warning alert: </strong>
              Low disk space remaining on secondary backup volume (12% available).
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Error alert: </strong>
              Failed to connect to third-party shipping webhook API. Retrying in 60 seconds.
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 5. Modals & Dialogs */}
      <Card>
        <CardHeader title="Modals & Dialogs" description="Interactive dialog windows with backdrop and transitions" />
        <CardBody>
          <Button onClick={() => setModalOpen(true)}>Open Sample Modal Window</Button>
        </CardBody>
      </Card>

      {/* Sample Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Component Modal Preview">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            This is an accessible, styled modal dialog supporting backdrop blur, escape keyboard dismiss, and nested forms.
          </p>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300">
            &lt;Modal isOpen=&#123;isOpen&#125; onClose=&#123;handleClose&#125; title="..."&gt;
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => setModalOpen(false)}>
              Confirm Action
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
