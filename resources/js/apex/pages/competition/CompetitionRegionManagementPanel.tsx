import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { type Column, DataTable } from '../../components/ui/DataTable';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useNavigationAccess } from '../../context/NavigationAccessContext';
import { useToast } from '../../context/ToastContext';
import {
    competitionService,
    type CompetitionRegionRecord,
    type CompetitionRegionTier,
} from '../../services/competitionService';
import {
    type GeographyCity,
    type GeographyCountry,
    type GeographyState,
    locationAdministrationService,
} from '../../services/locationAdministrationService';

const selectClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-950';

const emptyForm = {
    tier_id: 0,
    country_id: 0,
    state_id: 0,
    city_id: 0,
    name: '',
    status: 'active',
};

export const CompetitionRegionManagementPanel = () => {
    const { can } = useNavigationAccess();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [regions, setRegions] = useState<CompetitionRegionRecord[]>([]);
    const [tiers, setTiers] = useState<CompetitionRegionTier[]>([]);
    const [countries, setCountries] = useState<GeographyCountry[]>([]);
    const [states, setStates] = useState<GeographyState[]>([]);
    const [cities, setCities] = useState<GeographyCity[]>([]);
    const [tierFilter, setTierFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [editing, setEditing] = useState<CompetitionRegionRecord | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleting, setDeleting] = useState<CompetitionRegionRecord | null>(null);
    const [form, setForm] = useState(emptyForm);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [regionResponse, countryResponse] = await Promise.all([
                competitionService.regions(),
                locationAdministrationService.countries(),
            ]);
            setRegions(regionResponse.data);
            setTiers(regionResponse.tiers);
            setCountries(countryResponse.data);
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not load competition regions.');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const loadStates = async (countryId: number) => {
        const nextStates = countryId ? (await locationAdministrationService.states(countryId)).data : [];
        setStates(nextStates);

        return nextStates;
    };

    const loadCities = async (stateId: number) => {
        const nextCities = stateId ? (await locationAdministrationService.cities(stateId)).data : [];
        setCities(nextCities);

        return nextCities;
    };

    const selectedTier = tiers.find((tier) => tier.id === form.tier_id);

    const openCreate = async () => {
        const tier = tiers[0];
        const country = countries[0];
        const nextStates = country ? await loadStates(country.id) : [];
        const state = nextStates[0];
        const nextCities = state ? await loadCities(state.id) : [];
        setEditing(null);
        setForm({
            ...emptyForm,
            tier_id: tier?.id ?? 0,
            country_id: country?.id ?? 0,
            state_id: state?.id ?? 0,
            city_id: nextCities[0]?.id ?? 0,
        });
        setModalOpen(true);
    };

    const openEdit = async (region: CompetitionRegionRecord) => {
        try {
            const selectedCountryId = region.countryId ?? countries[0]?.id ?? 0;
            const nextStates = selectedCountryId ? await loadStates(selectedCountryId) : [];
            const selectedStateId = region.stateId ?? nextStates[0]?.id ?? 0;
            const nextCities = selectedStateId ? await loadCities(selectedStateId) : [];
            setEditing(region);
            setForm({
                tier_id: region.tierId,
                country_id: selectedCountryId,
                state_id: selectedStateId,
                city_id: region.cityId ?? nextCities[0]?.id ?? 0,
                name: region.name,
                status: region.status,
            });
            setModalOpen(true);
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not load the region geography.');
        }
    };

    const changeTier = (tierId: number) => {
        setForm((current) => ({ ...current, tier_id: tierId }));
    };

    const changeCountry = async (countryId: number) => {
        try {
            const nextStates = await loadStates(countryId);
            const stateId = nextStates[0]?.id ?? 0;
            const nextCities = await loadCities(stateId);
            setForm((current) => ({
                ...current,
                country_id: countryId,
                state_id: stateId,
                city_id: nextCities[0]?.id ?? 0,
            }));
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not load states.');
        }
    };

    const changeState = async (stateId: number) => {
        try {
            const nextCities = await loadCities(stateId);
            setForm((current) => ({ ...current, state_id: stateId, city_id: nextCities[0]?.id ?? 0 }));
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not load cities.');
        }
    };

    const regionPayload = () => ({
        tier_id: form.tier_id,
        country_id: selectedTier?.code === 'national' ? form.country_id : null,
        state_id: selectedTier?.code === 'state' ? form.state_id : null,
        city_id: selectedTier?.code === 'city' ? form.city_id : null,
        name: form.name,
        status: form.status,
    });

    const saveRegion = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        try {
            if (editing) await competitionService.updateRegion(editing.id, regionPayload());
            else await competitionService.createRegion(regionPayload());
            setModalOpen(false);
            await loadData();
            showToast('success', `Competition region ${editing ? 'updated' : 'created'} successfully.`);
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not save the competition region.');
        } finally {
            setSaving(false);
        }
    };

    const deleteRegion = async () => {
        if (!deleting) return;
        try {
            await competitionService.deleteRegion(deleting.id);
            setDeleting(null);
            await loadData();
            showToast('success', 'Competition region deleted successfully.');
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not delete the competition region.');
            setDeleting(null);
        }
    };

    const filteredRegions = useMemo(
        () => regions.filter((region) =>
            (tierFilter === 'all' || region.tierCode === tierFilter)
            && (statusFilter === 'all' || region.status === statusFilter)),
        [regions, statusFilter, tierFilter],
    );

    const columns: Column<CompetitionRegionRecord>[] = [
        { key: 'name', header: 'Region', sortable: true, render: (region) => <div><span className="font-semibold text-slate-900 dark:text-white">{region.name}</span><span className="block font-mono text-[11px] text-slate-400">{region.scopeKey}</span></div> },
        { key: 'tierName', header: 'Tier', sortable: true, render: (region) => <Badge variant="info">{region.tierName}</Badge> },
        { key: 'place', header: 'Geographic Scope', sortable: true },
        { key: 'leaderboardSnapshotCount', header: 'Snapshots', align: 'center' },
        { key: 'status', header: 'Status', render: (region) => <Badge variant={region.status === 'active' ? 'success' : 'neutral'} dot>{region.status}</Badge> },
    ];
    if (can('competitions.update') || can('competitions.delete')) {
        columns.push({
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (region) => <div className="flex justify-end gap-1">
                {can('competitions.update') && <button onClick={() => void openEdit(region)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800" title="Edit region"><Edit2 className="h-3.5 w-3.5" /></button>}
                {can('competitions.delete') && <button onClick={() => setDeleting(region)} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40" title="Delete region"><Trash2 className="h-3.5 w-3.5" /></button>}
            </div>,
        });
    }

    const filters = <>
        <select aria-label="Competition tier filter" className={selectClass} value={tierFilter} onChange={(event) => setTierFilter(event.target.value)}>
            <option value="all">All tiers</option>
            {tiers.map((tier) => <option key={tier.id} value={tier.code}>{tier.name}</option>)}
        </select>
        <select aria-label="Region status filter" className={selectClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
        </select>
    </>;

    return <>
        <DataTable
            title="Competition Regions"
            columns={columns}
            data={filteredRegions}
            keyField="id"
            isLoading={loading}
            selectable={false}
            searchPlaceholder="Search regions, tiers, or places..."
            customFilters={filters}
            actions={can('competitions.create') ? <Button size="sm" onClick={() => void openCreate()} leftIcon={<Plus className="h-3.5 w-3.5" />}>Create Region</Button> : undefined}
            emptyTitle="No competition regions"
        />

        {(can('competitions.create') || can('competitions.update')) && <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Competition Region' : 'Create Competition Region'} description="The selected tier determines whether this region belongs to a city, state, country, or the world.">
            <form className="space-y-4" onSubmit={saveRegion}>
                <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Competition Tier *</span><select className={selectClass} value={form.tier_id} onChange={(event) => changeTier(Number(event.target.value))} required>{tiers.map((tier) => <option key={tier.id} value={tier.id}>{tier.name}{tier.isActive ? '' : ' (Inactive)'}</option>)}</select></label>

                {selectedTier?.code !== 'world' && <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Country *</span><select className={selectClass} value={form.country_id} onChange={(event) => void changeCountry(Number(event.target.value))} required>{countries.map((country) => <option key={country.id} value={country.id}>{country.name}{country.status === 'active' ? '' : ' (Inactive)'}</option>)}</select></label>}
                {(selectedTier?.code === 'state' || selectedTier?.code === 'city') && <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-700 dark:text-slate-300">State *</span><select className={selectClass} value={form.state_id} onChange={(event) => void changeState(Number(event.target.value))} required>{states.map((state) => <option key={state.id} value={state.id}>{state.name}{state.status === 'active' ? '' : ' (Inactive)'}</option>)}</select></label>}
                {selectedTier?.code === 'city' && <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-700 dark:text-slate-300">City *</span><select className={selectClass} value={form.city_id} onChange={(event) => setForm({ ...form, city_id: Number(event.target.value) })} required>{cities.map((city) => <option key={city.id} value={city.id}>{city.name}{city.status === 'active' ? '' : ' (Inactive)'}</option>)}</select></label>}
                {selectedTier?.code === 'world' && <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300">World regions use the global scope and do not require a geographic record.</div>}

                <Input label="Region Name *" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Example: Surat City League" required />
                <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status *</span><select className={selectClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
                <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit" isLoading={saving} disabled={!form.tier_id || !form.name.trim()}> {editing ? 'Update Region' : 'Create Region'} </Button></div>
            </form>
        </Modal>}

        {can('competitions.delete') && <ConfirmDialog isOpen={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={deleteRegion} title="Delete Competition Region" message="Delete this competition region permanently? Regions referenced by leaderboard history cannot be deleted; deactivate them instead." confirmText="Delete" variant="danger" />}
    </>;
};
