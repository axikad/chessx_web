import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  CreditCard,
  Webhook,
  Key,
  Save,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { ApiError, apiRequest } from '../../services/apiClient';

type SettingsTab = 'general' | 'profile' | 'security' | 'notifications' | 'appearance' | 'billing' | 'integrations' | 'api';

export const SettingsPage: React.FC = () => {
  const { mode, setMode, compactMode, setCompactMode } = useTheme();
  const { toast } = useToast();
  const { auth } = usePage<SharedData>().props;

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [profile, setProfile] = useState({
    name: auth.user.name,
    username: auth.user.username,
    email: auth.user.email,
    display_name: auth.user.profile.display_name ?? '',
    language: auth.user.profile.language,
    timezone: auth.user.profile.timezone ?? '',
    date_of_birth: auth.user.profile.date_of_birth ?? '',
    profile_visibility: auth.user.profile.profile_visibility,
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Security & 2FA', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'billing', label: 'Subscription & Billing', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'integrations', label: 'Integrations', icon: <Webhook className="w-4 h-4" /> },
    { id: 'api', label: 'API Keys', icon: <Key className="w-4 h-4" /> },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab !== 'profile') {
      toast.info('This settings section will be connected in a later phase.');
      return;
    }

    setSavingProfile(true);
    setProfileErrors({});

    try {
      await apiRequest('/settings/profile', {
        method: 'PATCH',
        body: JSON.stringify(profile),
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      if (error instanceof ApiError) {
        setProfileErrors(Object.fromEntries(Object.entries(error.errors).map(([field, messages]) => [field, messages[0]])));
      }
      toast.error(error instanceof Error ? error.message : 'Could not update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & System Configuration"
        subtitle="Manage account preferences, appearance, security protocols, API credentials, and billing."
        breadcrumbs={[{ label: 'System' }, { label: 'Settings' }]}
        actions={
          <Button size="sm" onClick={handleSave} isLoading={savingProfile} leftIcon={<Save className="w-3.5 h-3.5" />}>
            Save Changes
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar Tabs (3 cols) */}
        <div className="lg:col-span-3 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Pane (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {activeTab === 'general' && (
            <Card>
              <CardHeader title="General System Preferences" description="Basic corporate information and localization" />
              <CardBody className="space-y-4 text-xs">
                <Input label="Platform / Workspace Title" defaultValue="Apex Commercial Dashboard" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Default Store Currency"
                    defaultValue="USD"
                    options={[
                      { value: 'USD', label: 'USD ($) - US Dollar' },
                      { value: 'EUR', label: 'EUR (€) - Euro' },
                      { value: 'GBP', label: 'GBP (£) - British Pound' },
                    ]}
                  />
                  <Select
                    label="System Timezone"
                    defaultValue="America/Los_Angeles"
                    options={[
                      { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
                      { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
                      { value: 'UTC', label: 'UTC Universal Coordinated' },
                    ]}
                  />
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'profile' && (
            <Card>
              <CardHeader title="My Profile" description="Your personal identity and account credentials" />
              <CardBody className="space-y-4 text-xs">
                <div className="flex items-center gap-4">
                  <img
                    src={auth.user.avatar}
                    alt={profile.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500"
                  />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{profile.name}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Avatar changes will be added with the complete player profile form.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <Input
                    label="Full Name"
                    value={profile.name}
                    onChange={event => setProfile(current => ({ ...current, name: event.target.value }))}
                    error={profileErrors.name}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={profile.email}
                    onChange={event => setProfile(current => ({ ...current, email: event.target.value }))}
                    error={profileErrors.email}
                  />
                </div>
                <Input
                  label="Username"
                  value={profile.username}
                  disabled={!auth.user.username_can_be_changed}
                  onChange={event => setProfile(current => ({ ...current, username: event.target.value.toLowerCase() }))}
                  error={profileErrors.username}
                  helperText={
                    auth.user.username_can_be_changed
                      ? 'Use 3–30 lowercase letters, numbers, or underscores. You can change it once every 30 days.'
                      : `Your next username change is available on ${auth.user.username_change_available_at}.`
                  }
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Input
                    label="Display Name"
                    value={profile.display_name}
                    onChange={event => setProfile(current => ({ ...current, display_name: event.target.value }))}
                    error={profileErrors.display_name}
                    helperText="This name will be shown on your public chess profile."
                  />
                  <Select
                    label="Language"
                    value={profile.language}
                    onChange={event => setProfile(current => ({ ...current, language: event.target.value }))}
                    error={profileErrors.language}
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'hi', label: 'Hindi' },
                      { value: 'gu', label: 'Gujarati' },
                    ]}
                  />
                  <Select
                    label="Timezone"
                    value={profile.timezone}
                    onChange={event => setProfile(current => ({ ...current, timezone: event.target.value }))}
                    error={profileErrors.timezone}
                    options={[
                      { value: '', label: 'Use system timezone' },
                      { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
                      { value: 'UTC', label: 'UTC' },
                      { value: 'Europe/London', label: 'Europe/London' },
                      { value: 'America/New_York', label: 'America/New York' },
                    ]}
                  />
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={profile.date_of_birth}
                    onChange={event => setProfile(current => ({ ...current, date_of_birth: event.target.value }))}
                    error={profileErrors.date_of_birth}
                    helperText="You must be at least 13 years old. Your date of birth is always private."
                  />
                  <Select
                    label="Profile Visibility"
                    value={profile.profile_visibility}
                    onChange={event => setProfile(current => ({ ...current, profile_visibility: event.target.value as 'public' | 'private' }))}
                    error={profileErrors.profile_visibility}
                    helperText="Controls whether other players can view your future public chess profile."
                    options={[
                      { value: 'public', label: 'Public' },
                      { value: 'private', label: 'Private' },
                    ]}
                  />
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader title="Appearance & Themes" description="Custom visual styles and layout density" />
              <CardBody className="space-y-6 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Theme Color Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
                    <button
                      type="button"
                      onClick={() => setMode('light')}
                      className={`p-3 rounded-xl border text-center font-medium transition-all ${
                        mode === 'light'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 font-bold'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      Light Clean
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('dark')}
                      className={`p-3 rounded-xl border text-center font-medium transition-all ${
                        mode === 'dark'
                          ? 'border-indigo-600 bg-indigo-950/50 text-indigo-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      Dark Executive
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('system')}
                      className={`p-3 rounded-xl border text-center font-medium transition-all ${
                        mode === 'system'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 font-bold dark:bg-indigo-950/50 dark:text-indigo-400'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      Use System
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={compactMode}
                      onChange={e => setCompactMode(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Compact Container Mode (Max-w 6xl container width)
                    </span>
                  </label>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader title="Security Controls" description="Two-factor authentication and passwords" />
              <CardBody className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</h5>
                    <p className="text-slate-500 text-[11px] mt-0.5">Protect account with Authenticator app</p>
                  </div>
                  <Badge variant="success">Enabled</Badge>
                </div>

                <div className="space-y-3 pt-2">
                  <Input label="Current Password" type="password" placeholder="••••••••" />
                  <Input label="New Password" type="password" placeholder="Minimum 12 characters" />
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'api' && (
            <Card>
              <CardHeader title="API Access Credentials" description="Laravel Sanctum & Webhook tokens" />
              <CardBody className="space-y-4 text-xs">
                <p className="text-slate-500 leading-relaxed">
                  Use these credentials to authenticate your backend services and REST API calls. Keep these tokens confidential.
                </p>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Live Secret Key</label>
                  <div className="flex items-center gap-2">
                    <input
                      type={apiKeyVisible ? 'text' : 'password'}
                      readOnly
                      value="No API key configured"
                      className="flex-1 font-mono text-xs p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setApiKeyVisible(!apiKeyVisible)}
                    >
                      {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText('No API key configured');
                        toast.success('API key copied to clipboard');
                      }}
                      leftIcon={<Copy className="w-3.5 h-3.5" />}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'integrations' && (
            <Card>
              <CardHeader title="Third-Party Integrations" description="Linked cloud services and APIs" />
              <CardBody className="space-y-3 text-xs">
                {[
                  { name: 'Stripe Payments', desc: 'Credit card checkout gateway', connected: true },
                  { name: 'DHL Global Logistics', desc: 'Automated courier label generation', connected: true },
                  { name: 'Slack Notifications', desc: 'Real-time order webhook notifications', connected: false },
                  { name: 'Mailgun Transactional', desc: 'Invoice and receipt delivery system', connected: true },
                ].map((integ, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white">{integ.name}</h5>
                      <p className="text-slate-500 text-[11px]">{integ.desc}</p>
                    </div>
                    <Button
                      size="xs"
                      variant={integ.connected ? 'outline' : 'primary'}
                      onClick={() => toast.info(`${integ.name} settings updated`)}
                    >
                      {integ.connected ? 'Configure' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {activeTab === 'billing' && (
            <Card>
              <CardHeader title="Enterprise Subscription Plan" description="Managed license and usage limits" />
              <CardBody className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Current Tier</span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Enterprise Business Unlimited</h4>
                    <p className="text-slate-500 text-[11px]">Billed annually • Renews Dec 31, 2026</p>
                  </div>
                  <Badge variant="primary">Active</Badge>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader title="Notification Alerts" description="Email and browser push dispatch triggers" />
              <CardBody className="space-y-3 text-xs">
                {[
                  'Notify on new commercial orders over $1,000',
                  'Notify when inventory SKU stock reaches critical low',
                  'Daily financial performance ledger report',
                  'Security alert on new login from unrecognized device',
                ].map((pref, i) => (
                  <label key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{pref}</span>
                  </label>
                ))}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
