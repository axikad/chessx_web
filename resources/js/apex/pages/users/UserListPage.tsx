import { ArchiveRestore, Check, Edit2, Shield, Trash2, UserPlus } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Column, DataTable } from '../../components/ui/DataTable';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNavigationAccess } from '../../context/NavigationAccessContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { User } from '../../types';
import { UserFormModal } from './UserFormModal';

export const UserListPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [accountFilter, setAccountFilter] = useState('active');
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
    const [restoreUserId, setRestoreUserId] = useState<string | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const { toast, showToast } = useToast();
    const { can } = useNavigationAccess();
    const canCreateUsers = can('users.create');
    const canUpdateUsers = can('users.update');
    const canDeleteUsers = can('users.delete');
    const canRestoreUsers = can('users.restore');

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await userService.getUsers({
                filters: { role: roleFilter, status: statusFilter, account: accountFilter },
            });
            setUsers(res.data);
        } catch {
            showToast('error', 'Failed to load users');
        } finally {
            setIsLoading(false);
        }
    }, [accountFilter, roleFilter, showToast, statusFilter]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

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

    const handleRestore = async () => {
        if (!restoreUserId) return;
        setIsRestoring(true);
        try {
            await userService.restoreUser(restoreUserId);
            toast.success('User account restored');
            setRestoreUserId(null);
            loadUsers();
        } catch {
            toast.error('Could not restore user');
        } finally {
            setIsRestoring(false);
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
        return (
            <Badge variant={s.variant} dot>
                {s.label}
            </Badge>
        );
    };

    const columns: Column<User>[] = [
        {
            key: 'name',
            header: 'Team Member',
            sortable: true,
            render: (row) => (
                <div className="flex items-center gap-3">
                    <img src={row.avatar} alt={row.name} className="h-8 w-8 shrink-0 rounded-full object-cover" />
                    <div>
                        <span className="block text-xs font-semibold text-slate-900 dark:text-white">{row.name}</span>
                        <span className="text-[11px] text-slate-400">{row.email}</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'role',
            header: 'Assigned Role',
            sortable: true,
            render: (row) => (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:border-indigo-800/40 dark:bg-indigo-950/60 dark:text-indigo-300">
                    <Shield className="h-3 w-3" />
                    {row.role}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (row) =>
                row.archivedAt ? (
                    <Badge variant="neutral" dot>
                        Archived
                    </Badge>
                ) : (
                    getStatusBadge(row.status)
                ),
        },
        {
            key: 'twoFactorEnabled',
            header: '2FA Auth',
            sortable: true,
            render: (row) => (
                <span
                    className={`inline-flex items-center gap-1 text-xs font-medium ${
                        row.twoFactorEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                >
                    {row.twoFactorEnabled ? (
                        <>
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
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
            render: (row) => <span className="text-xs text-slate-500">{row.lastLogin}</span>,
        },
    ];

    if (canUpdateUsers || canDeleteUsers || canRestoreUsers) {
        columns.push({
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (row) => (
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {!row.archivedAt && canUpdateUsers && (
                        <button
                            onClick={() => {
                                setEditingUser(row);
                                setFormOpen(true);
                            }}
                            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                            title="Edit User"
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                    {!row.archivedAt && canDeleteUsers && (
                        <button
                            onClick={() => setDeleteUserId(row.id)}
                            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"
                            title="Remove User"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                    {row.archivedAt && canRestoreUsers && (
                        <button
                            onClick={() => setRestoreUserId(row.id)}
                            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800"
                            title="Restore User"
                        >
                            <ArchiveRestore className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            ),
        });
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="User & Team Management"
                subtitle="Manage administrative accounts, role privileges, and security enforcement."
                breadcrumbs={[{ label: 'Users' }]}
                actions={canCreateUsers ? (
                    <Button
                        size="sm"
                        onClick={() => {
                            setEditingUser(null);
                            setFormOpen(true);
                        }}
                        leftIcon={<UserPlus className="h-3.5 w-3.5" />}
                    >
                        Create User
                    </Button>
                ) : undefined}
            />

            <DataTable
                title={accountFilter === 'archived' ? 'Archived Accounts' : 'Active Organization Users'}
                columns={columns}
                data={users}
                keyField="id"
                isLoading={isLoading}
                searchPlaceholder="Search member by name, email, role..."
                customFilters={
                    <div className="flex items-center gap-2">
                        <select
                            value={accountFilter}
                            onChange={(e) => setAccountFilter(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                            <option value="active">Active Accounts</option>
                            {canRestoreUsers && <option value="archived">Archived Accounts</option>}
                        </select>

                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                            <option value="all">All Roles</option>
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                }
            />

            {canDeleteUsers && (
                <ConfirmDialog
                    isOpen={Boolean(deleteUserId)}
                    onClose={() => setDeleteUserId(null)}
                    onConfirm={handleDelete}
                    title="Remove Member"
                    message="This account will be archived and can be restored later. Continue?"
                />
            )}
            {canRestoreUsers && (
                <ConfirmDialog
                    isOpen={Boolean(restoreUserId)}
                    onClose={() => setRestoreUserId(null)}
                    onConfirm={handleRestore}
                    title="Restore Account"
                    message="Restore this account and allow the user to access the system again?"
                    confirmText="Restore"
                    variant="primary"
                    isLoading={isRestoring}
                />
            )}
            {(canCreateUsers || canUpdateUsers) && (
                <UserFormModal isOpen={formOpen} user={editingUser} onClose={() => setFormOpen(false)} onSaved={loadUsers} />
            )}
        </div>
    );
};
