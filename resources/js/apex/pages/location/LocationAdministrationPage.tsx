import { CheckCircle2, ClipboardCheck, MapPinned, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Badge, type BadgeVariant } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { type Column, DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Pagination } from '../../components/ui/Pagination';
import { Tabs } from '../../components/ui/Tabs';
import { useNavigationAccess } from '../../context/NavigationAccessContext';
import { useToast } from '../../context/ToastContext';
import { locationAdministrationService, type LocationChangeRequestRecord } from '../../services/locationAdministrationService';
import { GeographyManagementPanel } from './GeographyManagementPanel';

type SectionId = 'geography' | 'reviews';
type ReviewDecision = 'approved' | 'rejected';
type SearchableLocationRequest = LocationChangeRequestRecord & { searchText: string };

const selectClass =
    'h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-indigo-950';

const locationName = (city: LocationChangeRequestRecord['old_city']) =>
    [city.name, city.state?.name].filter(Boolean).join(', ');

const statusVariant = (status: LocationChangeRequestRecord['status']): BadgeVariant => {
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'danger';
    return 'warning';
};

export const LocationAdministrationPage = () => {
    const { can } = useNavigationAccess();
    const { showToast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();
    const allowedSections = useMemo(
        () =>
            [
                can('geography.read') && {
                    id: 'geography' as SectionId,
                    label: 'Geography',
                    icon: <MapPinned className="h-4 w-4" />,
                },
                can('player_locations.read') && {
                    id: 'reviews' as SectionId,
                    label: 'Location Reviews',
                    icon: <ClipboardCheck className="h-4 w-4" />,
                },
            ].filter(Boolean) as { id: SectionId; label: string; icon: React.ReactNode }[],
        [can],
    );
    const requestedSection = location.pathname.split('/').filter(Boolean).at(-1) as SectionId;
    const activeSection = allowedSections.some((section) => section.id === requestedSection)
        ? requestedSection
        : allowedSections[0]?.id;

    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<LocationChangeRequestRecord[]>([]);
    const [status, setStatus] = useState('pending');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRequests, setTotalRequests] = useState(0);
    const [reviewing, setReviewing] = useState<LocationChangeRequestRecord | null>(null);
    const [decision, setDecision] = useState<ReviewDecision>('approved');
    const [reviewReason, setReviewReason] = useState('');
    const [saving, setSaving] = useState(false);

    const loadRequests = useCallback(
        async (requestStatus: string, requestedPage: number) => {
            setLoading(true);
            try {
                const response = await locationAdministrationService.changeRequests(requestStatus, requestedPage);
                setRequests(response.data);
                setPage(response.pagination.page);
                setTotalPages(response.pagination.totalPages);
                setTotalRequests(response.pagination.total);
            } catch (error) {
                showToast('error', error instanceof Error ? error.message : 'Could not load location-change requests.');
            } finally {
                setLoading(false);
            }
        },
        [showToast],
    );

    useEffect(() => {
        if (activeSection === 'reviews') void loadRequests(status, page);
    }, [activeSection, loadRequests, page, status]);

    const openReview = (request: LocationChangeRequestRecord) => {
        setReviewing(request);
        setDecision('approved');
        setReviewReason('');
    };

    const submitReview = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!reviewing || !reviewReason.trim()) return;

        setSaving(true);
        try {
            await locationAdministrationService.review(reviewing.id, decision, reviewReason.trim());
            setReviewing(null);
            await loadRequests(status, page);
            showToast('success', `Location request ${decision}.`);
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Could not review this request.');
        } finally {
            setSaving(false);
        }
    };

    if (!activeSection) return <Navigate to="/" replace />;

    const searchableRequests: SearchableLocationRequest[] = requests.map((request) => ({
        ...request,
        searchText: [
            request.user.name,
            request.user.email,
            locationName(request.old_city),
            locationName(request.new_city),
            request.reason,
        ]
            .filter(Boolean)
            .join(' '),
    }));

    const requestColumns: Column<SearchableLocationRequest>[] = [
        {
            key: 'player',
            header: 'Player',
            sortable: true,
            render: (request) => (
                <div>
                    <span className="font-semibold text-slate-900 dark:text-white">{request.user.name}</span>
                    <span className="block text-[11px] text-slate-400">{request.user.email}</span>
                </div>
            ),
        },
        { key: 'old_city', header: 'Current Location', render: (request) => locationName(request.old_city) },
        { key: 'new_city', header: 'Requested Location', render: (request) => locationName(request.new_city) },
        {
            key: 'requested_at',
            header: 'Requested',
            sortable: true,
            render: (request) => new Date(request.requested_at).toLocaleString(),
        },
        {
            key: 'status',
            header: 'Status',
            render: (request) => (
                <Badge variant={statusVariant(request.status)} dot>
                    {request.status}
                </Badge>
            ),
        },
    ];

    if (can('player_locations.review')) {
        requestColumns.push({
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (request) =>
                request.status === 'pending' ? (
                    <Button size="sm" variant="outline" onClick={() => openReview(request)}>
                        Review
                    </Button>
                ) : (
                    <span className="text-[11px] text-slate-400">Reviewed</span>
                ),
        });
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Geography & Player Locations"
                subtitle="Browse supported locations and review player home-city change requests."
                breadcrumbs={[{ label: 'Location Management' }]}
            />

            <Tabs
                tabs={allowedSections}
                activeTab={activeSection}
                variant="pills"
                onChange={(section) => navigate(`/location-management/${section}`)}
            />

            {activeSection === 'geography' && <GeographyManagementPanel />}

            {activeSection === 'reviews' && (
                <div className="space-y-3">
                    <DataTable
                        title={`Location Change Requests (${totalRequests})`}
                        columns={requestColumns}
                        data={searchableRequests}
                        keyField="id"
                        isLoading={loading}
                        initialPageSize={20}
                        selectable={false}
                        searchPlaceholder="Search players or locations..."
                        emptyTitle="No location requests"
                        emptyDescription="There are no requests matching the selected status."
                        customFilters={
                            <select
                                aria-label="Request status"
                                className={selectClass}
                                value={status}
                                onChange={(event) => {
                                    setStatus(event.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="all">All statuses</option>
                            </select>
                        }
                    />
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onChange={setPage}
                        className="justify-end"
                    />
                </div>
            )}

            {can('player_locations.review') && (
                <Modal
                    isOpen={Boolean(reviewing)}
                    onClose={() => setReviewing(null)}
                    title="Review Location Change"
                    description={
                        reviewing
                            ? `${reviewing.user.name}: ${locationName(reviewing.old_city)} → ${locationName(reviewing.new_city)}`
                            : undefined
                    }
                >
                    <form className="space-y-4" onSubmit={submitReview}>
                        {reviewing?.reason && (
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                                <span className="font-semibold">Player reason:</span> {reviewing.reason}
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
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Review reason *
                            </span>
                            <textarea
                                required
                                maxLength={500}
                                rows={4}
                                value={reviewReason}
                                onChange={(event) => setReviewReason(event.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-950"
                                placeholder="Record why this request was approved or rejected."
                            />
                            <span className="block text-[11px] text-slate-400">This reason is retained in the audit log.</span>
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
                                {decision === 'approved' ? 'Approve Request' : 'Reject Request'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};
