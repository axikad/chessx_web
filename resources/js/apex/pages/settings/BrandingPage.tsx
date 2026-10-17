import { Image, Save, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNavigationAccess } from '../../context/NavigationAccessContext';
import { useSiteBranding } from '../../context/SiteBrandingContext';
import { useToast } from '../../context/ToastContext';
import { ApiError } from '../../services/apiClient';
import { siteSettingService } from '../../services/siteSettingService';

export const BrandingPage: React.FC = () => {
    const { can } = useNavigationAccess();
    const { site, setSite } = useSiteBranding();
    const { toast } = useToast();
    const canUpdateBranding = can('branding.update');
    const [name, setName] = useState(site.name);
    const [slogan, setSlogan] = useState(site.slogan ?? '');
    const [logo, setLogo] = useState<File | null>(null);
    const [favicon, setFavicon] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState(site.logo_url);
    const [faviconPreview, setFaviconPreview] = useState(site.favicon_url);
    const [removeLogo, setRemoveLogo] = useState(false);
    const [removeFavicon, setRemoveFavicon] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setName(site.name);
        setSlogan(site.slogan ?? '');
        setLogoPreview(site.logo_url);
        setFaviconPreview(site.favicon_url);
    }, [site]);

    if (!can('branding.read')) return <Navigate to="/" replace />;

    const selectImage = (file: File | null, type: 'logo' | 'favicon') => {
        const preview = file ? URL.createObjectURL(file) : type === 'logo' ? site.logo_url : site.favicon_url;
        if (type === 'logo') {
            setLogo(file); setLogoPreview(preview); setRemoveLogo(false);
        } else {
            setFavicon(file); setFaviconPreview(preview); setRemoveFavicon(false);
        }
    };

    const save = async (event: React.FormEvent) => {
        event.preventDefault(); setSaving(true); setErrors({});
        const data = new FormData();
        data.append('name', name); data.append('slogan', slogan);
        if (logo) data.append('logo', logo);
        if (favicon) data.append('favicon', favicon);
        if (removeLogo) data.append('remove_logo', '1');
        if (removeFavicon) data.append('remove_favicon', '1');

        try {
            const response = await siteSettingService.update(data);
            setSite(response.data); setLogo(null); setFavicon(null); setRemoveLogo(false); setRemoveFavicon(false);
            toast.success(response.message);
        } catch (error) {
            if (error instanceof ApiError) setErrors(Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value[0]])));
            toast.error(error instanceof Error ? error.message : 'Could not update branding');
        } finally { setSaving(false); }
    };

    const imageField = (label: string, preview: string | null, type: 'logo' | 'favicon') => (
        <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>
            <div className="flex flex-wrap items-center gap-4">
                <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                    {preview ? <img src={preview} alt={`${label} preview`} className="h-full w-full object-contain" /> : <Image className="h-6 w-6 text-slate-400" />}
                </div>
                {canUpdateBranding && <input type="file" accept={type === 'favicon' ? 'image/png,image/jpeg,image/webp,image/x-icon,.ico' : 'image/png,image/jpeg,image/webp'} onChange={(event) => selectImage(event.target.files?.[0] ?? null, type)} className="text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-semibold file:text-indigo-700 dark:text-slate-300 dark:file:bg-indigo-950/50 dark:file:text-indigo-300" />}
                {canUpdateBranding && preview && <Button type="button" size="sm" variant="outline" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => { if (type === 'logo') { setLogo(null); setLogoPreview(null); setRemoveLogo(true); } else { setFavicon(null); setFaviconPreview(null); setRemoveFavicon(true); } }}>Remove</Button>}
            </div>
            {errors[type] && <p className="text-xs text-rose-500">{errors[type]}</p>}
        </div>
    );

    return <div className="space-y-6">
        <PageHeader title="Site Branding" subtitle="Manage the identity displayed throughout Chess Mission." breadcrumbs={[{ label: 'Site Branding' }]} />
        <Card className="max-w-3xl">
            <CardHeader title="Brand settings" description="The site name, slogan, logo, and favicon update across the application." />
            <CardBody><form onSubmit={save} className="space-y-5">
                <Input label="Site name *" value={name} onChange={(event) => setName(event.target.value)} error={errors.name} required disabled={!canUpdateBranding} />
                <Input label="Slogan" value={slogan} onChange={(event) => setSlogan(event.target.value)} error={errors.slogan} disabled={!canUpdateBranding} />
                {imageField('Logo', logoPreview, 'logo')}
                {imageField('Favicon', faviconPreview, 'favicon')}
                {canUpdateBranding && <Button type="submit" size="sm" isLoading={saving} leftIcon={<Save className="h-3.5 w-3.5" />}>Save Branding</Button>}
            </form></CardBody>
        </Card>
    </div>;
};
