import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, Shield, Mail, Lock } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { User } from '../../types';

export const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Manager' as User['role'],
    department: 'Operations',
    status: 'active' as User['status'],
    password: '',
    sendInvite: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Please enter name and email');
      return;
    }

    setIsLoading(true);
    try {
      await userService.createUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        department: formData.department,
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        twoFactorEnabled: false,
      });
      toast.success('Member invited to organization');
      navigate('/users');
    } catch {
      toast.error('Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Invite New Team Member"
        subtitle="Grant dashboard access and assign administrative privileges."
        breadcrumbs={[
          { label: 'Users', href: '/users' },
          { label: 'Invite Member' },
        ]}
        actions={
          <Link to="/users">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to Users
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader title="Member Credentials & Role" />
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Jessica Sterling"
                required
              />
              <Input
                label="Business Email Address *"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="jessica@apexenterprises.io"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 019-2834"
              />
              <Select
                label="Assigned Role"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                options={[
                  { value: 'Super Admin', label: 'Super Admin (Full Root Access)' },
                  { value: 'Store Manager', label: 'Store Manager (Catalog & Orders)' },
                  { value: 'Billing Specialist', label: 'Billing Specialist (Invoices Only)' },
                  { value: 'Customer Support', label: 'Customer Support (Read Only)' },
                ]}
              />
            </div>

            <Input
              label="Temporary Password (Optional)"
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder="Leave blank to generate secure invite link"
              helperText="If blank, an onboarding email link will prompt them to set their password"
            />

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.sendInvite}
                  onChange={e => setFormData({ ...formData, sendInvite: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Send welcome email with credentials immediately</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link to="/users">
                <Button type="button" variant="outline" size="sm">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" size="sm" isLoading={isLoading} leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
                Send Invitation
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
