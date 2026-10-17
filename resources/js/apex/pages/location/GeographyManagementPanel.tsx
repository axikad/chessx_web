import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { type Column, DataTable } from '../../components/ui/DataTable';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useNavigationAccess } from '../../context/NavigationAccessContext';
import { useToast } from '../../context/ToastContext';
import {
    type GeographyCity,
    type GeographyCountry,
    type GeographyState,
    locationAdministrationService,
} from '../../services/locationAdministrationService';

type GeographyLevel = 'countries' | 'states' | 'cities';
type GeographyRecord = GeographyCountry | GeographyState | GeographyCity;

const levelLabel: Record<GeographyLevel, string> = {
    countries: 'country',
    states: 'state',
    cities: 'city',
};

const selectClass =
    'h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-indigo-950';

const emptyCountry = { iso2: '', iso3: '', name: '', status: 'active' };
const emptyState = { country_id: 0, name: '', code: '', status: 'active' };
const emptyCity = {
    state_id: 0,
    name: '',
    district: '',
    latitude: '',
    longitude: '',
    timezone: '',
    status: 'active',
};

const sourceBadge = (geonamesId: number | null) => (
    <Badge variant={geonamesId ? 'info' : 'neutral'}>{geonamesId ? `GeoNames ${geonamesId}` : 'Manual'}</Badge>
);

