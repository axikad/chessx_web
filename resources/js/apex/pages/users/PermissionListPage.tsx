import { Edit2, KeyRound, Plus, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Column, DataTable } from '../../components/ui/DataTable';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Select } from '../../components/ui/Select';
import { useNavigationAccess } from '../../context/NavigationAccessContext';
import { useToast } from '../../context/ToastContext';
import { permissionService } from '../../services/managementService';
import { PermissionRecord } from '../../types';

const emptyPermission = { module_id: '', name: '', slug: '', action: 'read', description: '', is_active: true };

export const PermissionListPage: React.FC = () => {
    const { toast, showToast } = useToast();
    const { can } = useNavigationAccess();
    const canCreatePermissions = can('permissions.create');
    const canUpdatePermissions = can('permissions.update');
    const canDeletePermissions = can('permissions.delete');
    const [permissions, setPermissions] = useState<PermissionRecord[]>([]);
    const [modules, setModules] = useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<PermissionRecord | null>(null);
    const [form, setForm] = useState(emptyPermission);
    const [modalOpen, setModalOpen] = useState(false);
    const [deletePermission, setDeletePermission] = useState<PermissionRecord | null>(null);

    const loadPermissions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await permissionService.list();
            setPermissions(response.data);
            setModules(response.modules);
        } catch {
            showToast('error', 'Failed to load permissions');
        } finally {
            setLoading(false);
        }
    }, [showToast]);
    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    const openModal = (permission?: PermissionRecord) => {
        setEditing(permission ?? null);
        setForm(
            permission
                ? {
                      module_id: permission.module_id ? String(permission.module_id) : '',
                      name: permission.name,
                      slug: permission.slug,
                      action: permission.action,
                      description: permission.description ?? '',
                      is_active: permission.is_active,
                  }
                : emptyPermission,
        );
        setModalOpen(true);
    };
    const save = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        const payload = { ...form, module_id: form.module_id ? Number(form.module_id) : null };
        try {
            if (editing) await permissionService.update(editing.id, payload);
            else await permissionService.create(payload);
            setModalOpen(false);
            await loadPermissions();
            toast.success(`Permission ${editing ? 'updated' : 'created'} successfully`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not save permission');
        } finally {
            setSaving(false);
        }
    };
    const confirmDelete = async () => {
        if (!deletePermission) return;
        try {
            await permissionService.remove(deletePermission.id);
            setDeletePermission(null);
            await loadPermissions();
            toast.success('Permission deleted');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not delete permission');
        }
    };

    const columns: Column<PermissionRecord>[] = [
    ];

    if (canUpdatePermissions || canDeletePermissions) {
        columns.push({
            key: 'name',
            header: 'Permission',
            sortable: true,
            render: (permission) => (
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-violet-50 p-2 text-violet-600 dark:bg-violet-950/60">
                        <KeyRound className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="block font-semibold text-slate-900 dark:text-white">{permission.name}</span>
                        <span className="font-mono text-[11px] text-slate-400">{permission.slug}</span>
                    </div>
                </div>
            ),
        },
        { key: 'module', header: 'Module', render: (permission) => <span>{permission.module?.name ?? 'No module'}</span> },
        { key: 'action', header: 'Action', sortable: true, render: (permission) => <Badge variant="info">{permission.action}</Badge> },
        {
            key: 'is_active',
            header: 'Status',
            sortable: true,
            render: (permission) => (
                <Badge variant={permission.is_active ? 'success' : 'neutral'} dot>
                    {permission.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (permission) => (
                <div className="flex justify-end gap-1" onClick={(event) => event.stopPropagation()}>
                    {canUpdatePermissions && <button
                        onClick={() => openModal(permission)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                    </button>}
                    {canDeletePermissions && <button
                        onClick={() => setDeletePermission(permission)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>}
                </div>
            ),
        });
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Permission Management"
                subtitle="Manage the individual abilities that can be assigned to roles."
                breadcrumbs={[{ label: 'Permissions' }]}
                actions={canCreatePermissions ? (
                    <Button size="sm" onClick={() => openModal()} leftIcon={<Plus className="h-3.5 w-3.5" />}>
                        Create Permission
                    </Button>
                ) : undefined}
            />
            <DataTable
                title="Permissions"
                columns={columns}
                data={permissions}
                keyField="id"
                isLoading={loading}
                selectable={false}
                searchPlaceholder="Search permissions..."
            />
            {(canCreatePermissions || canUpdatePermissions) && <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Edit Permission' : 'Create Permission'}
                description="Define one database permission for one action."
            >
                <form onSubmit={save} className="space-y-4">
                    <Input
                        label="Permission Name *"
                        value={form.name}
                        onChange={(event) => setForm({ ...form, name: event.target.value })}
                        required
                    />
                    <Input
                        label="Slug *"
                        value={form.slug}
                        onChange={(event) => setForm({ ...form, slug: event.target.value.toLowerCase().replace(/\s+/g, '.') })}
                        helperText="For example: users.read"
                        required
                    />
                    <Select
                        label="Module"
                        value={form.module_id}
                        onChange={(event) => setForm({ ...form, module_id: event.target.value })}
                        options={[{ value: '', label: 'No module' }, ...modules.map((module) => ({ value: String(module.id), label: module.name }))]}
                    />
                    <Input
                        label="Action *"
                        value={form.action}
                        onChange={(event) => setForm({ ...form, action: event.target.value.toLowerCase().replace(/\s+/g, '_') })}
                        required
                    />
                    <Input label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
                            className="h-4 w-4 rounded text-indigo-600"
                        />
                        Active permission
                    </label>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={saving}>
                            {editing ? 'Update Permission' : 'Create Permission'}
                        </Button>
                    </div>
                </form>
            </Modal>}
            {canDeletePermissions && <ConfirmDialog
                isOpen={Boolean(deletePermission)}
                onClose={() => setDeletePermission(null)}
                onConfirm={confirmDelete}
                title="Delete Permission"
                message="Assigned permissions must be removed from every role before deletion."
            />}
        </div>
    );
};
