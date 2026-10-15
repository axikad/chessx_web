import { Edit2, KeyRound, Plus, Shield, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Column, DataTable } from '../../components/ui/DataTable';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNavigationAccess } from '../../context/NavigationAccessContext';
import { useToast } from '../../context/ToastContext';
import { roleService } from '../../services/managementService';
import { Role } from '../../types';

const emptyRole = { name: '', slug: '', description: '' };

export const RoleListPage: React.FC = () => {
    const { toast, showToast } = useToast();
    const navigate = useNavigate();
    const { can } = useNavigationAccess();
    const canCreateRoles = can('roles.create');
    const canUpdateRoles = can('roles.update');
    const canDeleteRoles = can('roles.delete');
    const canAssignPermissions = can('roles.assign_permissions');
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [roleForm, setRoleForm] = useState(emptyRole);
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [deleteRole, setDeleteRole] = useState<Role | null>(null);

    const loadRoles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await roleService.list();
            setRoles(response.data);
        } catch {
            showToast('error', 'Failed to load roles');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadRoles();
    }, [loadRoles]);

    const openRoleModal = (role?: Role) => {
        setEditingRole(role ?? null);
        setRoleForm(role ? { name: role.name, slug: role.slug, description: role.description } : emptyRole);
        setRoleModalOpen(true);
    };

    const saveRole = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        try {
            if (editingRole) await roleService.update(editingRole.id, roleForm);
            else await roleService.create(roleForm);
            setRoleModalOpen(false);
            await loadRoles();
            toast.success(`Role ${editingRole ? 'updated' : 'created'} successfully`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not save role');
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteRole) return;
        try {
            await roleService.remove(deleteRole.id);
            setDeleteRole(null);
            await loadRoles();
            toast.success('Role deleted');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not delete role');
        }
    };

    const columns: Column<Role>[] = [
        {
            key: 'name',
            header: 'Role',
            sortable: true,
            render: (role) => (
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/60">
                        <Shield className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="block font-semibold text-slate-900 dark:text-white">{role.name}</span>
                        <span className="font-mono text-[11px] text-slate-400">{role.slug}</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            render: (role) => <span className="line-clamp-2 max-w-md text-slate-500">{role.description || 'No description'}</span>,
        },
        {
            key: 'userCount',
            header: 'Users',
            sortable: true,
            align: 'center',
            render: (role) => <Badge variant="neutral">{role.userCount} users</Badge>,
        },
        {
            key: 'permissionIds',
            header: 'Permissions',
            align: 'center',
            render: (role) =>
                role.isSystem ? <Badge variant="warning">Full access</Badge> : <Badge variant="info">{role.permissionIds.length} assigned</Badge>,
        },
    ];

    if (canUpdateRoles || canDeleteRoles || canAssignPermissions) {
        columns.push({
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (role) => (
                <div className="flex justify-end gap-1" onClick={(event) => event.stopPropagation()}>
                    {canAssignPermissions && !role.isSystem && (
                        <button
                            onClick={() => navigate(`/role-permissions?role=${role.id}`)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                            title="Assign permissions"
                        >
                            <KeyRound className="h-3.5 w-3.5" />
                        </button>
                    )}
                    {!role.isSystem && (
                        <>
                            {canUpdateRoles && <button onClick={() => openRoleModal(role)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800" title="Edit role"><Edit2 className="h-3.5 w-3.5" /></button>}
                            {canDeleteRoles && <button onClick={() => setDeleteRole(role)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800" title="Delete role"><Trash2 className="h-3.5 w-3.5" /></button>}
                        </>
                    )}
                </div>
            ),
        });
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Role Management"
                subtitle="Create roles and control access for each group of users."
                breadcrumbs={[{ label: 'Users', href: '/users' }, { label: 'Roles' }]}
                actions={canCreateRoles ? (
                    <Button size="sm" onClick={() => openRoleModal()} leftIcon={<Plus className="h-3.5 w-3.5" />}>
                        Create Role
                    </Button>
                ) : undefined}
            />
            <DataTable
                title="Roles"
                columns={columns}
                data={roles}
                keyField="id"
                isLoading={loading}
                selectable={false}
                searchPlaceholder="Search roles..."
                emptyTitle="No roles found"
                emptyDescription="Create your first role to organize user access."
            />

            {(canCreateRoles || canUpdateRoles) && <Modal
                isOpen={roleModalOpen}
                onClose={() => setRoleModalOpen(false)}
                title={editingRole ? 'Edit Role' : 'Create Role'}
                description="Role details are saved directly to the roles table."
            >
                <form onSubmit={saveRole} className="space-y-4">
                    <Input
                        label="Role Name *"
                        value={roleForm.name}
                        onChange={(event) => setRoleForm({ ...roleForm, name: event.target.value })}
                        required
                    />
                    <Input
                        label="Slug *"
                        value={roleForm.slug}
                        onChange={(event) => setRoleForm({ ...roleForm, slug: event.target.value.toLowerCase().replace(/\s+/g, '_') })}
                        helperText="Used internally, for example: inventory_manager"
                        required
                    />
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
                        <textarea
                            value={roleForm.description}
                            onChange={(event) => setRoleForm({ ...roleForm, description: event.target.value })}
                            rows={3}
                            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setRoleModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={saving}>
                            {editingRole ? 'Update Role' : 'Create Role'}
                        </Button>
                    </div>
                </form>
            </Modal>}

            {canDeleteRoles && <ConfirmDialog
                isOpen={Boolean(deleteRole)}
                onClose={() => setDeleteRole(null)}
                onConfirm={confirmDelete}
                title="Delete Role"
                message="This role can only be deleted when no users are assigned to it."
            />}
        </div>
    );
};
