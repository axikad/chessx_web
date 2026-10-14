import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Shield, Check, X, Edit2, Trash2, Eye } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { userService } from '../../services/userService';
import { User } from '../../types';
import { useToast } from '../../context/ToastContext';

export const UserListPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getUsers({
        filters: { role: roleFilter, status: statusFilter },
      });
      setUsers(res.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  const handleDelete = async () => {
    if (!deleteUserId) return;
    try {
      await userService.deleteUser(deleteUserId);
      toast.success('User removed from organization');
      setDeleteUserId(null);
      loadUsers();
    } catch {
      toast.error('Could not remove user');
    }
  };

  const getStatusBadge = (status: User['status']) => {
    const map: Record<User['status'], { variant: BadgeVariant; label: string }> = {
      active: { variant: 'success', label: 'Active' },
      inactive: { variant: 'neutral', label: 'Inactive' },
      pending: { variant: 'warning', label: 'Pending' },
      suspended: { variant: 'danger', label: 'Suspended' },
    };
    const s = map[status] || { variant: 'neutral', label: status };
    return <Badge variant={s.variant} dot>{s.label}</Badge>;
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Team Member',
      sortable: true,
      render: row => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar}
            alt={row.name}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block text-xs">
              {row.name}
            </span>
            <span className="text-[11px] text-slate-400">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Assigned Role',
      sortable: true,
      render: row => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
          <Shield className="w-3 h-3" />
          {row.role}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: row => getStatusBadge(row.status),
    },
    {
      key: 'twoFactorEnabled',
      header: '2FA Auth',
      sortable: true,
      render: row => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium ${
            row.twoFactorEnabled
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          {row.twoFactorEnabled ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              Enabled
            </>
          ) : (
            'Disabled'
          )}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      sortable: true,
      render: row => <span className="text-slate-500 text-xs">{row.lastLogin}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: row => (
        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setDeleteUserId(row.id)}
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Remove User"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User & Team Management"
        subtitle="Manage administrative accounts, role privileges, and security enforcement."
        breadcrumbs={[{ label: 'Users' }]}
        actions={
          <Link to="/users/create">
            <Button size="sm" leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
              Invite Member
            </Button>
          </Link>
        }
      />

      <DataTable
        title="Active Organization Users"
        columns={columns}
        data={users}
        keyField="id"
        isLoading={isLoading}
        searchPlaceholder="Search member by name, email, role..."
        customFilters={
          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="text-xs px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Store Manager">Store Manager</option>
              <option value="Billing Specialist">Billing Specialist</option>
              <option value="Customer Support">Customer Support</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        }
      />

      <ConfirmDialog
        isOpen={Boolean(deleteUserId)}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDelete}
        title="Remove Member"
        message="Are you sure you want to revoke system access for this team member?"
      />
    </div>
  );
};
