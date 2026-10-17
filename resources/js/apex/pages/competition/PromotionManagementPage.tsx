import { ArrowUpCircle, CheckCircle2, Settings2, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Badge, type BadgeVariant } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { type Column, DataTable } from '../../components/ui/DataTable';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Pagination } from '../../components/ui/Pagination';
import { Tabs } from '../../components/ui/Tabs';
import { useNavigationAccess } from '../../context/NavigationAccessContext';
import { useToast } from '../../context/ToastContext';
import {
    promotionService,
    type PromotionRecord,
    type PromotionRecordStatus,
    type PromotionRulePayload,
    type PromotionRuleRecord,
} from '../../services/promotionService';

type SectionId = 'rules' | 'records';
type ReviewDecision = 'approved' | 'rejected';
type SearchablePromotion = PromotionRecord & { searchText: string };

const selectClass =
    'h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-indigo-950';

const checkboxClass =
    'h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900';

const toLocalInput = (value: string | null) => (value ? value.slice(0, 16) : '');

const statusVariant = (status: PromotionRecordStatus): BadgeVariant => {
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'danger';
    if (status === 'qualified') return 'info';
    return 'warning';
};

export const PromotionManagementPage = () => {
    const { can } = useNavigationAccess();
    const { showToast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();
    const allowedSections = useMemo(
        () =>
            can('promotions.read')
                ? [
                      { id: 'rules' as SectionId, label: 'Promotion Rules', icon: <Settings2 className="h-4 w-4" /> },
                      { id: 'records' as SectionId, label: 'Player Promotions', icon: <ArrowUpCircle className="h-4 w-4" /> },
                  ]
                : [],
        [can],
    );
    const requestedSection = location.pathname.split('/').filter(Boolean).at(-1) as SectionId;
    const activeSection = allowedSections.some((section) => section.id === requestedSection)
        ? requestedSection
        : allowedSections[0]?.id;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [rules, setRules] = useState<PromotionRuleRecord[]>([]);
    const [records, setRecords] = useState<PromotionRecord[]>([]);
    const [status, setStatus] = useState('qualified');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [editingRule, setEditingRule] = useState<PromotionRuleRecord | null>(null);
    const [ruleForm, setRuleForm] = useState<PromotionRulePayload | null>(null);
    const [reviewing, setReviewing] = useState<PromotionRecord | null>(null);
    const [decision, setDecision] = useState<ReviewDecision>('approved');
    const [reviewReason, setReviewReason] = useState('');

    const loadRules = useCallback(async () => {
        setLoading(true);
        try {
            setRules((await promotionService.rules()).data);
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not load promotion rules.');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const loadRecords = useCallback(
        async (recordStatus: string, requestedPage: number) => {
            setLoading(true);
            try {
                const response = await promotionService.records(recordStatus, requestedPage);
                setRecords(response.data);
                setPage(response.pagination.page);
                setTotalPages(response.pagination.totalPages);
                setTotalRecords(response.pagination.total);
            } catch (error) {
                showToast('error', error instanceof Error ? error.message : 'Could not load promotion records.');
            } finally {
                setLoading(false);
            }
        },
        [showToast],
    );

    useEffect(() => {
        if (activeSection === 'rules') void loadRules();
        if (activeSection === 'records') void loadRecords(status, page);
    }, [activeSection, loadRecords, loadRules, page, status]);

    const openRule = (rule: PromotionRuleRecord) => {
        setEditingRule(rule);
        setRuleForm({
            min_rating: rule.minRating,
            min_games: rule.minGames,
            rating_threshold_enabled: rule.ratingThresholdEnabled,
            qualification_required: rule.qualificationRequired,
            effective_from: toLocalInput(rule.effectiveFrom),
            effective_until: toLocalInput(rule.effectiveUntil) || null,
            is_active: rule.isActive,
        });
    };

    const saveRule = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!editingRule || !ruleForm) return;

        setSaving(true);
        try {
            await promotionService.updateRule(editingRule.id, ruleForm);
            setEditingRule(null);
            setRuleForm(null);
            await loadRules();
            showToast('success', 'Promotion rule updated successfully.');
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not update the promotion rule.');
        } finally {
            setSaving(false);
        }
    };

    const openReview = (record: PromotionRecord) => {
        setReviewing(record);
        setDecision('approved');
        setReviewReason('');
    };

    const submitReview = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!reviewing || !reviewReason.trim()) return;

        setSaving(true);
        try {
            await promotionService.review(reviewing.id, decision, reviewReason.trim());
            setReviewing(null);
            await loadRecords(status, page);
            showToast('success', `Player promotion ${decision}.`);
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not review this promotion.');
        } finally {
            setSaving(false);
        }
    };

    if (!activeSection) return <Navigate to="/" replace />;

    const ruleColumns: Column<PromotionRuleRecord>[] = [
        {
            key: 'path',
            header: 'Promotion Path',
            render: (rule) => (
                <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                        {rule.fromTier.name} → {rule.toTier.name}
                    </span>
                    <span className="block font-mono text-[11px] text-slate-400">
                        {rule.fromTier.code} → {rule.toTier.code}
                    </span>
                </div>
            ),
        },
        { key: 'minGames', header: 'Minimum Games', align: 'center' },
        {
            key: 'minRating',
            header: 'Rating Requirement',
            render: (rule) => (rule.ratingThresholdEnabled ? rule.minRating : <span className="text-slate-400">Disabled</span>),
        },
        {
            key: 'qualificationRequired',
            header: 'Qualifier',
            render: (rule) => (
                <Badge variant={rule.qualificationRequired ? 'warning' : 'neutral'}>
                    {rule.qualificationRequired ? 'Required' : 'Not required'}
                </Badge>
            ),
        },
        {
            key: 'isActive',
            header: 'Status',
            render: (rule) => (
                <Badge variant={rule.isActive ? 'success' : 'neutral'} dot>
                    {rule.isActive ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
    ];

    if (can('promotions.update')) {
        ruleColumns.push({
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (rule) => (
                <Button size="sm" variant="outline" onClick={() => openRule(rule)}>
                    Edit Rule
                </Button>
            ),
        });
    }

    const searchableRecords: SearchablePromotion[] = records.map((record) => ({
        ...record,
        searchText: [
            record.player.name,
            record.player.email,
            record.player.username,
            record.fromTier.name,
            record.toTier.name,
            record.season?.name,
        ]
            .filter(Boolean)
            .join(' '),
    }));

    const recordColumns: Column<SearchablePromotion>[] = [
        {
            key: 'player',
            header: 'Player',
            sortable: true,
            render: (record) => (
                <div>
                    <span className="font-semibold text-slate-900 dark:text-white">{record.player.name}</span>
                    <span className="block text-[11px] text-slate-400">
                        @{record.player.username} · {record.player.email}
                    </span>
                </div>
            ),
        },
        { key: 'path', header: 'Promotion', render: (record) => `${record.fromTier.name} → ${record.toTier.name}` },
        { key: 'season', header: 'Season', render: (record) => record.season?.name ?? 'No season' },
        { key: 'ratingAtQualification', header: 'Rating', align: 'center' },
        { key: 'gamesAtQualification', header: 'Games', align: 'center' },
        {
            key: 'status',
            header: 'Status',
            render: (record) => (
                <Badge variant={statusVariant(record.status)} dot>
                    {record.status}
                </Badge>
            ),
        },
    ];

    if (can('promotions.review')) {
        recordColumns.push({
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (record) =>
                record.status === 'qualified' ? (
                    <Button size="sm" variant="outline" onClick={() => openReview(record)}>
                        Review
                    </Button>
                ) : (
                    <span className="text-[11px] text-slate-400">No action</span>
                ),
        });
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Promotion Management"
                subtitle="Configure staged league progression and review qualified players."
                breadcrumbs={[{ label: 'Competition Management' }, { label: 'Promotions' }]}
            />

            <Tabs
                tabs={allowedSections}
                activeTab={activeSection}
                variant="pills"
                onChange={(section) => navigate(`/promotion-management/${section}`)}
            />

            {activeSection === 'rules' && (
                <DataTable
                    title="League Promotion Rules"
                    columns={ruleColumns}
                    data={rules}
                    keyField="id"
                    isLoading={loading}
                    selectable={false}
                    searchPlaceholder="Search promotion paths..."
                    emptyTitle="No promotion rules"
                    emptyDescription="Seed the staged promotion rules before configuring progression."
                />
            )}

            {activeSection === 'records' && (
                <div className="space-y-3">
                    <DataTable
                        title={`Player Promotions (${totalRecords})`}
                        columns={recordColumns}
                        data={searchableRecords}
                        keyField="id"
                        isLoading={loading}
                        initialPageSize={20}
                        selectable={false}
                        searchPlaceholder="Search players or leagues..."
                        emptyTitle="No promotion records"
                        emptyDescription="No player promotions match the selected status."
                        customFilters={
                            <select
                                aria-label="Promotion status"
                                className={selectClass}
                                value={status}
                                onChange={(event) => {
                                    setStatus(event.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="qualified">Qualified</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="all">All statuses</option>
                            </select>
                        }
                    />
                    <Pagination page={page} totalPages={totalPages} onChange={setPage} className="justify-end" />
                </div>
            )}

            {can('promotions.update') && ruleForm && (
                <Modal
                    isOpen={Boolean(editingRule)}
                    onClose={() => setEditingRule(null)}
                    title="Edit Promotion Rule"
                    description={editingRule ? `${editingRule.fromTier.name} → ${editingRule.toTier.name}` : undefined}
                >
                    <form className="space-y-4" onSubmit={saveRule}>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input
                                type="number"
                                min={1}
                                max={10000}
                                label="Minimum Games *"
                                value={ruleForm.min_games}
                                onChange={(event) => setRuleForm({ ...ruleForm, min_games: Number(event.target.value) })}
                                required
                            />
                            <Input
                                type="number"
                                min={100}
                                max={4000}
                                label="Minimum Rating *"
                                value={ruleForm.min_rating}
                                onChange={(event) => setRuleForm({ ...ruleForm, min_rating: Number(event.target.value) })}
                                disabled={!ruleForm.rating_threshold_enabled}
                                required
                            />
                        </div>
                        <div className="grid gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700 sm:grid-cols-3">
                            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <input
                                    type="checkbox"
                                    className={checkboxClass}
                                    checked={ruleForm.rating_threshold_enabled}
                                    onChange={(event) => setRuleForm({ ...ruleForm, rating_threshold_enabled: event.target.checked })}
                                />
                                Rating threshold
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <input
                                    type="checkbox"
                                    className={checkboxClass}
                                    checked={ruleForm.qualification_required}
                                    onChange={(event) => setRuleForm({ ...ruleForm, qualification_required: event.target.checked })}
                                />
                                Tournament qualifier
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <input
                                    type="checkbox"
                                    className={checkboxClass}
                                    checked={ruleForm.is_active}
                                    onChange={(event) => setRuleForm({ ...ruleForm, is_active: event.target.checked })}
                                />
                                Rule active
                            </label>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input
                                type="datetime-local"
                                label="Effective From *"
                                value={ruleForm.effective_from}
                                onChange={(event) => setRuleForm({ ...ruleForm, effective_from: event.target.value })}
                                required
                            />
                            <Input
                                type="datetime-local"
                                label="Effective Until"
                                value={ruleForm.effective_until ?? ''}
                                onChange={(event) => setRuleForm({ ...ruleForm, effective_until: event.target.value || null })}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setEditingRule(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" isLoading={saving}>
                                Save Rule
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            {can('promotions.review') && (
                <Modal
                    isOpen={Boolean(reviewing)}
                    onClose={() => setReviewing(null)}
                    title="Review Player Promotion"
                    description={
                        reviewing
                            ? `${reviewing.player.name}: ${reviewing.fromTier.name} → ${reviewing.toTier.name}`
                            : undefined
                    }
                >
                    <form className="space-y-4" onSubmit={submitReview}>
                        {reviewing && (
                            <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800/60">
                                <div>
                                    <span className="block text-xs text-slate-400">Qualified rating</span>
                                    <strong className="text-slate-900 dark:text-white">{reviewing.ratingAtQualification}</strong>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-400">Games played</span>
                                    <strong className="text-slate-900 dark:text-white">{reviewing.gamesAtQualification}</strong>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setDecision('approved')}
                                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-semibold ${
                                    decision === 'approved'
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                        : 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400'
                                }`}
                            >
                                <CheckCircle2 className="h-4 w-4" /> Approve
                            </button>
                            <button
                                type="button"
                                onClick={() => setDecision('rejected')}
                                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-semibold ${
                                    decision === 'rejected'
                                        ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                        : 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400'
                                }`}
                            >
                                <XCircle className="h-4 w-4" /> Reject
                            </button>
                        </div>
                        <label className="block space-y-1.5">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Review reason *</span>
                            <textarea
                                required
                                maxLength={500}
                                rows={4}
                                value={reviewReason}
                                onChange={(event) => setReviewReason(event.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-950"
                                placeholder="Record the reason for this decision."
                            />
                            <span className="block text-[11px] text-slate-400">This decision and reason are retained in the audit log.</span>
                        </label>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setReviewing(null)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant={decision === 'approved' ? 'success' : 'danger'}
                                isLoading={saving}
                                disabled={!reviewReason.trim()}
                            >
                                {decision === 'approved' ? 'Approve Promotion' : 'Reject Promotion'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};
