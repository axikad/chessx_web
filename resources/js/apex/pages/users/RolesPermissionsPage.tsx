import React, { useState } from 'react';
import { Shield, Plus, Lock, Save, Users, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { mockRoles } from '../../data/roles';
import { Role, RolePermissionModule } from '../../types';
import { useToast } from '../../context/ToastContext';

export const RolesPermissionsPage: React.FC = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [selectedRole, setSelectedRole] = useState<Role>(mockRoles[0]);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const modules = [
    { key: 'users', name: 'Users' },
    { key: 'products', name: 'Products' },
    { key: 'orders', name: 'Orders' },
    { key: 'customers', name: 'Customers' },
    { key: 'reports', name: 'Reports' },
    { key: 'settings', name: 'Settings' },
  ];

  const actions = ['view', 'create', 'edit', 'delete'] as const;

  const hasPermission = (moduleName: string, action: 'view' | 'create' | 'edit' | 'delete') => {
    const mod = selectedRole.permissions.find(p => p.module.toLowerCase() === moduleName.toLowerCase());
    return mod ? mod[action] : false;
  };

  const togglePermission = (moduleName: string, action: 'view' | 'create' | 'edit' | 'delete') => {
    if (selectedRole.isSystem) {
      toast.warning('System root roles cannot be modified.');
      return;
    }

    const existingMod = selectedRole.permissions.find(p => p.module.toLowerCase() === moduleName.toLowerCase());
    let updatedPermissions: RolePermissionModule[];

    if (existingMod) {
      updatedPermissions = selectedRole.permissions.map(p =>
        p.module.toLowerCase() === moduleName.toLowerCase()
          ? { ...p, [action]: !p[action] }
          : p
      );
    } else {
      updatedPermissions = [
        ...selectedRole.permissions,
        {
          module: moduleName,
          view: action === 'view',
          create: action === 'create',
          edit: action === 'edit',
          delete: action === 'delete',
        },
      ];
    }

    const updatedRole: Role = { ...selectedRole, permissions: updatedPermissions };
    setSelectedRole(updatedRole);
    setRoles(prev => prev.map(r => (r.id === selectedRole.id ? updatedRole : r)));
    toast.success('Permission updated');
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const newRole: Role = {
      id: `role_${Date.now()}`,
      name: newRoleName,
      description: newRoleDesc || 'Custom organization role with specific granular privileges.',
      userCount: 0,
      isSystem: false,
      permissions: modules.map(m => ({
        module: m.name,
        view: true,
        create: false,
        edit: false,
        delete: false,
      })),
    };

    setRoles([...roles, newRole]);
    setSelectedRole(newRole);
    setIsAddRoleOpen(false);
    setNewRoleName('');
    setNewRoleDesc('');
    toast.success(`Role "${newRole.name}" created`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions Matrix"
        subtitle="Configure granular access control lists (ACL) and permissions per role."
        breadcrumbs={[{ label: 'Users', href: '/users' }, { label: 'Roles & Permissions' }]}
        actions={
          <Button size="sm" onClick={() => setIsAddRoleOpen(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Create Role
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Roles List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Available Roles ({roles.length})
          </h3>

          {roles.map(role => {
            const isSelected = selectedRole.id === role.id;
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield
                      className={`w-4 h-4 ${
                        isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                      }`}
                    />
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{role.name}</h4>
                  </div>
                  {role.isSystem ? (
                    <Badge variant="neutral">System</Badge>
                  ) : (
                    <span className="text-[11px] text-slate-400">{role.userCount} members</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{role.description}</p>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                  <span>{role.permissions.length} modules configured</span>
                  {isSelected && (
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                      Selected →
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column (8 cols): Permissions Matrix Table */}
        <div className="lg:col-span-8 space-y-4">
          <Card>
            <CardHeader
              title={`Permissions for ${selectedRole.name}`}
              description={selectedRole.description}
              action={
                selectedRole.isSystem ? (
                  <Badge variant="warning">Read-only System Role</Badge>
                ) : (
                  <Button
                    size="xs"
                    onClick={() => toast.success('Role matrix synchronized')}
                    leftIcon={<Save className="w-3.5 h-3.5" />}
                  >
                    Save Changes
                  </Button>
                )
              }
            />

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 font-semibold">
                    <th className="py-3 px-4">Functional Module</th>
                    <th className="py-3 px-4 text-center">View</th>
                    <th className="py-3 px-4 text-center">Create</th>
                    <th className="py-3 px-4 text-center">Edit</th>
                    <th className="py-3 px-4 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {modules.map(mod => (
                    <tr key={mod.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {mod.name}
                      </td>
                      {actions.map(act => {
                        const checked = hasPermission(mod.name, act);
                        return (
                          <td key={act} className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={selectedRole.isSystem}
                              onChange={() => togglePermission(mod.name, act)}
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 cursor-pointer disabled:cursor-not-allowed"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Role Modal */}
      <Modal isOpen={isAddRoleOpen} onClose={() => setIsAddRoleOpen(false)} title="Create New Role">
        <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
          <Input
            label="Role Identifier *"
            value={newRoleName}
            onChange={e => setNewRoleName(e.target.value)}
            placeholder="e.g. Marketing Analyst"
            required
          />
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Role Scope Description
            </label>
            <textarea
              rows={3}
              value={newRoleDesc}
              onChange={e => setNewRoleDesc(e.target.value)}
              placeholder="Describe access limits and duties..."
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddRoleOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Role
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
