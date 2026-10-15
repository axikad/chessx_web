import { Camera, UserPlus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { User } from '../../types';

interface UserFormModalProps {
    isOpen: boolean;
    user?: User | null;
    onClose: () => void;
    onSaved: () => void;
}

const emptyForm = { name: '', email: '', phone: '', role_id: '', status: 'active' as User['status'], password: '', avatar: null as File | null };

export const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, user, onClose, onSaved }) => {
    const { toast, showToast } = useToast();
    const [form, setForm] = useState(emptyForm);
    const [roles, setRoles] = useState<{ id: number; name: string; slug: string; description: string | null }[]>([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState('');

    useEffect(() => {
        if (!isOpen) return;

        setForm(
            user
                ? {
                      name: user.name,
                      email: user.email,
                      phone: user.phone,
                      role_id: String(user.roleId),
                      status: user.status,
                      password: '',
                      avatar: null,
                  }
                : emptyForm,
        );
        setAvatarPreview(user?.avatar ?? 'https://ui-avatars.com/api/?name=New+User&background=4f46e5&color=fff');
        setRolesLoading(true);
        userService
            .getRoleOptions()
            .then(setRoles)
            .catch(() => showToast('error', 'Failed to load roles'))
            .finally(() => setRolesLoading(false));
    }, [isOpen, showToast, user]);

    useEffect(
        () => () => {
            if (avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
        },
        [avatarPreview],
    );

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        const payload: Record<string, unknown> = {
            name: form.name,
            email: form.email,
            phone: form.phone,
            role_id: Number(form.role_id),
            status: form.status,
            password: form.password,
        };
        if (form.avatar) payload.avatar = form.avatar;
        try {
            if (user) await userService.updateUser(user.id, payload);
            else await userService.createUser(payload);
            toast.success(user ? 'User updated successfully' : 'User created successfully');
            onClose();
            onSaved();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not save user');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={user ? 'Edit User' : 'Create User'}
            description="Manage account details, database role, and access status."
            size="lg"
        >
            <form onSubmit={submit} className="space-y-4">
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                    <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-white bg-indigo-100 shadow-sm dark:border-slate-700">
                        <img src={avatarPreview} alt={form.name || 'User profile'} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <Camera className="h-3.5 w-3.5" />
                            Profile Image
                        </label>
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={(event) => {
                                const avatar = event.target.files?.[0] ?? null;
                                setForm({ ...form, avatar });
                                if (avatar) setAvatarPreview(URL.createObjectURL(avatar));
                            }}
                            className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100 dark:file:bg-indigo-950/60 dark:file:text-indigo-300"
                        />
                        <p className="mt-1 text-[11px] text-slate-400">JPG, PNG, or WebP. Maximum 2 MB.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input label="Full Name *" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
                    <Input
                        label="Email Address *"
                        type="email"
                        value={form.email}
                        onChange={(event) => setForm({ ...form, email: event.target.value })}
                        required
                    />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input label="Phone Number" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                    <Select
                        label="Assigned Role *"
                        value={form.role_id}
                        onChange={(event) => setForm({ ...form, role_id: event.target.value })}
                        options={[
                            { value: '', label: rolesLoading ? 'Loading roles…' : 'Select a role', disabled: true },
                            ...roles.map((role) => ({ value: String(role.id), label: `${role.name} (${role.slug})` })),
                        ]}
                        disabled={rolesLoading}
                        required
                        helperText="Loaded directly from the roles table."
                    />
                </div>
                <Select
                    label="Account Status *"
                    value={form.status}
                    onChange={(event) => setForm({ ...form, status: event.target.value as User['status'] })}
                    options={[
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                        { value: 'suspended', label: 'Suspended' },
                    ]}
                    required
                />
                <Input
                    label={user ? 'New Password (Optional)' : 'Password *'}
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    placeholder={user ? 'Leave blank to keep the current password' : 'Minimum 8 characters'}
                    required={!user}
                />
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={saving} leftIcon={<UserPlus className="h-3.5 w-3.5" />}>
                        {user ? 'Update User' : 'Create User'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