export const GeographyManagementPanel = () => {
    const { can } = useNavigationAccess();
    const { showToast } = useToast();
    const [level, setLevel] = useState<GeographyLevel>('countries');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [countries, setCountries] = useState<GeographyCountry[]>([]);
    const [states, setStates] = useState<GeographyState[]>([]);
    const [cities, setCities] = useState<GeographyCity[]>([]);
    const [countryId, setCountryId] = useState(0);
    const [stateId, setStateId] = useState(0);
    const [editing, setEditing] = useState<GeographyRecord | null>(null);
    const [modalLevel, setModalLevel] = useState<GeographyLevel | null>(null);
    const [countryForm, setCountryForm] = useState(emptyCountry);
    const [stateForm, setStateForm] = useState(emptyState);
    const [cityForm, setCityForm] = useState(emptyCity);
    const [deleting, setDeleting] = useState<{ level: GeographyLevel; record: GeographyRecord } | null>(null);

    const loadCities = useCallback(async (selectedStateId: number) => {
        setCities(selectedStateId ? (await locationAdministrationService.cities(selectedStateId)).data : []);
    }, []);

    const loadStates = useCallback(
        async (selectedCountryId: number) => {
            const response = selectedCountryId
                ? await locationAdministrationService.states(selectedCountryId)
                : { data: [] as GeographyState[] };
            setStates(response.data);
            const nextStateId = response.data.some((state) => state.id === stateId)
                ? stateId
                : (response.data[0]?.id ?? 0);
            setStateId(nextStateId);
            await loadCities(nextStateId);
        },
        [loadCities, stateId],
    );

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const response = await locationAdministrationService.countries();
            setCountries(response.data);
            const nextCountryId = response.data.some((country) => country.id === countryId)
                ? countryId
                : (response.data[0]?.id ?? 0);
            setCountryId(nextCountryId);
            await loadStates(nextCountryId);
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not load geography records.');
        } finally {
            setLoading(false);
        }
    }, [countryId, loadStates, showToast]);

    useEffect(() => {
        void loadAll();
    }, [loadAll]);

    const changeCountry = async (selectedCountryId: number) => {
        setCountryId(selectedCountryId);
        setLoading(true);
        try {
            await loadStates(selectedCountryId);
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not load states.');
        } finally {
            setLoading(false);
        }
    };

    const changeState = async (selectedStateId: number) => {
        setStateId(selectedStateId);
        setLoading(true);
        try {
            await loadCities(selectedStateId);
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not load cities.');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditing(null);
        setModalLevel(level);
        setCountryForm(emptyCountry);
        setStateForm({ ...emptyState, country_id: countryId });
        setCityForm({ ...emptyCity, state_id: stateId });
    };

    const openEdit = (record: GeographyRecord, recordLevel: GeographyLevel) => {
        setEditing(record);
        setModalLevel(recordLevel);
        if (recordLevel === 'countries') {
            const country = record as GeographyCountry;
            setCountryForm({ iso2: country.iso2, iso3: country.iso3 ?? '', name: country.name, status: country.status });
        } else if (recordLevel === 'states') {
            const state = record as GeographyState;
            setStateForm({ country_id: state.country_id, name: state.name, code: state.code ?? '', status: state.status });
        } else {
            const city = record as GeographyCity;
            setCityForm({
                state_id: city.state_id,
                name: city.name,
                district: city.district ?? '',
                latitude: city.latitude ?? '',
                longitude: city.longitude ?? '',
                timezone: city.timezone ?? '',
                status: city.status,
            });
        }
    };

    const saveRecord = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!modalLevel) return;
        setSaving(true);
        try {
            if (modalLevel === 'countries') {
                if (editing) await locationAdministrationService.updateCountry(editing.id, countryForm);
                else await locationAdministrationService.createCountry(countryForm);
            } else if (modalLevel === 'states') {
                if (editing) await locationAdministrationService.updateState(editing.id, stateForm);
                else await locationAdministrationService.createState(stateForm);
            } else {
                const payload = {
                    ...cityForm,
                    latitude: cityForm.latitude === '' ? null : Number(cityForm.latitude),
                    longitude: cityForm.longitude === '' ? null : Number(cityForm.longitude),
                };
                if (editing) await locationAdministrationService.updateCity(editing.id, payload);
                else await locationAdministrationService.createCity(payload);
            }
            setModalLevel(null);
            await loadAll();
            showToast('success', `${levelLabel[modalLevel]} ${editing ? 'updated' : 'created'} successfully.`);
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not save the geography record.');
        } finally {
            setSaving(false);
        }
    };

    const deleteRecord = async () => {
        if (!deleting) return;
        try {
            if (deleting.level === 'countries') await locationAdministrationService.deleteCountry(deleting.record.id);
            if (deleting.level === 'states') await locationAdministrationService.deleteState(deleting.record.id);
            if (deleting.level === 'cities') await locationAdministrationService.deleteCity(deleting.record.id);
            setDeleting(null);
            await loadAll();
            showToast('success', 'Geography record deleted successfully.');
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not delete this record.');
            setDeleting(null);
        }
    };

    const actionButtons = (record: GeographyRecord, recordLevel: GeographyLevel) => (
        <div className="flex justify-end gap-1">
            {can('geography.update') && (
                <button onClick={() => openEdit(record, recordLevel)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800" title="Edit record">
                    <Edit2 className="h-3.5 w-3.5" />
                </button>
            )}
            {can('geography.delete') && (
                <button onClick={() => setDeleting({ level: recordLevel, record })} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40" title="Delete record">
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );

    const countryColumns: Column<GeographyCountry>[] = [
        { key: 'name', header: 'Country', sortable: true, render: (country) => <div><span className="font-semibold text-slate-900 dark:text-white">{country.name}</span><span className="block text-[11px] text-slate-400">{country.iso2} · {country.iso3 || 'No ISO3'}</span></div> },
        { key: 'geonames_id', header: 'Source', render: (country) => sourceBadge(country.geonames_id) },
        { key: 'states_count', header: 'States', align: 'center' },
        { key: 'status', header: 'Status', render: (country) => <Badge variant={country.status === 'active' ? 'success' : 'neutral'} dot>{country.status}</Badge> },
    ];
    const stateColumns: Column<GeographyState>[] = [
        { key: 'name', header: 'State', sortable: true, render: (state) => <div><span className="font-semibold text-slate-900 dark:text-white">{state.name}</span><span className="block text-[11px] text-slate-400">{state.code || 'No code'}</span></div> },
        { key: 'geonames_id', header: 'Source', render: (state) => sourceBadge(state.geonames_id) },
        { key: 'cities_count', header: 'Cities', align: 'center' },
        { key: 'status', header: 'Status', render: (state) => <Badge variant={state.status === 'active' ? 'success' : 'neutral'} dot>{state.status}</Badge> },
    ];
    const cityColumns: Column<GeographyCity>[] = [
        { key: 'name', header: 'City', sortable: true, render: (city) => <div><span className="font-semibold text-slate-900 dark:text-white">{city.name}</span><span className="block text-[11px] text-slate-400">{city.district || 'No district'}</span></div> },
        { key: 'geonames_id', header: 'Source', render: (city) => sourceBadge(city.geonames_id) },
        { key: 'coordinates', header: 'Coordinates', render: (city) => city.latitude && city.longitude ? `${city.latitude}, ${city.longitude}` : '—' },
        { key: 'timezone', header: 'Timezone', render: (city) => city.timezone || '—' },
        { key: 'players_count', header: 'Players', align: 'center' },
        { key: 'status', header: 'Status', render: (city) => <Badge variant={city.status === 'active' ? 'success' : 'neutral'} dot>{city.status}</Badge> },
    ];
    if (can('geography.update') || can('geography.delete')) {
        countryColumns.push({ key: 'actions', header: 'Actions', align: 'right', render: (country) => actionButtons(country, 'countries') });
        stateColumns.push({ key: 'actions', header: 'Actions', align: 'right', render: (state) => actionButtons(state, 'states') });
        cityColumns.push({ key: 'actions', header: 'Actions', align: 'right', render: (city) => actionButtons(city, 'cities') });
    }

    const filters = (
        <>
            <select aria-label="Geography record type" className={selectClass} value={level} onChange={(event) => setLevel(event.target.value as GeographyLevel)}>
                <option value="countries">Countries</option>
                <option value="states">States</option>
                <option value="cities">Cities</option>
            </select>
            {level !== 'countries' && <select aria-label="Country" className={selectClass} value={countryId} onChange={(event) => void changeCountry(Number(event.target.value))}>{countries.map((country) => <option key={country.id} value={country.id}>{country.name}</option>)}</select>}
            {level === 'cities' && <select aria-label="State" className={selectClass} value={stateId} onChange={(event) => void changeState(Number(event.target.value))}>{states.map((state) => <option key={state.id} value={state.id}>{state.name}</option>)}</select>}
        </>
    );
    const createButton = can('geography.create') ? <Button size="sm" onClick={openCreate} leftIcon={<Plus className="h-3.5 w-3.5" />}>Add {levelLabel[level]}</Button> : undefined;

    return (
        <div className="space-y-4">
            {level === 'countries' && <DataTable title="Countries" columns={countryColumns} data={countries} keyField="id" isLoading={loading} selectable={false} searchPlaceholder="Search countries..." customFilters={filters} actions={createButton} emptyTitle="No countries" />}
            {level === 'states' && <DataTable title="States & Territories" columns={stateColumns} data={states} keyField="id" isLoading={loading} selectable={false} searchPlaceholder="Search states..." customFilters={filters} actions={createButton} emptyTitle="No states" />}
            {level === 'cities' && <DataTable title="Cities" columns={cityColumns} data={cities} keyField="id" isLoading={loading} selectable={false} searchPlaceholder="Search cities..." customFilters={filters} actions={createButton} emptyTitle="No cities" />}

            <Modal isOpen={Boolean(modalLevel)} onClose={() => setModalLevel(null)} title={`${editing ? 'Edit' : 'Add'} ${modalLevel ? levelLabel[modalLevel] : 'record'}`} description="GeoNames source identifiers remain read-only to preserve import mapping.">
                <form className="space-y-4" onSubmit={saveRecord}>
                    {modalLevel === 'countries' && <><div className="grid gap-4 sm:grid-cols-2"><Input label="ISO2 *" maxLength={2} value={countryForm.iso2} onChange={(event) => setCountryForm({ ...countryForm, iso2: event.target.value })} required /><Input label="ISO3" maxLength={3} value={countryForm.iso3} onChange={(event) => setCountryForm({ ...countryForm, iso3: event.target.value })} /></div><Input label="Country Name *" value={countryForm.name} onChange={(event) => setCountryForm({ ...countryForm, name: event.target.value })} required /></>}
                    {modalLevel === 'states' && <><label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Country *</span><select className={selectClass + ' w-full'} value={stateForm.country_id} onChange={(event) => setStateForm({ ...stateForm, country_id: Number(event.target.value) })} required>{countries.map((country) => <option key={country.id} value={country.id}>{country.name}</option>)}</select></label><div className="grid gap-4 sm:grid-cols-2"><Input label="State Name *" value={stateForm.name} onChange={(event) => setStateForm({ ...stateForm, name: event.target.value })} required /><Input label="Code" value={stateForm.code} onChange={(event) => setStateForm({ ...stateForm, code: event.target.value })} /></div></>}
                    {modalLevel === 'cities' && <><label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-700 dark:text-slate-300">State *</span><select className={selectClass + ' w-full'} value={cityForm.state_id} onChange={(event) => setCityForm({ ...cityForm, state_id: Number(event.target.value) })} required>{states.map((state) => <option key={state.id} value={state.id}>{state.name}</option>)}</select></label><div className="grid gap-4 sm:grid-cols-2"><Input label="City Name *" value={cityForm.name} onChange={(event) => setCityForm({ ...cityForm, name: event.target.value })} required /><Input label="District" value={cityForm.district} onChange={(event) => setCityForm({ ...cityForm, district: event.target.value })} /></div><div className="grid gap-4 sm:grid-cols-2"><Input type="number" step="any" min={-90} max={90} label="Latitude" value={cityForm.latitude} onChange={(event) => setCityForm({ ...cityForm, latitude: event.target.value })} /><Input type="number" step="any" min={-180} max={180} label="Longitude" value={cityForm.longitude} onChange={(event) => setCityForm({ ...cityForm, longitude: event.target.value })} /></div><Input label="Timezone" placeholder="Asia/Kolkata" value={cityForm.timezone} onChange={(event) => setCityForm({ ...cityForm, timezone: event.target.value })} /></>}
                    <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status *</span><select className={selectClass + ' w-full'} value={modalLevel === 'countries' ? countryForm.status : modalLevel === 'states' ? stateForm.status : cityForm.status} onChange={(event) => { if (modalLevel === 'countries') setCountryForm({ ...countryForm, status: event.target.value }); if (modalLevel === 'states') setStateForm({ ...stateForm, status: event.target.value }); if (modalLevel === 'cities') setCityForm({ ...cityForm, status: event.target.value }); }}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
                    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setModalLevel(null)}>Cancel</Button><Button type="submit" isLoading={saving}>{editing ? 'Update' : 'Create'}</Button></div>
                </form>
            </Modal>

            <ConfirmDialog isOpen={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={deleteRecord} title="Delete Geography Record" message="Delete this record permanently? Records used by players, regions, or child locations cannot be deleted; deactivate them instead." confirmText="Delete" variant="danger" />
        </div>
    );
};
