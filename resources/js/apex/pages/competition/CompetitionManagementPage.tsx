import { BarChart3, CalendarRange, Edit2, Plus, RefreshCw, ShieldCheck, Trash2, Trophy } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Column, DataTable } from '../../components/ui/DataTable';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Tabs } from '../../components/ui/Tabs';
import { useNavigationAccess } from '../../context/NavigationAccessContext';
import { useToast } from '../../context/ToastContext';
import {
    competitionService,
    CompetitionTierRecord,
    LeaderboardRecord,
    RatingRecord,
    SeasonRecord,
} from '../../services/competitionService';

type SectionId = 'competitions' | 'seasons' | 'ratings' | 'leaderboards';
const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-950';
const emptySeason = { name: '', starts_at: '', ends_at: '', status: 'scheduled' };

const statusBadge = (status: string) => {
    const variant = status === 'active' ? 'success' : status === 'scheduled' ? 'info' : status === 'completed' ? 'neutral' : 'danger';
    return <Badge variant={variant}>{status}</Badge>;
};

export const CompetitionManagementPage: React.FC = () => {
    const { can } = useNavigationAccess();
    const { showToast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();
    const allowedSections = useMemo(() => [
        can('competitions.read') && { id: 'competitions' as SectionId, label: 'Competitions', icon: <Trophy className="h-4 w-4" /> },
        can('seasons.read') && { id: 'seasons' as SectionId, label: 'Seasons', icon: <CalendarRange className="h-4 w-4" /> },
        can('ratings.read') && { id: 'ratings' as SectionId, label: 'Player Ratings', icon: <BarChart3 className="h-4 w-4" /> },
        can('leaderboards.read') && { id: 'leaderboards' as SectionId, label: 'Leaderboards', icon: <ShieldCheck className="h-4 w-4" /> },
    ].filter(Boolean) as { id: SectionId; label: string; icon: React.ReactNode }[], [can]);
    const requestedSection = location.pathname.split('/').filter(Boolean).at(-1) as SectionId;
    const activeSection = allowedSections.some((section) => section.id === requestedSection)
        ? requestedSection
        : allowedSections[0]?.id;

    const [loading, setLoading] = useState(false);
    const [tiers, setTiers] = useState<CompetitionTierRecord[]>([]);
    const [seasons, setSeasons] = useState<SeasonRecord[]>([]);
    const [ratings, setRatings] = useState<RatingRecord[]>([]);
    const [leaderboards, setLeaderboards] = useState<LeaderboardRecord[]>([]);
    const [leaderboardTiers, setLeaderboardTiers] = useState<CompetitionTierRecord[]>([]);
    const [leaderboardSeasons, setLeaderboardSeasons] = useState<Pick<SeasonRecord, 'id' | 'name'>[]>([]);
    const [seasonModalOpen, setSeasonModalOpen] = useState(false);
    const [editingSeason, setEditingSeason] = useState<SeasonRecord | null>(null);
    const [seasonForm, setSeasonForm] = useState(emptySeason);
    const [deleteSeason, setDeleteSeason] = useState<SeasonRecord | null>(null);
    const [rolloverSeason, setRolloverSeason] = useState<SeasonRecord | null>(null);
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [editingRating, setEditingRating] = useState<RatingRecord | null>(null);
    const [ratingForm, setRatingForm] = useState({ rating: 1200 });
    const [generateOpen, setGenerateOpen] = useState(false);
    const [generateForm, setGenerateForm] = useState({ season_id: 0, tier_id: 0, region_id: 0 });
    const [saving, setSaving] = useState(false);

    const loadSection = useCallback(async (section?: SectionId) => {
        if (!section) return;
        setLoading(true);
        try {
            if (section === 'competitions') setTiers((await competitionService.competitions()).data);
            if (section === 'seasons') setSeasons((await competitionService.seasons()).data);
            if (section === 'ratings') {
                const response = await competitionService.ratings();
                setRatings(response.data);
                setTiers(response.tiers);
            }
            if (section === 'leaderboards') {
                const response = await competitionService.leaderboards();
                setLeaderboards(response.data);
                setLeaderboardSeasons(response.seasons);
                setLeaderboardTiers(response.tiers);
            }
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not load competition data');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadSection(activeSection);
    }, [activeSection, loadSection]);

    const openSeason = (season?: SeasonRecord) => {
        setEditingSeason(season ?? null);
        setSeasonForm(season ? {
            name: season.name,
            starts_at: season.startsAt.slice(0, 16),
            ends_at: season.endsAt.slice(0, 16),
            status: season.status,
        } : emptySeason);
        setSeasonModalOpen(true);
    };

    const saveSeason = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        try {
            if (editingSeason) await competitionService.updateSeason(editingSeason.id, seasonForm);
            else await competitionService.createSeason(seasonForm);
            setSeasonModalOpen(false);
            await loadSection('seasons');
            showToast('success', `Season ${editingSeason ? 'updated' : 'created'} successfully`);
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not save season');
        } finally {
            setSaving(false);
        }
    };

    const confirmDeleteSeason = async () => {
        if (!deleteSeason) return;
        try {
            await competitionService.deleteSeason(deleteSeason.id);
            setDeleteSeason(null);
            await loadSection('seasons');
            showToast('success', 'Season deleted successfully');
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not delete season');
        }
    };

    const confirmRollover = async () => {
        if (!rolloverSeason) return;
        setSaving(true);
        try {
            const response = await competitionService.rolloverSeason(rolloverSeason.id);
            setRolloverSeason(null);
            await loadSection('seasons');
            showToast('success', 'Season rollover completed', `${response.data.created_eligibilities} player eligibility records carried forward. Ratings were preserved.`);
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not roll over the season');
        } finally {
            setSaving(false);
        }
    };

    const openRating = (rating: RatingRecord) => {
        setEditingRating(rating);
        setRatingForm({ rating: rating.rating });
        setRatingModalOpen(true);
    };

    const saveRating = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!editingRating) return;
        setSaving(true);
        try {
            await competitionService.updateRating(editingRating.id, ratingForm);
            setRatingModalOpen(false);
            await loadSection('ratings');
            showToast('success', 'Player rating updated successfully');
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not update rating');
        } finally {
            setSaving(false);
        }
    };

    const openGenerate = () => {
        const tier = leaderboardTiers[0];
        setGenerateForm({ season_id: leaderboardSeasons[0]?.id ?? 0, tier_id: tier?.id ?? 0, region_id: 0 });
        setGenerateOpen(true);
    };

    const generateLeaderboard = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        try {
            const response = await competitionService.generateLeaderboard({
                season_id: generateForm.season_id,
                tier_id: generateForm.tier_id,
                region_id: generateForm.region_id || null,
            });
            setGenerateOpen(false);
            await loadSection('leaderboards');
            showToast('success', 'Leaderboard generated', `${response.data.created} player standings captured.`);
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not generate leaderboard');
        } finally {
            setSaving(false);
        }
    };

    if (!activeSection) {
        return <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">You do not have permission to view competition management.</div>;
    }

    const competitionColumns: Column<CompetitionTierRecord>[] = [
        { key: 'sequenceNumber', header: '#', align: 'center' },
        { key: 'name', header: 'Competition Tier', sortable: true, render: (tier) => <div><span className="font-semibold text-slate-900 dark:text-white">{tier.name}</span><span className="block font-mono text-[11px] text-slate-400">{tier.code}</span></div> },
        { key: 'scopeType', header: 'Scope', render: (tier) => <Badge variant="info">{tier.scopeType}</Badge> },
        { key: 'regionCount', header: 'Regions', align: 'center' },
        { key: 'playerCount', header: 'Eligible Players', align: 'center' },
        { key: 'isActive', header: 'Status', render: (tier) => <Badge variant={tier.isActive ? 'success' : 'neutral'} dot>{tier.isActive ? 'Active' : 'Inactive'}</Badge> },
    ];
    const seasonColumns: Column<SeasonRecord>[] = [
        { key: 'name', header: 'Season', sortable: true, render: (season) => <span className="font-semibold text-slate-900 dark:text-white">{season.name}</span> },
        { key: 'startsAt', header: 'Starts', render: (season) => new Date(season.startsAt).toLocaleDateString() },
        { key: 'endsAt', header: 'Ends', render: (season) => new Date(season.endsAt).toLocaleDateString() },
        { key: 'status', header: 'Status', render: (season) => statusBadge(season.status) },
        { key: 'playerCount', header: 'Players', align: 'center' },
        { key: 'snapshotCount', header: 'Snapshots', align: 'center' },
    ];
    if (can('seasons.update') || can('seasons.delete')) seasonColumns.push({ key: 'actions', header: 'Actions', align: 'right', render: (season) => <div className="flex justify-end gap-1">{can('seasons.update') && season.status === 'scheduled' && <button onClick={() => setRolloverSeason(season)} className="rounded-md p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40" title="Activate with rollover"><RefreshCw className="h-3.5 w-3.5" /></button>}{can('seasons.update') && <button onClick={() => openSeason(season)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800" title="Edit season"><Edit2 className="h-3.5 w-3.5" /></button>}{can('seasons.delete') && <button onClick={() => setDeleteSeason(season)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800" title="Delete season"><Trash2 className="h-3.5 w-3.5" /></button>}</div> });
    const ratingColumns: Column<RatingRecord>[] = [
        { key: 'player', header: 'Player', sortable: true, render: (rating) => <div><span className="font-semibold text-slate-900 dark:text-white">{rating.player}</span><span className="block text-[11px] text-slate-400">{rating.email}</span></div> },
        { key: 'tier', header: 'Tier', sortable: true },
        { key: 'rating', header: 'Rating', sortable: true, render: (rating) => <span className="font-semibold text-indigo-600 dark:text-indigo-300">{rating.rating}</span> },
        { key: 'highestRating', header: 'Peak', align: 'center' },
        { key: 'gamesPlayed', header: 'Games', align: 'center' },
        { key: 'record', header: 'W / D / L', align: 'center', render: (rating) => `${rating.wins} / ${rating.draws} / ${rating.losses}` },
        { key: 'provisional', header: 'Status', render: (rating) => <div className="space-y-1"><Badge variant={rating.provisional ? 'warning' : 'success'}>{rating.provisional ? 'Provisional' : 'Established'}</Badge>{rating.provisional && <span className="block text-[10px] text-slate-400">{rating.provisionalGamesRemaining} games remaining</span>}</div> },
    ];
    if (can('ratings.update')) ratingColumns.push({ key: 'actions', header: 'Actions', align: 'right', render: (rating) => <button onClick={() => openRating(rating)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800" title="Edit rating"><Edit2 className="h-3.5 w-3.5" /></button> });
    const leaderboardColumns: Column<LeaderboardRecord>[] = [
        { key: 'rank', header: 'Rank', sortable: true, align: 'center', render: (row) => <span className="font-bold text-indigo-600 dark:text-indigo-300">#{row.rank}</span> },
        { key: 'player', header: 'Player', sortable: true, render: (row) => <div><span className="font-semibold text-slate-900 dark:text-white">{row.player}</span><span className="block text-[11px] text-slate-400">{row.email}</span></div> },
        { key: 'season', header: 'Season' },
        { key: 'tier', header: 'Tier' },
        { key: 'region', header: 'Region' },
        { key: 'rating', header: 'Rating', sortable: true },
        { key: 'gamesPlayed', header: 'Games', align: 'center' },
        { key: 'calculatedAt', header: 'Calculated', render: (row) => new Date(row.calculatedAt).toLocaleString() },
    ];
    const selectedLeaderboardTier = leaderboardTiers.find((tier) => tier.id === generateForm.tier_id);

    return <div className="space-y-6">
        <PageHeader title="Competition Management" subtitle="Manage the ChessX competition structure, seasons, ratings, and leaderboard history." breadcrumbs={[{ label: 'Competition Management' }]} />
        <Tabs tabs={allowedSections} activeTab={activeSection} variant="pills" onChange={(section) => navigate(`/competition-management/${section}`)} />

        {activeSection === 'competitions' && <DataTable title="Competition Tiers" columns={competitionColumns} data={tiers} keyField="id" isLoading={loading} selectable={false} searchPlaceholder="Search tiers..." emptyTitle="No competition tiers" />}
        {activeSection === 'seasons' && <DataTable title="Seasons" columns={seasonColumns} data={seasons} keyField="id" isLoading={loading} selectable={false} searchPlaceholder="Search seasons..." actions={can('seasons.create') ? <Button size="sm" onClick={() => openSeason()} leftIcon={<Plus className="h-3.5 w-3.5" />}>Create Season</Button> : undefined} emptyTitle="No seasons found" />}
        {activeSection === 'ratings' && <DataTable title="Player Ratings" columns={ratingColumns} data={ratings} keyField="id" isLoading={loading} selectable={false} searchPlaceholder="Search players or tiers..." emptyTitle="No player ratings" />}
        {activeSection === 'leaderboards' && <DataTable title="Leaderboard Snapshots" columns={leaderboardColumns} data={leaderboards} keyField="id" isLoading={loading} selectable={false} searchPlaceholder="Search leaderboard history..." actions={can('leaderboards.generate') ? <Button size="sm" onClick={openGenerate} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>Generate Snapshot</Button> : undefined} emptyTitle="No leaderboard snapshots" />}

        {(can('seasons.create') || can('seasons.update')) && <Modal isOpen={seasonModalOpen} onClose={() => setSeasonModalOpen(false)} title={editingSeason ? 'Edit Season' : 'Create Season'} description="Configure the competition window and lifecycle status.">
            <form onSubmit={saveSeason} className="space-y-4">
                <Input label="Season Name *" value={seasonForm.name} onChange={(event) => setSeasonForm({ ...seasonForm, name: event.target.value })} required />
                <div className="grid gap-4 sm:grid-cols-2"><Input type="datetime-local" label="Starts At *" value={seasonForm.starts_at} onChange={(event) => setSeasonForm({ ...seasonForm, starts_at: event.target.value })} required /><Input type="datetime-local" label="Ends At *" value={seasonForm.ends_at} onChange={(event) => setSeasonForm({ ...seasonForm, ends_at: event.target.value })} required /></div>
                <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status *</span><select className={inputClass} value={seasonForm.status} onChange={(event) => setSeasonForm({ ...seasonForm, status: event.target.value })}><option value="scheduled">Scheduled</option>{editingSeason?.status === 'active' && <option value="active">Active</option>}<option value="completed">Completed</option><option value="cancelled">Cancelled</option></select><span className="block text-[11px] text-slate-400">Use the rollover action to activate a scheduled season safely.</span></label>
                <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setSeasonModalOpen(false)}>Cancel</Button><Button type="submit" isLoading={saving}>{editingSeason ? 'Update Season' : 'Create Season'}</Button></div>
            </form>
        </Modal>}

        {can('seasons.delete') && <ConfirmDialog isOpen={Boolean(deleteSeason)} onClose={() => setDeleteSeason(null)} onConfirm={confirmDeleteSeason} title="Delete Season" message="Leaderboard snapshots will be removed. Seasons with player eligibility records cannot be deleted." />}
        {can('seasons.update') && <ConfirmDialog isOpen={Boolean(rolloverSeason)} onClose={() => setRolloverSeason(null)} onConfirm={confirmRollover} title="Activate New Season" message={`Complete the current season and activate ${rolloverSeason?.name ?? 'this season'}? Player eligibility will carry forward and ratings will continue unchanged.`} confirmText="Start Rollover" isLoading={saving} />}

        {can('ratings.update') && <Modal isOpen={ratingModalOpen} onClose={() => setRatingModalOpen(false)} title="Update Player Rating" description={editingRating ? `${editingRating.player} · ${editingRating.tier}` : undefined}>
            <form onSubmit={saveRating} className="space-y-4"><Input type="number" min={100} max={4000} label="Rating *" value={ratingForm.rating} onChange={(event) => setRatingForm({ rating: Number(event.target.value) })} helperText="Provisional status is calculated automatically from rated games played." required /><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setRatingModalOpen(false)}>Cancel</Button><Button type="submit" isLoading={saving}>Update Rating</Button></div></form>
        </Modal>}

        {can('leaderboards.generate') && <Modal isOpen={generateOpen} onClose={() => setGenerateOpen(false)} title="Generate Leaderboard Snapshot" description="Capture the current ranked standings without replacing earlier snapshots.">
            <form onSubmit={generateLeaderboard} className="space-y-4"><label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Season *</span><select className={inputClass} value={generateForm.season_id} onChange={(event) => setGenerateForm({ ...generateForm, season_id: Number(event.target.value) })} required><option value={0}>Select season</option>{leaderboardSeasons.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}</select></label><label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Competition Tier *</span><select className={inputClass} value={generateForm.tier_id} onChange={(event) => setGenerateForm({ ...generateForm, tier_id: Number(event.target.value), region_id: 0 })} required><option value={0}>Select tier</option>{leaderboardTiers.map((tier) => <option key={tier.id} value={tier.id}>{tier.name}</option>)}</select></label><label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Region</span><select className={inputClass} value={generateForm.region_id} onChange={(event) => setGenerateForm({ ...generateForm, region_id: Number(event.target.value) })}><option value={0}>All regions</option>{selectedLeaderboardTier?.regions?.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}</select></label><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setGenerateOpen(false)}>Cancel</Button><Button type="submit" isLoading={saving} disabled={!generateForm.season_id || !generateForm.tier_id}>Generate Snapshot</Button></div></form>
        </Modal>}
    </div>;
};
