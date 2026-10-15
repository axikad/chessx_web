import { CheckCircle2, KeyRound, Loader2, Search, ShieldCheck, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Spinner } from '../../components/ui/Spinner';
import { useNavigationAccess } from '../../context/NavigationAccessContext';
import { useToast } from '../../context/ToastContext';
import { roleService } from '../../services/managementService';
import { PermissionModuleRecord, Role } from '../../types';

export const RolePermissionPage: React.FC = () => {
    const { can } = useNavigationAccess();
    const { showToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const [roles, setRoles] = useState<Role[]>([]);
    const [modules, setModules] = useState<PermissionModuleRecord[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [permissionIds, setPermissionIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingPermissionId, setSavingPermissionId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [moduleFilter, setModuleFilter] = useState('all');
    const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');

    const selectedRole = useMemo(() => roles.find((role) => role.id === selectedRoleId) ?? null, [roles, selectedRoleId]);
    const filteredModules = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return modules
            .filter((module) => moduleFilter === 'all' || String(module.id) === moduleFilter)
            .map((module) => ({
                ...module,
                permissions: module.permissions.filter((permission) => {
                    const assigned = selectedRole?.isSystem || permissionIds.includes(permission.id);
                    const matchesSearch = !normalizedSearch || [permission.name, permission.slug, permission.action]
                        .some((value) => value.toLowerCase().includes(normalizedSearch));
                    const matchesAssignment = assignmentFilter === 'all'
                        || (assignmentFilter === 'assigned' && assigned)
                        || (assignmentFilter === 'unassigned' && !assigned);

                    return matchesSearch && matchesAssignment;
                }),
            }))
            .filter((module) => module.permissions.length > 0);
    }, [assignmentFilter, moduleFilter, modules, permissionIds, search, selectedRole?.isSystem]);
    const visiblePermissionCount = filteredModules.reduce((total, module) => total + module.permissions.length, 0);
    const hasActiveFilters = search !== '' || moduleFilter !== 'all' || assignmentFilter !== 'all';

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const response = await roleService.list();
            const assignableRoles = response.data.filter((role) => !role.isSystem);
            setRoles(assignableRoles);
            setModules(response.modules);
            const requestedRole = searchParams.get('role');
            const initialRole = assignableRoles.find((role) => role.id === requestedRole) ?? assignableRoles[0];
            if (initialRole) {
                setSelectedRoleId(initialRole.id);
                setPermissionIds(initialRole.permissionIds);
                if (requestedRole !== initialRole.id) {
                    setSearchParams({ role: initialRole.id }, { replace: true });
                }
            }
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not load role permissions');
        } finally {
            setLoading(false);
        }
    }, [searchParams, setSearchParams, showToast]);

    useEffect(() => {
        load();
    }, [load]);

    if (!can('roles.read') || !can('roles.assign_permissions')) return <Navigate to="/roles" replace />;

    const changeRole = (roleId: string) => {
        const role = roles.find((candidate) => candidate.id === roleId);
        setSelectedRoleId(roleId);
        setPermissionIds(role?.permissionIds ?? []);
        setSearchParams({ role: roleId }, { replace: true });
    };

    const togglePermission = async (permissionId: number, checked: boolean) => {
        if (!selectedRole || selectedRole.isSystem || savingPermissionId !== null) return;
        const previousIds = permissionIds;
        const nextIds = checked ? [...permissionIds, permissionId] : permissionIds.filter((id) => id !== permissionId);
        setPermissionIds(nextIds);
        setSavingPermissionId(permissionId);

        try {
            const response = await roleService.syncPermissions(selectedRole.id, nextIds);
            setPermissionIds(response.data.permissionIds);
            setRoles((current) => current.map((role) => role.id === response.data.id ? response.data : role));
        } catch (error) {
            setPermissionIds(previousIds);
            showToast('error', error instanceof Error ? error.message : 'Could not update permission');
        } finally {
            setSavingPermissionId(null);
        }
    };

    const roleSelector = (
        <div className="min-w-56">
            <label htmlFor="permission-role" className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Role</label>
            <select id="permission-role" value={selectedRoleId} onChange={(event) => changeRole(event.target.value)} disabled={loading || savingPermissionId !== null} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
        </div>
    );

    const clearFilters = () => {
        setSearch('');
        setModuleFilter('all');
        setAssignmentFilter('all');
    };

    return <div className="space-y-6">
        <PageHeader title="Assign Permissions" subtitle="Select a role and update access instantly." breadcrumbs={[{ label: 'Roles', href: '/roles' }, { label: 'Assign Permissions' }]} actions={roleSelector} />

        {loading ? <div className="grid min-h-64 place-items-center"><Spinner size="lg" label="Loading permissions" /></div> : selectedRole ? <>
            <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm dark:border-indigo-900/50 dark:bg-indigo-950/30">
                <div className="flex items-center gap-2 font-semibold text-indigo-900 dark:text-indigo-200"><ShieldCheck className="h-4 w-4" />{selectedRole.name}</div>
                <div className="flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300">
                    {savingPermissionId !== null ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving change...</> : <><CheckCircle2 className="h-3.5 w-3.5" /> Changes save automatically</>}
                </div>
            </div>

            {selectedRole.isSystem && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">Super Admin always has every permission, so its checkboxes are read-only.</div>}

            <Card>
                <div className="grid gap-3 p-4 md:grid-cols-[minmax(240px,1fr)_220px_180px_auto] md:items-end">
                    <div className="space-y-1.5">
                        <label htmlFor="permission-search" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Search permissions</label>
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input id="permission-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, slug, or action..." className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="module-filter" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Module</label>
                        <select id="module-filter" value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                            <option value="all">All modules</option>
                            {modules.map((module) => <option key={module.id} value={module.id}>{module.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="assignment-filter" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Assignment</label>
                        <select id="assignment-filter" value={assignmentFilter} onChange={(event) => setAssignmentFilter(event.target.value as 'all' | 'assigned' | 'unassigned')} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                            <option value="all">All permissions</option>
                            <option value="assigned">Assigned only</option>
                            <option value="unassigned">Unassigned only</option>
                        </select>
                    </div>
                    <button type="button" onClick={clearFilters} disabled={!hasActiveFilters} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><X className="h-3.5 w-3.5" /> Clear</button>
                </div>
                <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500 dark:border-slate-800">Showing {visiblePermissionCount} permission{visiblePermissionCount === 1 ? '' : 's'} in {filteredModules.length} module{filteredModules.length === 1 ? '' : 's'}</div>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
                {filteredModules.map((module) => (
                    <Card key={module.id}>
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                            <div><h2 className="font-semibold text-slate-900 dark:text-white">{module.name}</h2><p className="mt-1 text-xs text-slate-500">{module.permissions.filter((permission) => selectedRole.isSystem || permissionIds.includes(permission.id)).length} of {module.permissions.length} enabled</p></div>
                            <KeyRound className="h-4 w-4 text-indigo-500" />
                        </div>
                        <div className="grid gap-2 p-4 sm:grid-cols-2">
                            {module.permissions.map((permission) => {
                                const checked = selectedRole.isSystem || permissionIds.includes(permission.id);
                                const saving = savingPermissionId === permission.id;
                                return <label key={permission.id} className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${checked ? 'border-indigo-200 bg-indigo-50/60 dark:border-indigo-800 dark:bg-indigo-950/30' : 'border-slate-200 dark:border-slate-800'} ${selectedRole.isSystem || savingPermissionId !== null ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-indigo-300'}`}>
                                    <span className="relative grid h-5 w-5 place-items-center">
                                        <input type="checkbox" checked={checked} disabled={selectedRole.isSystem || savingPermissionId !== null} onChange={(event) => togglePermission(permission.id, event.target.checked)} className="h-4 w-4 rounded text-indigo-600" />
                                        {saving && <Loader2 className="absolute h-5 w-5 animate-spin text-indigo-600" />}
                                    </span>
                                    <span className="min-w-0"><span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">{permission.name}</span><span className="block truncate font-mono text-[10px] text-slate-400">{permission.slug}</span></span>
                                </label>;
                            })}
                        </div>
                    </Card>
                ))}
            </div>
            {visiblePermissionCount === 0 && <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700"><Search className="mx-auto mb-3 h-6 w-6 text-slate-400" /><p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No permissions match these filters</p><button type="button" onClick={clearFilters} className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">Clear all filters</button></div>}
        </> : <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">No roles are available.</div>}
    </div>;
};
